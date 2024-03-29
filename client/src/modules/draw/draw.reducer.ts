import {
  createSlice,
  CaseReducer,
  PayloadAction,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import * as jdp from 'jsondiffpatch';

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
  selectDrawingFn,
  SelectedState,
  selectClickTargetFn,
} from 'modules/draw/mixins/select/select.reducer';
import {
  endNewRectByClick,
  NewRectState,
  startNewRectFn,
  endNewRectByClickPending,
} from 'modules/draw/shape/newRect.reducer';
import {
  startDragSelectionFn,
  resizeDragSelectionFn,
  endDragSelectionFn,
  MultiSelectState,
  selectAllFn,
  applySelect,
} from 'modules/draw/mixins/multiSelect/multiSelect.reducer';
import {
  endEditText,
  endEditTextPending,
  EditTextState,
  startEditTextFn,
  editText,
  editTextPending,
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
import {
  save,
  saveFulfilled,
  saveRejected,
  saveDelete,
  saveDeleteFulfilled,
  saveDeleteRejected,
} from './mixins/save/save.reducer';
import {
  TimeTravelState,
  safeUpdateDrawings,
  safeDeleteDrawingsPending,
  safeDeleteDrawings,
  safeUpdateDrawingsPending,
  TimeTravelSafeAction,
} from 'modules/draw/timetravel/timeTravel';
import { undo, undoFulfilled } from './timetravel/undo.reducer';
import { redo, redoFulfilled } from './timetravel/redo.reducer';
import { paste, cut, copy } from './mixins/copypaste/copypaste.reducer';
import { RootState } from 'App';
import { uniq, compact } from 'lodash';
import {
  createGroup,
  createGroupPending,
  ungroup,
  ungroupPending,
} from './shape/group.reducer';
import { ActionPending, ActionFulfilled, ActionRejected } from 'global/redux';
import { centerCanvas } from 'modules/canvas/canvas.reducer';
import {
  ArrowPositionState,
  positionArrowsFn,
} from './arrowposition/arrowPosition.reducer';

export type DrawReducer<T = void> = CaseReducer<DrawState, PayloadAction<T>>;

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

type LoadStates = 'loading' | 'success' | 'failed';
export interface DrawState {
  shapes: ShapeData;
  arrows: ArrowData;
  arrowPositions: ArrowPositionState;
  drawOrder: string[];
  editText: EditTextState | null;
  select: SelectedState | null;
  drag: DragState | null;
  multiSelect: MultiSelectState | null;
  resize: ResizeState | null;
  newRect: NewRectState | null;
  timetravel: TimeTravelState;
  loaded: LoadStates;
}

const initialState: DrawState = {
  shapes: {},
  arrows: {},
  arrowPositions: {},
  drawOrder: [],
  editText: null,
  select: null,
  multiSelect: null,
  drag: null,
  resize: null,
  newRect: null,
  timetravel: { undos: [], redos: [] },
  loaded: 'loading',
};

export type Drawing = Arrow | Shape;

export function getDrawing(state: DrawState, id: string): Drawing | null {
  const drawing = state.shapes[id] ?? state.arrows[id];
  if (!drawing) {
    console.error(`Cannot find drawing with ${id}`);
    return null;
  }
  return drawing;
}

export function getDrawings(state: DrawState, ids: string[]): Drawing[] {
  return ids
    .map((id) => getDrawing(state, id))
    .filter((d): d is Drawing => d !== null);
}

export const fetchDrawings = createAsyncThunk(
  'draw/fetchDrawings',
  async (boardId: string, thunkAPI) => {
    await thunkAPI.dispatch(fetchShapes(boardId));
    await thunkAPI.dispatch(fetchArrows(boardId));
    await thunkAPI.dispatch(centerCanvas());
  }
);

export const fetchDrawingsRejected: DrawActionFulfilled<string> = (
  state,
  action
) => {
  state.loaded = 'failed';
};

export const fetchDrawingsFulfilled: DrawActionFulfilled<string> = (
  state,
  action
) => {
  state.loaded = 'success';
};

export const updateDrawings = createAsyncThunk(
  'draw/updateDrawings',
  async (drawings: Drawing[], thunkAPI) => {
    thunkAPI.dispatch(save(drawings.map((d) => d.id)));
  }
);

export const updateDrawingsPending: DrawActionPending<Drawing[]> = (
  state,
  action
) => {
  const updates: Drawing[] = action.meta.arg;
  const drawings: Drawing[] = updates.map((update) => {
    const { id = '' } = update;
    const existing: Drawing = state.shapes[id] ?? state.arrows[id] ?? {};
    return { ...existing, ...update };
  });

  drawings.forEach((d) => {
    if (instanceOfArrow(d)) {
      state.arrows[d.id] = d;
    } else {
      state.shapes[d.id] = d;
    }
  });
  reorder(drawings, state);
  applySelect(state, drawings);

  const arrows = drawings.filter(instanceOfArrow);
  positionArrowsFn(state, { type: 'draw/positionArrows', payload: arrows });

  const undo: TimeTravelSafeAction = {
    actionCreatorName: 'safeDeleteDrawings',
    arg: drawings.map((d) => d.id),
  };
  const redo: TimeTravelSafeAction = {
    actionCreatorName: 'safeUpdateDrawings',
    arg: { drawings },
  };
  state.timetravel.undos.push({ undo, redo });
  state.timetravel.redos = [];
};

const drawSlice = createSlice({
  name: 'draw',
  initialState: initialState,
  reducers: {
    // arrowPosition
    positionArrows: positionArrowsFn,
    // editText
    startEditText: startEditTextFn,
    // select
    cancelSelect: cancelSelectFn,
    selectClickTarget: selectClickTargetFn,
    selectDrawing: selectDrawingFn,
    // drag
    startDrag: startDragFn,
    drag: dragFn,
    // resize
    startResize: startResizeFn,
    resize: resizeFn,
    // newRect
    startNewRect: startNewRectFn,
    // multiSelect
    startDragSelection: startDragSelectionFn,
    resizeDragSelection: resizeDragSelectionFn,
    endDragSelection: endDragSelectionFn,
    selectAll: selectAllFn,
  },
  extraReducers: {
    // drawing
    [fetchDrawings.pending as any]: (state, action) => {},
    [fetchDrawings.fulfilled as any]: fetchDrawingsFulfilled,
    [fetchDrawings.rejected as any]: fetchDrawingsRejected,
    [updateDrawings.pending as any]: updateDrawingsPending,
    [updateDrawings.fulfilled as any]: (state, action) => {},
    [updateDrawings.rejected as any]: (state, action) => {},
    //save
    [save.pending as any]: (state, action) => {},
    [save.fulfilled as any]: saveFulfilled,
    [save.rejected as any]: saveRejected,
    [saveDelete.pending as any]: (state, action) => {},
    [saveDelete.fulfilled as any]: saveDeleteFulfilled,
    [saveDelete.rejected as any]: saveDeleteRejected,
    // shape
    [fetchShapes.pending as any]: (state, action) => {},
    [fetchShapes.fulfilled as any]: fetchShapesFulfilled,
    [fetchShapes.rejected as any]: (state, action) => {},
    [createGroup.pending as any]: createGroupPending,
    [createGroup.fulfilled as any]: (state, action) => {},
    [createGroup.rejected as any]: (state, action) => {},
    [ungroup.pending as any]: ungroupPending,
    [ungroup.fulfilled as any]: (state, action) => {},
    [ungroup.rejected as any]: (state, action) => {},
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
    [editText.pending as any]: editTextPending,
    [editText.fulfilled as any]: (state, action) => {},
    [editText.rejected as any]: (state, action) => {},
    [endEditText.pending as any]: endEditTextPending,
    [endEditText.fulfilled as any]: (state, action) => {},
    [endEditText.rejected as any]: (state, action) => {},
    // copypaste
    [copy.pending as any]: (state, action) => {},
    [copy.rejected as any]: (state, action) => {},
    [copy.fulfilled as any]: (state, action) => {},
    [paste.pending as any]: (state, action) => {},
    [paste.rejected as any]: (state, action) => {},
    [paste.fulfilled as any]: (state, action) => {},
    [cut.pending as any]: (state, action) => {},
    [cut.rejected as any]: (state, action) => {},
    [cut.fulfilled as any]: (state, action) => {},
    //global
    'global/syncState': (state, action: any) => {
      const stateDiff = action.payload.data as Partial<RootState>;

      if (stateDiff.draw) {
        const drawDiff = stateDiff.draw as Partial<DrawState>;
        if (drawDiff.arrows) {
          jdp.patch(state.arrows, drawDiff.arrows);
        }
        if (drawDiff.arrowPositions) {
          jdp.patch(state.arrowPositions, drawDiff.arrowPositions);
        }
        if (drawDiff.shapes) {
          jdp.patch(state.shapes, drawDiff.shapes);
        }
        if (drawDiff.drawOrder) {
          jdp.patch(state.drawOrder, drawDiff.drawOrder);
          // BUG: patch can add a duplicate
          // BUG: patch can add `null`
          state.drawOrder = compact(uniq(state.drawOrder));
        }
      }
    },
  },
});

export const {
  positionArrows,
  startEditText,
  selectDrawing,
  cancelSelect,
  startDrag,
  drag,
  startResize,
  resize,
  startNewRect,
  startDragSelection,
  resizeDragSelection,
  endDragSelection,
  selectAll,
  selectClickTarget,
} = drawSlice.actions;
const drawReducer = drawSlice.reducer;
export default drawReducer;
