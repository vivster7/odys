import {
  createSlice,
  CaseReducer,
  PayloadAction,
  SerializedError,
  createAsyncThunk,
} from '@reduxjs/toolkit';

import {
  startDragFn,
  dragFn,
  DragState,
  endDrag,
  endDragPending,
} from 'modules/draw/shape/mixins/drag/drag.reducer';
import {
  deleteDrawings,
  deleteDrawingsPending,
} from 'modules/draw/mixins/delete/delete.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import {
  startResizeFn,
  resizeFn,
  ResizeState,
  endResizePending,
  endResize,
} from 'modules/draw/shape/mixins/resize/resize.reducer';
import {
  cancelSelectFn,
  selectDrawing,
  selectDrawingPending,
  SelectedState,
  selectClickTargetFn,
} from 'modules/draw/mixins/select/select.reducer';
import {
  endNewRectByClick,
  NewRectState,
  startNewRectFn,
  endNewRectByDragFn,
  endNewRectByClickPending,
} from 'modules/draw/shape/newRect.reducer';
import {
  startDragSelectionFn,
  resizeDragSelectionFn,
  endDragSelectionFn,
  MultiSelectState,
  selectAllFn,
} from 'modules/draw/mixins/multiSelect/multiSelect.reducer';
import {
  editTextFn,
  endEditText,
  endEditTextPending,
  EditTextState,
  startEditTextFn,
} from './mixins/editText/editText.reducer';
import {
  fetchArrows,
  fetchArrowsFulfilled,
  Arrow,
  instanceOfArrow,
  drawArrow,
  drawArrowPending,
} from 'modules/draw/arrow/arrow.reducer';
import {
  fetchShapes,
  fetchShapesFulfilled,
  Shape,
} from 'modules/draw/shape/shape.reducer';
import { save, saveFulfilled, saveRejected } from './mixins/save/save.reducer';
import {
  TimeTravelState,
  safeUpdateDrawings,
  safeDeleteDrawingsPending,
  safeDeleteDrawings,
  safeUpdateDrawingsPending,
} from 'modules/draw/timetravel/timeTravel';
import { undo, undoFulfilled } from './timetravel/undo.reducer';
import { redo, redoFulfilled } from './timetravel/redo.reducer';
import {
  CopyPasteState,
  copyFn,
  pastePending,
  paste,
  pasteFulfilled,
  cut,
  cutPending,
  cutFulfilled,
} from './mixins/copypaste/copypaste.reducer';
import { RootState } from 'App';

export type DrawReducer<T = void> = CaseReducer<DrawState, PayloadAction<T>>;
export type ActionPending<T = void> = {
  type: string;
  payload: undefined;
  meta: { requestId: string; arg: T };
};
export type ActionFulfilled<T = void, S = void> = {
  type: string;
  payload: Promise<S>;
  meta: { requestId: string; arg: T };
};
export type ActionRejected<T = void> = {
  type: string;
  payload: undefined;
  error: SerializedError | any;
  meta: { requestId: string; arg: T };
};

export type DrawActionPending<T = void> = (
  state: DrawState,
  action: ActionPending<T>
) => void;

export type DrawActionFulfilled<T = void, S = void> = (
  state: DrawState,
  action: ActionFulfilled<T, S>
) => void;
export type DrawActionRejected<T = void> = (
  state: DrawState,
  action: ActionRejected<T>
) => void;

export interface ShapeData {
  [id: string]: Shape;
}

export interface ArrowData {
  [id: string]: Arrow;
}

export interface DrawState {
  shapes: ShapeData;
  arrows: ArrowData;
  drawOrder: string[];
  editText: EditTextState;
  select: SelectedState | null;
  drag: DragState | null;
  multiSelect: MultiSelectState | null;
  resize: ResizeState | null;
  newRect: NewRectState | null;
  timetravel: TimeTravelState;
  copyPaste: CopyPasteState;
}

const initialState: DrawState = {
  shapes: {},
  arrows: {},
  drawOrder: [],
  editText: { startingText: '', isEditing: false },
  select: null,
  multiSelect: null,
  drag: null,
  resize: null,
  newRect: null,
  timetravel: { undos: [], redos: [] },
  copyPaste: {
    copied: [],
    pasted: [],
    cut: [],
    numTimesPasted: 0,
    isCut: false,
  },
};

export type Drawing = Arrow | Shape;

export function getDrawing(state: DrawState, id: string): Drawing {
  const drawing = state.shapes[id] ?? state.arrows[id];
  if (!drawing) {
    throw new Error(`Cannot find drawing with ${id}`);
  }
  return drawing;
}

export function getDrawings(state: DrawState, ids: string[]): Drawing[] {
  return ids.map((id) => getDrawing(state, id));
}

export const fetchDrawings = createAsyncThunk(
  'draw/fetchDrawings',
  async (boardId: string, thunkAPI) => {
    await thunkAPI.dispatch(fetchShapes(boardId));
    await thunkAPI.dispatch(fetchArrows(boardId));
  }
);

export const updateDrawingFn: DrawReducer<Drawing> = (state, action) => {
  // be wary of adding undo/redo buffer to this fn
  // they sync changes from socket updates and need to be synchronous

  const { id } = action.payload;
  const existing = state.shapes[id] ?? state.arrows[id] ?? {};
  const drawing = Object.assign({}, existing, action.payload);

  if (instanceOfArrow(drawing)) {
    state.arrows[drawing.id] = drawing;
  } else {
    state.shapes[drawing.id] = drawing;
  }
  reorder([drawing], state);
};

