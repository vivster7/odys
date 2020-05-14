import {
  createSlice,
  CaseReducer,
  PayloadAction,
  SerializedError,
} from '@reduxjs/toolkit';

import {
  startDragFn,
  dragFn,
  DragState,
  endDragFulfilled,
  endDrag,
  endDragPending,
  endDragRejected,
} from 'modules/draw/shape/mixins/drag/drag.reducer';
import {
  deleteDrawing,
  deleteDrawingPending,
  deleteDrawingFulfilled,
  deleteDrawingRejected,
} from 'modules/draw/mixins/delete/delete.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import {
  startResizeFn,
  resizeFn,
  ResizeState,
  endResizeFulfilled,
  endResizePending,
  endResizeRejected,
  endResize,
} from 'modules/draw/shape/mixins/resize/resize.reducer';
import {
  cancelSelectFn,
  SelectedDrawing,
  selectDrawingFn,
} from 'modules/draw/mixins/select/select.reducer';
import {
  endNewRectByClick,
  endNewRectByClickFulfilled,
  NewRectState,
  startNewRectFn,
  endNewRectByDragFn,
  endNewRectByClickPending,
  endNewRectByClickRejected,
} from 'modules/draw/shape/newRect.reducer';
import {
  startDragSelectionFn,
  resizeDragSelectionFn,
  endDragSelectionFn,
  endGroupDragFn,
  GroupSelectState,
  GroupDragState,
} from 'modules/draw/mixins/groupSelect/groupSelect.reducer';
import { editTextFn } from './mixins/editText/editText.reducer';
import {
  getArrows,
  getArrowsFulfilled,
  Arrow,
  instanceOfArrow,
  drawArrowFulfilled,
  drawArrow,
  drawArrowPending,
  drawArrowRejected,
} from 'modules/draw/arrow/arrow.reducer';
import {
  getShapes,
  getShapesFulfilled,
  Shape,
} from 'modules/draw/shape/shape.reducer';

export type DrawReducer<T = void> = CaseReducer<DrawState, PayloadAction<T>>;
export type DrawActionPending<T> = (
  state: DrawState,
  action: {
    type: string;
    payload: undefined;
    meta: { requestId: string; arg: T };
  }
) => void;
export type DrawActionFulfilled<T, S = void> = (
  state: DrawState,
  action: {
    type: string;
    payload: Promise<S>;
    meta: { requestId: string; arg: T };
  }
) => void;
export type DrawActionRejected<T> = (
  state: DrawState,
  action: {
    type: string;
    payload: undefined;
    error: SerializedError | any;
    meta: { requestId: string; arg: T };
  }
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
  select: SelectedDrawing | null;
  drag: DragState | null;
  groupSelect: GroupSelectState | null;
  groupDrag: GroupDragState | null;
  resize: ResizeState | null;
  newRect: NewRectState | null;
}

const initialState: DrawState = {
  shapes: {},
  arrows: {},
  drawOrder: [],
  select: null,
  groupSelect: null,
  groupDrag: null,
  drag: null,
  resize: null,
  newRect: null,
};

export type Drawing = Arrow | Shape;

export const updateDrawingFn: DrawReducer<Drawing> = (state, action) => {
  const { id } = action.payload;
  const existing = state.shapes[id] ?? state.arrows[id] ?? {};
  const drawing = Object.assign({}, existing, action.payload);

  if (instanceOfArrow(drawing)) {
    state.arrows[drawing.id] = drawing;
  } else {
    state.shapes[drawing.id] = drawing;
  }
  reorder(drawing, state);
};

export const syncDrawingFn: DrawReducer<Drawing> = (state, action) => {
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
    editText: editTextFn,
    // select
    selectDrawing: selectDrawingFn,
    cancelSelect: cancelSelectFn,
    // drag
    startDrag: startDragFn,
    drag: dragFn,
    // resize
    startResize: startResizeFn,
    resize: resizeFn,
    // newRect
    startNewRect: startNewRectFn,
    endNewRectByDrag: endNewRectByDragFn,
    // groupSelect
    startDragSelection: startDragSelectionFn,
    resizeDragSelection: resizeDragSelectionFn,
    endDragSelection: endDragSelectionFn,
    endGroupDrag: endGroupDragFn,
  },
  extraReducers: {
    // shape
    [getShapes.pending as any]: (state, action) => {},
    [getShapes.fulfilled as any]: getShapesFulfilled,
    [getShapes.rejected as any]: (state, action) => {},
    // arrow
    [getArrows.pending as any]: (state, action) => {},
    [getArrows.fulfilled as any]: getArrowsFulfilled,
    [getArrows.rejected as any]: (state, action) => {},
    [drawArrow.pending as any]: drawArrowPending,
    [drawArrow.fulfilled as any]: drawArrowFulfilled,
    [drawArrow.rejected as any]: drawArrowRejected,
    // drag
    [endDrag.pending as any]: endDragPending,
    [endDrag.fulfilled as any]: endDragFulfilled,
    [endDrag.rejected as any]: endDragRejected,
    // resize
    [endResize.pending as any]: endResizePending,
    [endResize.fulfilled as any]: endResizeFulfilled,
    [endResize.rejected as any]: endResizeRejected,
    // newRect
    [endNewRectByClick.pending as any]: endNewRectByClickPending,
    [endNewRectByClick.fulfilled as any]: endNewRectByClickFulfilled,
    [endNewRectByClick.rejected as any]: endNewRectByClickRejected,
    // delete
    [deleteDrawing.pending as any]: deleteDrawingPending,
    [deleteDrawing.rejected as any]: deleteDrawingRejected,
    [deleteDrawing.fulfilled as any]: deleteDrawingFulfilled,
  },
});

export const {
  updateDrawing,
  syncDrawing,
  editText,
  cancelSelect,
  selectDrawing,
  startDrag,
  drag,
  startResize,
  resize,
  startNewRect,
  endNewRectByDrag,
  startDragSelection,
  resizeDragSelection,
  endDragSelection,
  endGroupDrag,
} = drawSlice.actions;
const drawReducer = drawSlice.reducer;
export default drawReducer;
