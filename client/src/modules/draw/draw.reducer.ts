import Shape from './shape/Shape';

import { createSlice, CaseReducer, Action } from '@reduxjs/toolkit';

import {
  startDragFn,
  dragFn,
  endDragFn,
  DragState,
} from './shape/drag/drag.reducer';
import {
  startResizeFn,
  resizeFn,
  endResizeFn,
  ResizeState,
} from './shape/resize/resize.reducer';
import {
  selectShapeFn,
  cancelSelectFn,
  SelectedShape,
} from './select/select.reducer';
import {
  startNewRectByClickFn,
  endNewRectByClick,
  startNewRectByDragFn,
  endNewRectByDragFn,
  NewRectByClickState,
  NewRectByDragState,
  endNewRectByClickFulfilled,
} from './shape/newRect/newRect.reducer';
import { RectProps } from './shape/type/Rect';
import { GroupingRectProps } from './shape/type/GroupingRect';
import {
  startDragSelectionFn,
  resizeDragSelectionFn,
  endDragSelectionFn,
  endGroupDragFn,
  GroupSelectState,
  GroupDragState,
} from './groupSelect/groupSelect.reducer';
import { selectedShapeEditTextFn } from './editText/editText.reducer';
import {
  drawArrowFn,
  getArrows,
  getArrowsFulfilled,
} from './arrow/arrow.reducer';
import {
  addShapeFn,
  editShapeFn,
  syncShapeFn,
  raiseShapeFn,
  deleteShapeFn,
  getShapes,
  getShapesFulfilled,
} from './shape/shape.reducer';

export type ShapeID = string;

export type ShapeReducer<T extends Action<any>> = CaseReducer<ShapeState, T>;

export interface ShapeData {
  [id: string]: Shape;
}

export interface ShapeState {
  shapes: ShapeData;
  drawOrder: string[];
  select: SelectedShape | null;
  drag: DragState | null;
  groupSelect: GroupSelectState | null;
  groupDrag: GroupDragState | null;
  resize: ResizeState | null;
  newRectByClick: NewRectByClickState | null;
  endNewRectByDrag: NewRectByDragState | null;
}

const initialState: ShapeState = {
  shapes: {},
  drawOrder: [],
  select: null,
  groupSelect: null,
  groupDrag: null,
  drag: null,
  resize: null,
  newRectByClick: null,
  endNewRectByDrag: null,
};

export function reorder(shapes: ShapeData, order: string[], shape: Shape) {
  // remove from `order` array if present
  const idx = order.findIndex((id) => id === shape.id);
  if (idx !== -1) {
    order.splice(idx, 1);
  }

  // grouping rects must come first. they are ordered against each other by `x` position.
  if (shape.type === 'rect' || shape.type === 'grouping_rect') {
    const rect = shape as RectProps | GroupingRectProps;

    if (rect.type === 'grouping_rect') {
      let insertIdx = 0;
      for (let i = 0; i < order.length; i++) {
        const id = order[i];
        const s = shapes[id];

        if (s.type === 'rect' || s.type === 'grouping_rect') {
          const t = s as RectProps | GroupingRectProps;
          if (t.type === 'grouping_rect' && t.x < rect.x) continue;
        }
        insertIdx = i;
        break;
      }
      order.splice(insertIdx, 0, shape.id);
      return;
    }
  }

  // by default, add to top
  order.push(shape.id);
}

const drawSlice = createSlice({
  name: 'draw',
  initialState: initialState,
  reducers: {
    // shape
    addShape: addShapeFn,
    editShape: editShapeFn,
    syncShape: syncShapeFn,
    raiseShape: raiseShapeFn,
    deleteShape: deleteShapeFn,
    // editText
    selectedShapeEditText: selectedShapeEditTextFn,
    // arrow
    drawArrow: drawArrowFn,
    // select
    selectShape: selectShapeFn,
    cancelSelect: cancelSelectFn,
    // drag
    startDrag: startDragFn,
    drag: dragFn,
    endDrag: endDragFn,
    // resize
    startResize: startResizeFn,
    resize: resizeFn,
    endResize: endResizeFn,
    // newRect
    startNewRectByClick: startNewRectByClickFn,
    startNewRectByDrag: startNewRectByDragFn,
    endNewRectByDrag: endNewRectByDragFn,
    // groupSelect
    startDragSelection: startDragSelectionFn,
    resizeDragSelection: resizeDragSelectionFn,
    endDragSelection: endDragSelectionFn,
    endGroupDrag: endGroupDragFn,
  },
  extraReducers: {
    [endNewRectByClick.fulfilled as any]: endNewRectByClickFulfilled,
    [endNewRectByClick.pending as any]: (state, action) => {},
    [endNewRectByClick.rejected as any]: (state, action) => {},
    [getShapes.fulfilled as any]: getShapesFulfilled,
    [getShapes.pending as any]: (state, action) => {},
    [getShapes.rejected as any]: (state, action) => {},
    [getArrows.fulfilled as any]: getArrowsFulfilled,
    [getArrows.pending as any]: (state, action) => {},
    [getArrows.rejected as any]: (state, action) => {},
  },
});

export const {
  addShape,
  editShape,
  syncShape,
  deleteShape,
  selectedShapeEditText,
  cancelSelect,
  selectShape,
  drawArrow,
  startDrag,
  drag,
  endDrag,
  startResize,
  resize,
  endResize,
  startNewRectByClick,
  startNewRectByDrag,
  endNewRectByDrag,
  startDragSelection,
  resizeDragSelection,
  endDragSelection,
  endGroupDrag,
} = drawSlice.actions;
const drawReducer = drawSlice.reducer;
export default drawReducer;
