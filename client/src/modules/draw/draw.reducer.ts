import Shape, { TextEditable, ShapeId } from './shapes/Shape';

import {
  createSlice,
  PayloadAction,
  CaseReducer,
  Action,
} from '@reduxjs/toolkit';

import { ArrowProps } from './shapes/Arrow';
import { startDragFn, dragFn, endDragFn } from './drag/drag.reducer';
import { startResizeFn, resizeFn, endResizeFn } from './resize/resize.reducer';
import { selectShapeFn, cancelSelectFn } from './select/select.reducer';
import { v4 } from 'uuid';
import {
  startNewRectByClickFn,
  endNewRectByClick,
  startNewRectByDragFn,
  endNewRectByDragFn,
} from './newRect/newRect.reducer';
import { RectProps } from './shapes/Rect';
import Rect from '../../math/rect';
import {
  startDragSelectionFn,
  resizeDragSelectionFn,
  endDragSelectionFn,
  endGroupDragFn,
} from './groupSelect/groupSelect.reducer';
import { selectedShapeEditTextFn } from './editText/editText.reducer';

export type ShapeID = string;
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

interface GroupSelectState {
  selectionRect: Rect | null;
  selectedShapeIds: { [key: string]: boolean };
  outline: Rect;
}

interface GroupDragState {
  startX: number;
  startY: number;
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
  groupSelect: GroupSelectState | null;
  groupDrag: GroupDragState | null;
  resize: ResizeState | null;
  newRectByClick: NewRectByClickState | null;
  endNewRectByDrag: NewRectByDragState | null;
  mouse: MouseState | null;
}

const initialState: ShapeState = {
  data: {},
  shapeOrder: [],
  select: null,
  groupSelect: null,
  groupDrag: null,
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

const editShapeFn: ShapeReducer<PayloadAction<Shape>> = (state, action) => {
  const { id } = action.payload;
  if (!state.data[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }
  const shape = state.data[id];
  state.data[id] = {
    ...shape,
    ...action.payload,
  };
  reorder(state.data, state.shapeOrder, action.payload);
};

const syncShapeFn: ShapeReducer<PayloadAction<Shape>> = (state, action) => {
  const { id } = action.payload;
  if (!state.data[id]) {
    return addShapeFn(state, {
      ...action,
      payload: { ...action.payload, isLastUpdatedBySync: true },
    });
  }
  return editShapeFn(state, {
    ...action,
    payload: { ...action.payload, isLastUpdatedBySync: true },
  });
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
    state.select = {
      id: existing.id,
      isEditing: false,
    };
    return;
  }

  // cannot draw arrow across zoomLevels
  const fromShape = state.data[selectId] as RectProps;
  const toShape = state.data[action.payload] as RectProps;
  if (!fromShape) throw new Error(`Cannot find shape (${selectId})`);
  if (!toShape) throw new Error(`Cannot find shape (${action.payload})`);
  if (fromShape.type !== 'rect')
    throw new Error('Can only draw arrows from Rects.');
  if (toShape.type !== 'rect')
    throw new Error('Can only draw arrows to Rects.');
  if (fromShape.createdAtZoomLevel !== toShape.createdAtZoomLevel) {
    throw new Error(
      `Cannot draw arrow across zoomLevel (createdAtZoomLevels dont match)`
    );
  }

  const arrowId = uid();
  const arrow = {
    type: 'arrow',
    id: arrowId,
    fromId: selectId,
    toId: action.payload,
    text: '',
    createdAtZoomLevel: fromShape.createdAtZoomLevel,
  } as ArrowProps;

  state.data[arrowId] = arrow;
  reorder(state.data, state.shapeOrder, arrow);
  state.select = {
    id: arrowId,
    isEditing: false,
  };
};

const drawSlice = createSlice({
  name: 'draw',
  initialState: initialState,
  reducers: {
    addShape: addShapeFn,
    editShape: editShapeFn,
    syncShape: syncShapeFn,
    raiseShape: raiseShapeFn,
    deleteShape: deleteShapeFn,
    drawArrow: drawArrowFn,
    selectedShapeEditText: selectedShapeEditTextFn,
    // select
    selectShape: selectShapeFn,
    cancelSelect: cancelSelectFn,
    //drag
    startDrag: startDragFn,
    drag: dragFn,
    endDrag: endDragFn,
    //resize
    startResize: startResizeFn,
    resize: resizeFn,
    endResize: endResizeFn,
    //newRect
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
const shapesReducer = drawSlice.reducer;
export default shapesReducer;
