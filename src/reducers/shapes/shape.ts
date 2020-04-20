import Shape from '../../shapes/Shape';

import {
  createSlice,
  PayloadAction,
  CaseReducer,
  Action,
} from '@reduxjs/toolkit';

import { ArrowProps } from '../../shapes/Arrow';
import { startDragFn, dragFn, endDragFn } from './drag';
import { startPanFn, panFn, endPanFn } from './pan';
import { startResizeFn, resizeFn, endResizeFn } from './resize';
import { changeZoomLevelFn, wheelFn, wheelEndFn } from './zoom';
import { v4 } from 'uuid';
import {
  startNewRectByClickFn,
  endNewRectByClickFn,
  startNewRectByDragFn,
  newRectByDragFn,
  endNewRectByDragFn,
} from './newRect';

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

interface PanState {
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

export interface SVGState {
  topLeftX: number;
  topLeftY: number;
  translateX: number;
  translateY: number;
  scale: number;
  zoomLevel: number;
  isZooming: boolean;
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
  newRectByDrag: NewRectByDragState | null;
  mouse: MouseState | null;
  pan: PanState | null;
  svg: SVGState;
}

const initialState: ShapeState = {
  data: {},
  shapeOrder: [],
  select: null,
  drag: null,
  mouse: null,
  pan: null,
  resize: null,
  newRectByClick: null,
  newRectByDrag: null,
  svg: {
    topLeftX: 0,
    topLeftY: 0,
    translateX: 0,
    translateY: 0,
    scale: 1,
    zoomLevel: 5,
    isZooming: false,
  },
};

const addShapeFn: ShapeReducer<PayloadAction<Shape>> = (state, action) => {
  state.data[action.payload.id] = action.payload as any;
  state.shapeOrder.push(action.payload.id);
};

const raiseShapeFn: ShapeReducer<PayloadAction<ShapeID>> = (state, action) => {
  const id = action.payload;
  if (!state.data[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  state.shapeOrder = [
    ...state.shapeOrder.filter((shapeID) => shapeID !== id),
    id,
  ];
};

const deleteShapeFn: ShapeReducer<PayloadAction<ShapeID>> = (state, action) => {
  const id = action.payload;
  if (!state.data[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  delete state.data[id];
  state.shapeOrder = state.shapeOrder.filter((shapeID) => shapeID !== id);
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
  const existing = Object.values(state.data).find(
    (s) =>
      s.type === 'arrow' && s.fromId === selectId && s.toId === action.payload
  );

  if (existing) {
    return;
  }

  const arrowID = uid();
  const arrow = {
    type: 'arrow',
    id: arrowID,
    fromId: selectId,
    toId: action.payload,
  } as ArrowProps;

  state.data[arrowID] = arrow;
  state.shapeOrder.push(arrowID);
};

const selectShapeFn: ShapeReducer<PayloadAction<ShapeID>> = (state, action) => {
  const id = action.payload;
  state.select = {
    id,
    isEditing: false,
  };
  state.shapeOrder = [
    ...state.shapeOrder.filter((shapeID) => shapeID !== id),
    id,
  ];
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

  const shape = state.data[id];
  if (shape.type !== 'rect') {
    throw new Error(
      `[shapes/editText] Cannot only edit rects. Selected shape is not a rect (${select.id})`
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
    startPan: startPanFn,
    pan: panFn,
    endPan: endPanFn,
    changeZoomLevel: changeZoomLevelFn,
    wheel: wheelFn,
    wheelEnd: wheelEndFn,
    startResize: startResizeFn,
    resize: resizeFn,
    endResize: endResizeFn,
    startNewRectByClick: startNewRectByClickFn,
    endNewRectByClick: endNewRectByClickFn,
    startNewRectByDrag: startNewRectByDragFn,
    newRectByDrag: newRectByDragFn,
    endNewRectByDrag: endNewRectByDragFn,
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
  startPan,
  pan,
  endPan,
  changeZoomLevel,
  wheel,
  wheelEnd,
  startResize,
  resize,
  endResize,
  startNewRectByClick,
  endNewRectByClick,
  startNewRectByDrag,
  newRectByDrag,
  endNewRectByDrag,
} = shapesSlice.actions;
const shapesReducer = shapesSlice.reducer;
export default shapesReducer;
