import Shape from '../shapes/Shape';

import { createSlice, PayloadAction, CaseReducer } from '@reduxjs/toolkit';
import { v4 } from 'uuid';

import { ArrowProps } from '../shapes/Arrow';
import { RectProps, RECT_WIDTH, RECT_HEIGHT } from '../shapes/Rect';

type ShapeID = string;
export type NEAnchor = 'NEAnchor';
export type NWAnchor = 'NWAnchor';
export type SEAnchor = 'SEAnchor';
export type SWAnchor = 'SWAnchor';
export type Anchor = NEAnchor | NWAnchor | SEAnchor | SWAnchor;

interface SelectedShape {
  id: string;
  isEditing: boolean;
}

interface DragState {
  id: string;
  clickX: number;
  clickY: number;
}

interface StartDrag {
  id: string;
  clickX: number;
  clickY: number;
}

interface Drag {
  clickX: number;
  clickY: number;
  scale: number;
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

interface SVGState {
  topLeftX: number;
  topLeftY: number;
  translateX: number;
  translateY: number;
  scale: number;
  zoomLevel: number;
  isZooming: boolean;
}

interface ShapeState {
  data: Shape[];
  select: SelectedShape | null;
  drag: DragState | null;
  mouse: MouseState | null;
  pan: PanState | null;
  resize: ResizeState | null;
  newRectByClick: NewRectByClickState | null;
  newRectByDrag: NewRectByDragState | null;
  svg: SVGState;
}

const initialState: ShapeState = {
  data: [],
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

const addShapeFn: CaseReducer<ShapeState, PayloadAction<Shape>> = (
  state,
  action
) => {
  state.data = [...state.data, action.payload as any];
};

const raiseShapeFn: CaseReducer<ShapeState, PayloadAction<ShapeID>> = (
  state,
  action
) => {
  const id = action.payload;
  const shape = state.data.find((s) => s.id === id);
  if (!shape) {
    throw new Error(`Cannot find ${id} in shapes context`);
  }

  state.data = [...state.data.filter((s) => s.id !== id), shape as any];
};

const deleteShapeFn: CaseReducer<ShapeState, PayloadAction<ShapeID>> = (
  state,
  action
) => {
  const id = action.payload;
  state.data = state.data.filter((s) => s.id !== id);
};

const drawArrowFn: CaseReducer<ShapeState, PayloadAction<ShapeID>> = (
  state,
  action
) => {
  if (!state.select) {
    throw new Error('Cannot draw arrow without selected object.');
  }

  const selectId = state.select.id;

  // cannot draw arrow to self.
  if (selectId === action.payload) {
    return;
  }

  // cannot duplicate existing arrow.
  const existing = state.data.find(
    (s) =>
      s.type === 'arrow' && s.fromId === selectId && s.toId === action.payload
  );

  if (existing) {
    return;
  }

  const arrow = {
    type: 'arrow',
    id: uid(),
    fromId: selectId,
    toId: action.payload,
  } as ArrowProps;

  state.data = [...state.data, arrow as any];
};

const selectShapeFn: CaseReducer<ShapeState, PayloadAction<ShapeID>> = (
  state,
  action
) => {
  const id = action.payload;
  state.select = {
    id,
    isEditing: false,
  };
};

const cancelSelectFn: CaseReducer<ShapeState, PayloadAction> = (
  state,
  action
) => {
  state.select = null;
};

const selectedShapeEditTextFn: CaseReducer<
  ShapeState,
  PayloadAction<ShapeID>
> = (state, action) => {
  const { select } = state;
  if (!select) {
    throw new Error(
      `[shapes/editText] Cannot edit text if a shape is not selected. ODYS_SELECT_SHAPE_ACTION should have fired first.`
    );
  }

  const shape = state.data.find((d) => d.id === select.id);
  if (!shape) {
    throw new Error(
      `[shapes/editText] Cannot find selected shape (${select.id})`
    );
  }
  if (shape.type !== 'rect') {
    throw new Error(
      `[shapes/editText] Cannot only edit rects. Selected shape is not a rect (${select.id})`
    );
  }

  shape.text = action.payload;
  select.isEditing = true;
};

const startDragFn: CaseReducer<ShapeState, PayloadAction<StartDrag>> = (
  state,
  action
) => {
  state.drag = {
    id: action.payload.id,
    clickX: action.payload.clickX,
    clickY: action.payload.clickY,
  };
};

const dragFn: CaseReducer<ShapeState, PayloadAction<Drag>> = (
  state,
  action
) => {
  if (!state.drag) {
    throw new Error(
      'Cannot shapes/drag without `state.drag` (did shapes/startDrag fire first?)'
    );
  }

  const { id } = state.drag;
  const shapes = state.data;
  const idx = shapes.findIndex((d) => d.id === id);
  if (idx === -1) {
    throw new Error(`[drag] Cannot find ${id} in shapes context`);
  }

  const shape = {
    ...shapes[idx],
    translateX:
      (action.payload.clickX - state.drag.clickX) / action.payload.scale,
    translateY:
      (action.payload.clickY - state.drag.clickY) / action.payload.scale,
  };

  state.data = [...state.data.filter((s) => s.id !== id), shape as any];
};

const endDragFn: CaseReducer<ShapeState, PayloadAction> = (state, action) => {
  if (!state.drag) {
    throw new Error(
      'Could not end drag action. Was it started with ODYS_START_DRAG_ACTION?'
    );
  }

  const shapes = state.data;
  const { id } = state.drag;
  const idx = shapes.findIndex((s) => s.id === id);
  if (idx === -1) {
    throw new Error(`[drag] Cannot find ${id} in shapes`);
  }

  const shape = {
    ...shapes[idx],
    x: (shapes[idx].x as number) + (shapes[idx].translateX as number),
    y: (shapes[idx].y as number) + (shapes[idx].translateY as number),
    translateX: 0,
    translateY: 0,
  };

  state.data = [...state.data.filter((s) => s.id !== id), shape as any];
  state.drag = null;
};

interface MouseMove {
  clickX: number;
  clickY: number;
}

const mouseMoveFn: CaseReducer<ShapeState, PayloadAction<MouseMove>> = (
  state,
  action
) => {
  // // Unsure precisely what inverting does.
  // // Attempts to change coordinate plane from client to svg?
  const invertX =
    (action.payload.clickX - state.svg.topLeftX) / state.svg.scale;
  const invertY =
    (action.payload.clickY - state.svg.topLeftY) / state.svg.scale;
  // const k = Math.max(0, state.svg.scale * Math.pow(2, action.scaleFactor));

  state.mouse = {
    clickX: invertX,
    clickY: invertY,
  };
};

interface StartPan {
  clickX: number;
  clickY: number;
}

interface Pan {
  clickX: number;
  clickY: number;
}

const startPanFn: CaseReducer<ShapeState, PayloadAction<StartPan>> = (
  state,
  action
) => {
  state.select = null;
  state.pan = {
    clickX: action.payload.clickX,
    clickY: action.payload.clickY,
  };
};

const panFn: CaseReducer<ShapeState, PayloadAction<Pan>> = (state, action) => {
  if (!state.pan) {
    throw new Error(
      'Cannot ODYS_PAN_ACTION without `state.pan` (did ODYS_START_PAN_ACTION fire first?)'
    );
  }

  state.svg.translateX = action.payload.clickX - state.pan.clickX;
  state.svg.translateY = action.payload.clickY - state.pan.clickY;
};

const endPanFn: CaseReducer<ShapeState, PayloadAction> = (state, action) => {
  if (!state.pan) {
    throw new Error(
      'Could not end pan action. Was it started with ODYS_START_PAN_ACTION?'
    );
  }

  state.drag = null;
  state.newRectByClick = null;
  state.pan = null;
  state.svg.topLeftX = state.svg.topLeftX + state.svg.translateX;
  state.svg.topLeftY = state.svg.topLeftY + state.svg.translateY;
  state.svg.translateX = 0;
  state.svg.translateY = 0;
};

export const zoomLeveltoScaleMap: {
  [key: number]: number;
} = {
  1: 1 * 4 ** -4,
  2: 1 * 4 ** -3,
  3: 1 * 4 ** -2,
  4: 1 * 4 ** -1,
  5: 1 * 4 ** 0,
  6: 1 * 4 ** 1,
  7: 1 * 4 ** 2,
  8: 1 * 4 ** 3,
  9: 1 * 4 ** 4,
};

interface ChangeZoomLevel {
  zoomLevel: number;
}

interface Wheel {
  clickX: number;
  clickY: number;
  scaleFactor: number;
}

const changeZoomLevelFn: CaseReducer<
  ShapeState,
  PayloadAction<ChangeZoomLevel>
> = (state, action) => {
  // TODO: grab (x,y) as center of viewport
  const x = 640;
  const y = 360;
  const zoomLevel = bound(action.payload.zoomLevel, 1, 9);

  const invertX = (x - state.svg.topLeftX) / state.svg.scale;
  const invertY = (y - state.svg.topLeftY) / state.svg.scale;
  const k = Math.max(0, zoomLeveltoScaleMap[zoomLevel]);

  state.svg.zoomLevel = action.payload.zoomLevel;
  state.svg.scale = k;
  state.svg.topLeftX = x - invertX * k;
  state.svg.topLeftY = y - invertY * k;
};

const wheelFn: CaseReducer<ShapeState, PayloadAction<Wheel>> = (
  state,
  action
) => {
  // Unsure precisely what inverting does.
  // Attempts to change coordinate plane from client to svg?
  const invertX =
    (action.payload.clickX - state.svg.topLeftX) / state.svg.scale;
  const invertY =
    (action.payload.clickY - state.svg.topLeftY) / state.svg.scale;
  const k = bound(
    state.svg.scale * Math.pow(2, action.payload.scaleFactor),
    1 * 4 ** -4,
    1 * 4 ** 4
  );

  state.svg.scale = k;
  state.svg.topLeftX = action.payload.clickX - invertX * k;
  state.svg.topLeftY = action.payload.clickY - invertY * k;
  state.svg.zoomLevel = zoomLevelBucket(k);
  state.svg.isZooming = true;
};

// find nearest zoomLevel for a scale `k`. (round down)
function zoomLevelBucket(k: number): number {
  const entries = Object.entries(zoomLeveltoScaleMap);
  for (let [i, j] = [0, 1]; j < entries.length; [i, j] = [i + 1, j + 1]) {
    let [zoomLevel1, scale1] = entries[i];
    let [_, scale2] = entries[j];

    if (scale1 <= k && k < scale2) {
      return parseInt(zoomLevel1);
    }
  }

  return Math.max(...Object.keys(zoomLeveltoScaleMap).map((s) => parseInt(s)));
}

// force `n` to be between min and max (inclusive)
function bound(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

const wheelEndFn: CaseReducer<ShapeState, PayloadAction> = (state, action) => {
  state.svg.isZooming = false;
};

interface StartResize {
  id: string;
  anchor: Anchor;
  originalX: number;
  originalY: number;
}

interface Resize {
  clickX: number;
  clickY: number;
}

interface EndResize {}

const startResizeFn: CaseReducer<ShapeState, PayloadAction<StartResize>> = (
  state,
  action
) => {
  state.resize = {
    id: action.payload.id,
    anchor: action.payload.anchor,
    originalX: action.payload.originalX,
    originalY: action.payload.originalY,
    clickX: 0,
    clickY: 0,
  };
};

const resizeFn: CaseReducer<ShapeState, PayloadAction<Resize>> = (
  state,
  action
) => {
  if (!state.resize) {
    throw new Error(
      'Cannot ODYS_RESIZE_ACTION without `state.resize` (did ODYS_START_RESIZE_ACTION fire first?)'
    );
  }

  const { id } = state.resize;
  const shapes = state.data;
  const idx = shapes.findIndex((d) => d.id === id);
  if (idx === -1) {
    throw new Error(`[resize] Cannot find ${id} in shapes`);
  }

  let translateX = 0;
  let translateY = 0;
  let deltaWidth = 0;
  let deltaHeight = 0;
  switch (state.resize.anchor) {
    case 'SEAnchor':
      deltaWidth =
        (action.payload.clickX - state.resize.originalX) / state.svg.scale;
      deltaHeight =
        (action.payload.clickY - state.resize.originalY) / state.svg.scale;
      break;
    case 'SWAnchor':
      translateX =
        (action.payload.clickX - state.resize.originalX) / state.svg.scale;
      deltaWidth =
        (state.resize.originalX - action.payload.clickX) / state.svg.scale;
      deltaHeight =
        (action.payload.clickY - state.resize.originalY) / state.svg.scale;
      break;
    case 'NEAnchor':
      translateY =
        (action.payload.clickY - state.resize.originalY) / state.svg.scale;
      deltaWidth =
        (action.payload.clickX - state.resize.originalX) / state.svg.scale;
      deltaHeight =
        (state.resize.originalY - action.payload.clickY) / state.svg.scale;
      break;
    case 'NWAnchor':
      translateX =
        (action.payload.clickX - state.resize.originalX) / state.svg.scale;
      translateY =
        (action.payload.clickY - state.resize.originalY) / state.svg.scale;
      deltaWidth =
        (state.resize.originalX - action.payload.clickX) / state.svg.scale;
      deltaHeight =
        (state.resize.originalY - action.payload.clickY) / state.svg.scale;
      break;
    default:
      throw new Error(`Unknown anchor point ${state.resize.anchor}`);
  }

  const shape = {
    ...shapes[idx],
    translateX,
    translateY,
    deltaWidth,
    deltaHeight,
  };

  state.data = [...state.data.filter((s) => s.id !== id), shape as any];
};

const endResizeFn: CaseReducer<ShapeState, PayloadAction> = (state, action) => {
  if (!state.resize) {
    throw new Error(
      'Could not end resize shape action. Was it started with ODYS_START_RESIZE_ACTION?'
    );
  }

  const shapes = state.data;
  const { id } = state.resize;
  const idx = shapes.findIndex((s) => s.id === id);
  if (idx === -1) {
    throw new Error(`[resize] Cannot find ${id} in shapes`);
  }

  const rect = shapes[idx] as RectProps;
  const shape = {
    ...rect,
    x: rect.x + rect.translateX,
    y: rect.y + rect.translateY,
    translateX: 0,
    translateY: 0,
    width: rect.width + rect.deltaWidth,
    height: rect.height + rect.deltaHeight,
    deltaWidth: 0,
    deltaHeight: 0,
  };

  state.drag = null;
  state.newRectByClick = null;
  state.pan = null;
  state.resize = null;
  state.data = [...state.data.filter((s) => s.id !== id), shape as any];
};

interface StartNewRectByClick {
  clickX: number;
  clickY: number;
}

interface EndNewRectByClick {
  clickX: number;
  clickY: number;
}

interface StartNewRectByDrag {
  clickX: number;
  clickY: number;
}

interface NewRectByDrag {
  clickX: number;
  clickY: number;
}

const startNewRectByClickFn: CaseReducer<
  ShapeState,
  PayloadAction<StartNewRectByClick>
> = (state, action) => {
  state.newRectByClick = {
    clickX: action.payload.clickX,
    clickY: action.payload.clickY,
  };
};

const endNewRectByClickFn: CaseReducer<
  ShapeState,
  PayloadAction<EndNewRectByClick>
> = (state, action) => {
  const id = uid();
  const x = (action.payload.clickX - state.svg.topLeftX) / state.svg.scale;
  const y = (action.payload.clickY - state.svg.topLeftY) / state.svg.scale;

  const width = RECT_WIDTH / zoomLeveltoScaleMap[state.svg.zoomLevel];
  const height = RECT_HEIGHT / zoomLeveltoScaleMap[state.svg.zoomLevel];

  const rect = {
    type: 'rect',
    id: id,
    text: 'A',
    x: x - width / 2,
    y: y - height / 2,
    translateX: 0,
    translateY: 0,
    width: width,
    height: height,
    deltaWidth: 0,
    deltaHeight: 0,
  } as RectProps;

  state.drag = null;
  state.newRectByClick = null;
  state.newRectByDrag = null;
  state.pan = null;
  state.select = {
    id: id,
    isEditing: false,
  };
  state.data = [...state.data, rect as any];
};

const startNewRectByDragFn: CaseReducer<
  ShapeState,
  PayloadAction<StartNewRectByDrag>
> = (state, action) => {
  state.newRectByDrag = {
    clickX: action.payload.clickX,
    clickY: action.payload.clickY,
    shape: null,
  };
};

const newRectByDragFn: CaseReducer<ShapeState, PayloadAction<NewRectByDrag>> = (
  state,
  action
) => {
  if (!state.newRectByDrag) {
    throw new Error(
      'Cannot create rect on drag. Missing newRectByDrag state. Was ODYS_START_NEW_RECT_BY_DRAG_ACTION called first?'
    );
  }

  if (!state.newRectByDrag.shape) {
    const id = uid();
    const x =
      (state.newRectByDrag.clickX - state.svg.topLeftX) / state.svg.scale;
    const y =
      (state.newRectByDrag.clickY - state.svg.topLeftY) / state.svg.scale;
    const width =
      (action.payload.clickX - state.svg.topLeftX) / state.svg.scale -
      (state.newRectByDrag.clickX - state.svg.topLeftX) / state.svg.scale;
    const height =
      (action.payload.clickY - state.svg.topLeftY) / state.svg.scale -
      (state.newRectByDrag.clickY - state.svg.topLeftY) / state.svg.scale;

    const rect: RectProps = {
      type: 'rect',
      id: id,
      text: 'A',
      x: x,
      y: y,
      translateX: 0,
      translateY: 0,
      width: width,
      height: height,
      deltaWidth: 0,
      deltaHeight: 0,
    };

    state.newRectByDrag.shape = rect as any;
    state.data = [...state.data, rect as any];

    // same as calling: startResizeFn(newState as any, startResizeAction);
    // TODO: cleanup into single call
    state.resize = {
      id: id,
      anchor: 'SEAnchor' as Anchor,
      originalX: state.newRectByDrag.clickX,
      originalY: state.newRectByDrag.clickY,
      clickX: 0,
      clickY: 0,
    };
  }
};

const endNewRectByDragFn: CaseReducer<ShapeState, PayloadAction> = (
  state,
  action
) => {
  state.newRectByDrag = null;
};

const uid = () => `id-${v4()}`;
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
    mouseMove: mouseMoveFn,
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
  selectedShapeEditText,
  cancelSelect,
  selectShape,
  drawArrow,
  startDrag,
  drag,
  endDrag,
  mouseMove,
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
