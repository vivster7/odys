import { GlobalActionType, GlobalState } from '../globals';
import { v4 } from 'uuid';
import { RECT_WIDTH, RECT_HEIGHT, RectProps } from '../shapes/Rect';
import {
  onOdysStartResizeAction,
  OdysStartResizeAction,
  OdysResizeAction,
  onOdysResizeAction,
  OdysEndResizeAction,
  onOdysEndResizeAction
} from './resize';

export interface OdysStartNewRectByClickAction extends GlobalActionType {
  type: 'ODYS_START_NEW_RECT_BY_CLICK_ACTION';
  clickX: number;
  clickY: number;
}

export interface OdysEndNewRectByClickAction extends GlobalActionType {
  type: 'ODYS_END_NEW_RECT_BY_CLICK_ACTION';
  clickX: number;
  clickY: number;
}

export interface OdysStartNewRectByDragAction extends GlobalActionType {
  type: 'ODYS_START_NEW_RECT_BY_DRAG_ACTION';
  clickX: number;
  clickY: number;
}

export interface OdysNewRectByDragAction extends GlobalActionType {
  type: 'ODYS_NEW_RECT_BY_DRAG_ACTION';
  clickX: number;
  clickY: number;
}

export interface OdysEndNewRectByDragAction extends GlobalActionType {
  type: 'ODYS_END_NEW_RECT_BY_DRAG_ACTION';
}

const newRectByClickReducerMap = {
  ODYS_START_NEW_RECT_BY_CLICK_ACTION: onOdysStartNewRectByClickAction,
  ODYS_END_NEW_RECT_BY_CLICK_ACTION: onOdysEndNewRectByClickAction,
  ODYS_START_NEW_RECT_BY_DRAG_ACTION: onOdysStartNewRectByDragAction,
  ODYS_NEW_RECT_BY_DRAG_ACTION: onOdysNewRectByDragAction,
  ODYS_END_NEW_RECT_BY_DRAG_ACTION: onOdysEndNewRectByDragAction
};

export default newRectByClickReducerMap;

const uid = () => `id-${v4()}`;

function onOdysStartNewRectByClickAction(
  state: GlobalState,
  action: OdysStartNewRectByClickAction
): GlobalState {
  return {
    ...state,
    newRectByClick: {
      clickX: action.clickX,
      clickY: action.clickY
    }
  };
}

function onOdysEndNewRectByClickAction(
  state: GlobalState,
  action: OdysEndNewRectByClickAction
): GlobalState {
  const id = uid();
  const x = (action.clickX - state.svg.topLeftX) / state.svg.scale;
  const y = (action.clickY - state.svg.topLeftY) / state.svg.scale;

  const width = RECT_WIDTH / state.svg.scale;
  const height = RECT_HEIGHT / state.svg.scale;

  return {
    ...state,
    drag: null,
    newRectByClick: null,
    newRectByDrag: null,
    pan: null,
    select: {
      id: id,
      isEditing: false
    },
    shapes: [
      ...state.shapes,
      {
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
        deltaHeight: 0
      } as RectProps
    ]
  };
}

function onOdysStartNewRectByDragAction(
  state: GlobalState,
  action: OdysStartNewRectByClickAction
) {
  return {
    ...state,
    newRectByDrag: {
      clickX: action.clickX,
      clickY: action.clickY,
      shape: null
    }
  };
}

function onOdysNewRectByDragAction(
  state: GlobalState,
  action: OdysStartNewRectByClickAction
) {
  if (!state.newRectByDrag) {
    throw new Error(
      'Cannot create rect on drag. Missing newRectByDrag state. Was ODYS_START_NEW_RECT_BY_DRAG_ACTION called first?'
    );
  }

  if (state.newRectByDrag.shape) {
    const resizeAction = {
      type: 'ODYS_RESIZE_ACTION',
      clickX: action.clickX,
      clickY: action.clickY
    } as OdysResizeAction;
    return onOdysResizeAction(state, resizeAction);
  } else {
    const id = uid();
    const x =
      (state.newRectByDrag.clickX - state.svg.topLeftX) / state.svg.scale;
    const y =
      (state.newRectByDrag.clickY - state.svg.topLeftY) / state.svg.scale;
    const width =
      (action.clickX - state.svg.topLeftX) / state.svg.scale -
      (state.newRectByDrag.clickX - state.svg.topLeftX) / state.svg.scale;
    const height =
      (action.clickY - state.svg.topLeftY) / state.svg.scale -
      (state.newRectByDrag.clickY - state.svg.topLeftY) / state.svg.scale;

    const rect = {
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
      deltaHeight: 0
    } as RectProps;

    const newState = {
      ...state,
      newRectByDrag: {
        ...state.newRectByDrag,
        shape: rect
      },
      shapes: [...state.shapes, rect]
    };

    const startResize = {
      type: 'ODYS_START_RESIZE_ACTION',
      id: id,
      anchor: 'SEAnchor',
      originalX: state.newRectByDrag.clickX,
      originalY: state.newRectByDrag.clickY
    } as OdysStartResizeAction;

    return onOdysStartResizeAction(newState, startResize);
  }
}

function onOdysEndNewRectByDragAction(
  state: GlobalState,
  action: OdysStartNewRectByClickAction
) {
  const newState = {
    ...state,
    newRectByDrag: null
  };

  const endResize = {
    type: 'ODYS_END_RESIZE_ACTION'
  } as OdysEndResizeAction;

  return onOdysEndResizeAction(newState, endResize);
}
