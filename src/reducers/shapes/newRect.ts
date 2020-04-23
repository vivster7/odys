import { PayloadAction } from '@reduxjs/toolkit';
import { ShapeReducer, reorder } from './shape';
import { RectProps, RECT_WIDTH, RECT_HEIGHT } from '../../shapes/Rect';
import { v4 } from 'uuid';
import { zoomLeveltoScaleMap } from '../svg';

interface StartNewRectByClick {
  clickX: number;
  clickY: number;
}

interface EndNewRectByClick {
  clickX: number;
  clickY: number;
  svgTopLeftX: number;
  svgTopLeftY: number;
  svgScale: number;
  svgZoomLevel: number;
}

interface StartNewRectByDrag {
  clickX: number;
  clickY: number;
}

interface NewRectByDrag {
  clickX: number;
  clickY: number;
  svgTopLeftX: number;
  svgTopLeftY: number;
  svgScale: number;
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
  const {
    clickX,
    clickY,
    svgTopLeftX,
    svgTopLeftY,
    svgScale,
    svgZoomLevel,
  } = action.payload;

  const id = uid();
  const x = (clickX - svgTopLeftX) / svgScale;
  const y = (clickY - svgTopLeftY) / svgScale;

  const width = RECT_WIDTH / zoomLeveltoScaleMap[svgZoomLevel];
  const height = RECT_HEIGHT / zoomLeveltoScaleMap[svgZoomLevel];

  const rect = {
    type: 'rect',
    id: id,
    text: 'Concept',
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
  state.select = {
    id: id,
    isEditing: false,
  };

  state.data[id] = rect as any;
  reorder(state.data, state.shapeOrder, rect);
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

  const { clickX, clickY, svgTopLeftX, svgTopLeftY, svgScale } = action.payload;

  if (!state.newRectByDrag.shape) {
    const id = uid();
    const x = (state.newRectByDrag.clickX - svgTopLeftX) / svgScale;
    const y = (state.newRectByDrag.clickY - svgTopLeftY) / svgScale;
    const width =
      (clickX - svgTopLeftX) / svgScale -
      (state.newRectByDrag.clickX - svgTopLeftX) / svgScale;
    const height =
      (clickY - svgTopLeftY) / svgScale -
      (state.newRectByDrag.clickY - svgTopLeftY) / svgScale;

    const rect: RectProps = {
      type: 'rect',
      id: id,
      text: 'Group',
      x: x,
      y: y,
      translateX: 0,
      translateY: 0,
      width: width,
      height: height,
      deltaWidth: 0,
      deltaHeight: 0,
      isGroupingRect: true,
    };

    state.newRectByDrag.shape = rect as any;
    state.data[id] = rect as any;
    reorder(state.data, state.shapeOrder, rect);

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
