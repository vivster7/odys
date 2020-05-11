import Shape from './shape/Shape';

import {
  createSlice,
  PayloadAction,
  CaseReducer,
  Action,
  createAsyncThunk,
} from '@reduxjs/toolkit';

import { ArrowProps } from './arrow/Arrow';
import { startDragFn, dragFn, endDragFn } from './drag/drag.reducer';
import { startResizeFn, resizeFn, endResizeFn } from './resize/resize.reducer';
import { selectShapeFn, cancelSelectFn } from './select/select.reducer';
import {
  startNewRectByClickFn,
  endNewRectByClick,
  startNewRectByDragFn,
  endNewRectByDragFn,
} from './newRect/newRect.reducer';
import { RectProps } from './shape/Rect';
import { GroupingRectProps } from './shape/GroupingRect';
import Rect from '../../math/rect';
import {
  startDragSelectionFn,
  resizeDragSelectionFn,
  endDragSelectionFn,
  endGroupDragFn,
} from './groupSelect/groupSelect.reducer';
import { selectedShapeEditTextFn } from './editText/editText.reducer';
import { ShapeApi } from 'generated/apis/ShapeApi';
import { OdysShape } from 'generated';
import {
  drawArrowFn,
  getArrows,
  getArrowsFulfilled,
} from './arrow/arrow.reducer';

export type ShapeID = string;
export type NEAnchor = 'NEAnchor';
export type NWAnchor = 'NWAnchor';
export type SEAnchor = 'SEAnchor';
export type SWAnchor = 'SWAnchor';
export type Anchor = NEAnchor | NWAnchor | SEAnchor | SWAnchor;

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

export interface ShapeData {
  [id: string]: Shape;
}

export interface ShapeState {
  shapes: ShapeData;
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
  shapes: {},
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

const addShapeFn: ShapeReducer<PayloadAction<Shape>> = (state, action) => {
  state.shapes[action.payload.id] = action.payload as any;
  reorder(state.shapes, state.shapeOrder, action.payload);
};

const editShapeFn: ShapeReducer<PayloadAction<Shape>> = (state, action) => {
  const { id } = action.payload;
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }
  const shape = state.shapes[id];
  state.shapes[id] = {
    ...shape,
    ...action.payload,
  };
  reorder(state.shapes, state.shapeOrder, action.payload);
};

const syncShapeFn: ShapeReducer<PayloadAction<Shape>> = (state, action) => {
  const { id } = action.payload;
  if (!state.shapes[id]) {
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
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  reorder(state.shapes, state.shapeOrder, state.shapes[id]);
};

const deleteShapeFn: ShapeReducer<PayloadAction<ShapeID>> = (state, action) => {
  const id = action.payload;
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  delete state.shapes[id];
  state.shapeOrder = state.shapeOrder.filter((shapeId) => {
    if (shapeId === id) {
      return false;
    }

    const shape = state.shapes[shapeId];
    if (shape.type === 'arrow') {
      const arrow = shape as ArrowProps;
      if (arrow.fromId === id || arrow.toId === id) return false;
    }

    return true;
  });
};

export const getShapes = createAsyncThunk(
  'draw/getShapes',
  async (boardId: string, thunkAPI): Promise<OdysShape[]> => {
    const api = new ShapeApi();
    return api.shapeGet({ boardId: `eq.${boardId}` });
  }
);

const drawSlice = createSlice({
  name: 'draw',
  initialState: initialState,
  reducers: {
    addShape: addShapeFn,
    editShape: editShapeFn,
    syncShape: syncShapeFn,
    raiseShape: raiseShapeFn,
    deleteShape: deleteShapeFn,
    selectedShapeEditText: selectedShapeEditTextFn,
    //arrow
    drawArrow: drawArrowFn,
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
    [endNewRectByClick.fulfilled as any]: (
      state,
      action: PayloadAction<RectProps>
    ) => {
      const rect = action.payload;
      if (!rect) return;

      state.drag = null;
      state.newRectByClick = null;
      state.endNewRectByDrag = null;
      state.select = {
        id: rect.id,
        isEditing: false,
      };

      state.shapes[rect.id] = rect as any;
      reorder(state.shapes, state.shapeOrder, rect);
    },
    [endNewRectByClick.pending as any]: (state, action) => {},
    [endNewRectByClick.rejected as any]: (state, action) => {},
    [getShapes.fulfilled as any]: (
      state,
      action: PayloadAction<OdysShape[]>
    ) => {
      const shapes = action.payload;
      shapes.forEach((s) => {
        const shape: RectProps = {
          ...s,
          type: 'rect',
          createdAtZoomLevel: 5,
          isLastUpdatedBySync: false,
          translateX: 0,
          translateY: 0,
          deltaWidth: 0,
          deltaHeight: 0,
        };
        state.shapes[s.id] = shape;
        //TODO: order should be saved on server.
        reorder(state.shapes, state.shapeOrder, shape);
      });
    },
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
