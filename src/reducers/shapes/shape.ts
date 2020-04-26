import Shape, { TextEditable, ShapeId } from '../../shapes/Shape';

import {
  createSlice,
  PayloadAction,
  CaseReducer,
  Action,
} from '@reduxjs/toolkit';

import { ArrowProps } from '../../shapes/Arrow';
import { startDragFn, dragFn, endDragFn } from './drag';
import { startResizeFn, resizeFn, endResizeFn } from './resize';
import { v4 } from 'uuid';
import {
  startNewRectByClickFn,
  endNewRectByClick,
  startNewRectByDragFn,
  endNewRectByDragFn,
} from './newRect';
import { RectProps } from '../../shapes/Rect';

type ShapeID = string;
export type NEAnchor = 'NEAnchor';
export type NWAnchor = 'NWAnchor';
export type SEAnchor = 'SEAnchor';
export type SWAnchor = 'SWAnchor';
export type Anchor = NEAnchor | NWAnchor | SEAnchor | SWAnchor;

const uid = () => `id-${v4()}`;

export type ShapeReducer<T extends Action<any>> = CaseReducer<ShapeState, T>;

interface SelectedShape {
  id: string;
  isEditing: boolean;
}

interface DragState {
  id: string;
  clickX: number;
  clickY: number;
}

interface MouseState {
  clickX: number;
  clickY: number;
}

interface ResizeState {
  id: string;
  anchor: Anchor;
  originalX: number;
  originalY: number;
  clickX: number;
  clickY: number;
}

interface NewRectByClickState {
  clickX: number;
  clickY: number;
}

interface NewRectByDragState {
  clickX: number;
  clickY: number;
  shape: Shape | null;
}

interface ShapeData {
  [id: string]: Shape;
}

export interface ShapeState {
  data: ShapeData;
  shapeOrder: string[];
  select: SelectedShape | null;
  drag: DragState | null;
  resize: ResizeState | null;
  newRectByClick: NewRectByClickState | null;
  endNewRectByDrag: NewRectByDragState | null;
  mouse: MouseState | null;
}

const initialState: ShapeState = {
  data: {},
  shapeOrder: [],
  select: null,
  drag: null,
  mouse: null,
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
  if (shape.type === 'rect') {
    const rect = shape as RectProps;

    if (rect.isGroupingRect) {
      let insertIdx = 0;
      for (let i = 0; i < order.length; i++) {
        const id = order[i];
        const s = shapes[id];

        if (s.type === 'rect') {
          const t = s as RectProps;
          if (t.isGroupingRect && t.x < rect.x) continue;
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

const addShapeFn: ShapeReducer<PayloadAction<Shape>> = (state, action) => {
  state.data[action.payload.id] = action.payload as any;
  reorder(state.data, state.shapeOrder, action.payload);
};

const raiseShapeFn: ShapeReducer<PayloadAction<ShapeID>> = (state, action) => {
  const id = action.payload;
  if (!state.data[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  reorder(state.data, state.shapeOrder, state.data[id]);
};

const deleteShapeFn: ShapeReducer<PayloadAction<ShapeID>> = (state, action) => {
  const id = action.payload;
  if (!state.data[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  delete state.data[id];
  state.shapeOrder = state.shapeOrder.filter((shapeId) => {
    if (shapeId === id) {
      return false;
    }

    const shape = state.data[shapeId];
    if (shape.type === 'arrow') {
      const arrow = shape as ArrowProps;
      if (arrow.fromId === id || arrow.toId === id) return false;
    }

    return true;
  });
};

const drawArrowFn: ShapeReducer<PayloadAction<ShapeID>> = (state, action) => {
  if (!state.select) {
    throw new Error('Cannot draw arrow without selected object.');
  }

  const selectId = state.select.id;

  // cannot draw arrow to self.
  if (selectId === action.payload) {
    return;
  }

  // cannot duplicate existing arrow.
  const existing = Object.values(state.data).find((s) => {
    if (s.type === 'arrow') {
      const arrow = s as ArrowProps;
      return arrow.fromId === selectId && arrow.toId === action.payload;
    }
    return false;
  });

  if (existing) {
    return;
  }

  // cannot draw arrow across zoomLevels
  const fromShape = state.data[selectId] as RectProps;
  const toShape = state.data[action.payload] as RectProps;
  if (!fromShape) throw new Error(`Cannot find shape (${selectId})`);
  if (!toShape) throw new Error(`Cannot find shape (${action.payload})`);
  if (fromShape.createdAtZoomLevel !== toShape.createdAtZoomLevel) {
    throw new Error(
      `Cannot draw arrow across zoomLevel (createdAtZoomLevels dont match)`
    );
  }

  const arrowID = uid();
  const arrow = {
    type: 'arrow',
    id: arrowID,
    fromId: selectId,
    toId: action.payload,
    text: '',
    createdAtZoomLevel: fromShape.createdAtZoomLevel,
  } as ArrowProps;

  state.data[arrowID] = arrow;
  reorder(state.data, state.shapeOrder, arrow);
};

const selectShapeFn: ShapeReducer<PayloadAction<ShapeID>> = (state, action) => {
  const id = action.payload;
  if (!state.data[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  state.select = {
    id,
    isEditing: false,
  };
  reorder(state.data, state.shapeOrder, state.data[id]);
};

const cancelSelectFn: ShapeReducer<PayloadAction> = (state, action) => {
  state.select = null;
};

const selectedShapeEditTextFn: ShapeReducer<PayloadAction<string>> = (
  state,
  action
) => {
  const { select } = state;
  if (!select) {
    throw new Error(
      `[shapes/editText] Cannot edit text if a shape is not selected. ODYS_SELECT_SHAPE_ACTION should have fired first.`
    );
  }

  const { id } = select;
  if (!state.data[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  const shape = state.data[id] as Shape & TextEditable;
  if (!shape.hasOwnProperty('text')) {
    throw new Error(
      `[shapes/editText] Shape is missing 'text' property (${select.id})`
    );
  }

  shape.text = action.payload;
  select.isEditing = true;
};

const shapesSlice = createSlice({
  name: 'shapes',
  initialState: initialState,
  reducers: {
    addShape: addShapeFn,
    raiseShape: raiseShapeFn,
    deleteShape: deleteShapeFn,
    drawArrow: drawArrowFn,
    selectShape: selectShapeFn,
    cancelSelect: cancelSelectFn,
    selectedShapeEditText: selectedShapeEditTextFn,
    startDrag: startDragFn,
    drag: dragFn,
    endDrag: endDragFn,
    startResize: startResizeFn,
    resize: resizeFn,
    endResize: endResizeFn,
    startNewRectByClick: startNewRectByClickFn,
    startNewRectByDrag: startNewRectByDragFn,
    endNewRectByDrag: endNewRectByDragFn,
  },
  extraReducers: {
    [endNewRectByClick.fulfilled as any]: (state, action) => {
      const rect = action.payload as RectProps;
      if (!rect) return;

      state.drag = null;
      state.newRectByClick = null;
      state.endNewRectByDrag = null;
      state.select = {
        id: rect.id,
        isEditing: false,
      };

      state.data[rect.id] = rect as any;
      reorder(state.data, state.shapeOrder, rect);
    },
    [endNewRectByClick.rejected as any]: (state, action) => {},
  },
});

export const {
  addShape,
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
} = shapesSlice.actions;
const shapesReducer = shapesSlice.reducer;
export default shapesReducer;