export const syncDrawingFn: DrawReducer<Drawing> = (state, action) => {
  // be wary of adding undo/redo buffer to this fn
  // they sync changes from socket updates and need to be synchronous
  const synced = { ...action.payload, isLastUpdatedBySync: true };

  action = {
    type: 'draw/updateDrawing',
    payload: synced,
  };
  return updateDrawingFn(state, action);
};

const drawSlice = createSlice({
  name: 'draw',
  initialState: initialState,
  reducers: {
    // shape
    updateDrawing: updateDrawingFn,
    syncDrawing: syncDrawingFn,
    // editText
    startEditText: startEditTextFn,
    editText: editTextFn,
    // select
    cancelSelect: cancelSelectFn,
    selectClickTarget: selectClickTargetFn,
    // drag
    startDrag: startDragFn,
    drag: dragFn,
    // resize
    startResize: startResizeFn,
    resize: resizeFn,
    // newRect
    startNewRect: startNewRectFn,
    endNewRectByDrag: endNewRectByDragFn,
    // multiSelect
    startDragSelection: startDragSelectionFn,
    resizeDragSelection: resizeDragSelectionFn,
    endDragSelection: endDragSelectionFn,
    selectAll: selectAllFn,
    // copypaste
    copy: copyFn,
  },
  extraReducers: {
    // drawing
    [fetchDrawings.pending as any]: (state, action) => {},
    [fetchDrawings.fulfilled as any]: (state, action) => {},
    [fetchDrawings.rejected as any]: (state, action) => {},
    //save
    [save.pending as any]: (state, action) => {},
    [save.fulfilled as any]: saveFulfilled,
    [save.rejected as any]: saveRejected,
    // shape
    [fetchShapes.pending as any]: (state, action) => {},
    [fetchShapes.fulfilled as any]: fetchShapesFulfilled,
    [fetchShapes.rejected as any]: (state, action) => {},
    // arrow
    [fetchArrows.pending as any]: (state, action) => {},
    [fetchArrows.fulfilled as any]: fetchArrowsFulfilled,
    [fetchArrows.rejected as any]: (state, action) => {},
    [drawArrow.pending as any]: drawArrowPending,
    [drawArrow.fulfilled as any]: (state, action) => {},
    [drawArrow.rejected as any]: (state, action) => {},
    // drag
    [endDrag.pending as any]: endDragPending,
    [endDrag.fulfilled as any]: (state, action) => {},
    [endDrag.rejected as any]: (state, action) => {},
    // resize
    [endResize.pending as any]: endResizePending,
    [endResize.fulfilled as any]: (state, action) => {},
    [endResize.rejected as any]: (state, action) => {},
    // newRect
    [endNewRectByClick.pending as any]: endNewRectByClickPending,
    [endNewRectByClick.fulfilled as any]: (state, action) => {},
    [endNewRectByClick.rejected as any]: (state, action) => {},
    // delete
    [deleteDrawings.pending as any]: deleteDrawingsPending,
    [deleteDrawings.fulfilled as any]: (state, action) => {},
    [deleteDrawings.rejected as any]: (state, action) => {},
    // timetravel
    [undo.pending as any]: (state, action) => {},
    [undo.fulfilled as any]: undoFulfilled,
    [undo.rejected as any]: (state, action) => {},
    [redo.pending as any]: (state, action) => {},
    [redo.fulfilled as any]: redoFulfilled,
    [redo.rejected as any]: (state, action) => {},
    [safeUpdateDrawings.pending as any]: safeUpdateDrawingsPending,
    [safeUpdateDrawings.fulfilled as any]: (state, action) => {},
    [safeUpdateDrawings.rejected as any]: (state, action) => {},
    [safeDeleteDrawings.pending as any]: safeDeleteDrawingsPending,
    [safeDeleteDrawings.fulfilled as any]: (state, action) => {},
    [safeDeleteDrawings.rejected as any]: (state, action) => {},
    // editText
    [endEditText.pending as any]: endEditTextPending,
    [endEditText.fulfilled as any]: (state, action) => {},
    [endEditText.rejected as any]: (state, action) => {},
    // select
    [selectDrawing.pending as any]: selectDrawingPending,
    [selectDrawing.rejected as any]: (state, action) => {},
    [selectDrawing.fulfilled as any]: (state, action) => {},
    // copypaste
    [paste.pending as any]: pastePending,
    [paste.rejected as any]: (state, action) => {},
    [paste.fulfilled as any]: pasteFulfilled,
    [cut.pending as any]: cutPending,
    [cut.rejected as any]: (state, action) => {},
    [cut.fulfilled as any]: cutFulfilled,
    //global
    'global/syncState': (state, action: any) => {
      const rootState = action.payload.data as RootState;
      const drawState = rootState.draw;
      state.arrows = drawState.arrows;
      state.drag = drawState.drag;
      state.multiSelect = drawState.multiSelect;
      state.resize = drawState.resize;
      state.select = drawState.select;
      state.shapes = drawState.shapes;
    },
  },
});

export const {
  updateDrawing,
  syncDrawing,
  startEditText,
  editText,
  cancelSelect,
  startDrag,
  drag,
  startResize,
  resize,
  startNewRect,
  endNewRectByDrag,
  startDragSelection,
  resizeDragSelection,
  endDragSelection,
  selectAll,
  selectClickTarget,
  copy,
} = drawSlice.actions;
const drawReducer = drawSlice.reducer;
export default drawReducer;
