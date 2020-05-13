import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit';

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
  drawArrowFn,
  getArrows,
  getArrowsFulfilled,
  Arrow,
  instanceOfArrow,
} from 'modules/draw/arrow/arrow.reducer';
import {
  getShapes,
  getShapesFulfilled,
  Shape,
} from 'modules/draw/shape/shape.reducer';

export type DrawReducer<T = void> = CaseReducer<DrawState, PayloadAction<T>>;

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

  if (synced.deleted) {
    action = {
      type: 'draw/deleteDrawing',
      payload: synced,
    };
    return deleteDrawingFn(state, action);
  } else {
    action = {
      type: 'draw/updateDrawing',
      payload: synced,
    };
    return updateDrawingFn(state, action);
  }
};

export const deleteDrawingFn: DrawReducer<Drawing> = (state, action) => {
  const { id } = action.payload;
  const drawing = state.shapes[id] ?? state.arrows[id];
  if (!drawing) {
    throw new Error(`Cannot find drawing with ${id}`);
  }

  if (instanceOfArrow(drawing)) {
    state.arrows[id].deleted = true;
    state.drawOrder = state.drawOrder.filter((drawId) => drawId !== id);
  } else {
    state.shapes[id].deleted = true;
    const connections = Object.values(state.arrows)
      .filter((a) => a.toShapeId === id || a.fromShapeId === id)
      .map((a) => a.id);
    state.drawOrder = state.drawOrder
      .filter((drawId) => drawId !== id)
      .filter((drawId) => !connections.includes(drawId));
  }
};

export function reorder(drawing: Drawing, state: DrawState) {
  const order = state.drawOrder;
  // remove from `order` array if present
  const idx = order.findIndex((id) => id === drawing.id);
  if (idx !== -1) {
    order.splice(idx, 1);
  }

  if (instanceOfArrow(drawing)) {
    order.push(drawing.id);
    return;
  }

  // grouping rects must come first. they are ordered against each other by `x` position.
  if (drawing.type === 'grouping_rect') {
    let insertIdx = 0;
    for (let i = 0; i < order.length; i++) {
      const id = order[i];
      const s = state.shapes[id];
      if (s?.type === 'grouping_rect' && s?.x < drawing.x) continue;
      insertIdx = i;
      break;
    }
    order.splice(insertIdx, 0, drawing.id);
    return;
  }

  // by default, add to top
  order.push(drawing.id);
}

const drawSlice = createSlice({
  name: 'draw',
  initialState: initialState,
  reducers: {
    // shape
    updateDrawing: updateDrawingFn,
    syncDrawing: syncDrawingFn,
    deleteDrawing: deleteDrawingFn,
    // editText
    editText: editTextFn,
    // arrow
    drawArrow: drawArrowFn,
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
    [getShapes.fulfilled as any]: getShapesFulfilled,
    [getShapes.pending as any]: (state, action) => {},
    [getShapes.rejected as any]: (state, action) => {},
    // arrow
    [getArrows.fulfilled as any]: getArrowsFulfilled,
    [getArrows.pending as any]: (state, action) => {},
    [getArrows.rejected as any]: (state, action) => {},
    // drag
    [endDrag.fulfilled as any]: endDragFulfilled,
    [endDrag.pending as any]: endDragPending,
    [endDrag.rejected as any]: endDragRejected,
    // resize
    [endResize.fulfilled as any]: endResizeFulfilled,
    [endResize.pending as any]: endResizePending,
    [endResize.rejected as any]: endResizeRejected,
    // newRect
    [endNewRectByClick.fulfilled as any]: endNewRectByClickFulfilled,
    [endNewRectByClick.pending as any]: (state, action) => {},
    [endNewRectByClick.rejected as any]: (state, action) => {},
  },
});

export const {
  updateDrawing,
  syncDrawing,
  deleteDrawing,
  editText,
  cancelSelect,
  selectDrawing,
  drawArrow,
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
