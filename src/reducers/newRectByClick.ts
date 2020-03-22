import { GlobalActionType, GlobalState } from '../globals';
import { v4 } from 'uuid';
import { RECT_WIDTH, RECT_HEIGHT, RectProps } from '../shapes/Rect';

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

const newRectByClickReducerMap = {
  ODYS_START_NEW_RECT_BY_CLICK_ACTION: onOdysStartNewRectByClickAction,
  ODYS_END_NEW_RECT_BY_CLICK_ACTION: onOdysEndNewRectByClickAction
};

export default newRectByClickReducerMap;

const uid = () => `id-${v4()}`;

function onOdysStartNewRectByClickAction(
  state: GlobalState,
  action: OdysStartNewRectByClickAction
): GlobalState {
  return {
    ...state,
    selectedId: null,
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

  return {
    ...state,
    drag: null,
    newRectByClick: null,
    pan: null,
    selectedId: id,
    shapes: [
      ...state.shapes,
      {
        type: 'rect',
        id: id,
        text: 'A',
        x: x - RECT_WIDTH / 2,
        y: y - RECT_HEIGHT / 2,
        translateX: 0,
        translateY: 0,
        width: RECT_WIDTH,
        height: RECT_HEIGHT,
        deltaWidth: 0,
        deltaHeight: 0
      } as RectProps
    ]
  };
}
