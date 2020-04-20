import { PayloadAction } from '@reduxjs/toolkit';
import { ShapeReducer } from './shape';
import { RectProps, RECT_WIDTH, RECT_HEIGHT } from '../../shapes/Rect';
import { zoomLeveltoScaleMap } from './zoom';
import { v4 } from 'uuid';

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

const uid = () => `id-${v4()}`;

export const startNewRectByClickFn: ShapeReducer<PayloadAction<
  StartNewRectByClick
>> = (state, action) => {
  state.newRectByClick = {
    clickX: action.payload.clickX,
    clickY: action.payload.clickY,
  };
};

export const endNewRectByClickFn: ShapeReducer<PayloadAction<
  EndNewRectByClick
>> = (state, action) => {
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

  state.data[id] = rect as any;
  state.shapeOrder.push(id);
};

export const startNewRectByDragFn: ShapeReducer<PayloadAction<
  StartNewRectByDrag
>> = (state, action) => {
  state.newRectByDrag = {
    clickX: action.payload.clickX,
    clickY: action.payload.clickY,
    shape: null,
  };
};

export const newRectByDragFn: ShapeReducer<PayloadAction<NewRectByDrag>> = (
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
    state.data[id] = rect as any;
    state.shapeOrder.push(id);

    // same as calling: startResizeFn(newState as any, startResizeAction);
    // TODO: cleanup into single call
    state.resize = {
      id: id,
      anchor: 'SEAnchor',
      originalX: state.newRectByDrag.clickX,
      originalY: state.newRectByDrag.clickY,
      clickX: 0,
      clickY: 0,
    };
  }
};

export const endNewRectByDragFn: ShapeReducer<PayloadAction> = (
  state,
  action
) => {
  state.newRectByDrag = null;
};
