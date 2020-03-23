import { GlobalActionType, GlobalState } from '../globals';

export interface OdysStartPanAction extends GlobalActionType {
  type: 'ODYS_START_PAN_ACTION';
  clickX: number;
  clickY: number;
}

export interface OdysPanAction extends GlobalActionType {
  type: 'ODYS_PAN_ACTION';
  clickX: number;
  clickY: number;
}

export interface OdysEndPanAction extends GlobalActionType {
  type: 'ODYS_END_PAN_ACTION';
}

const panReducerMap = {
  ODYS_START_PAN_ACTION: onOdysStartPanAction,
  ODYS_PAN_ACTION: onOdysPanAction,
  ODYS_END_PAN_ACTION: onOdysEndPanAction
};

export default panReducerMap;

function onOdysStartPanAction(
  state: GlobalState,
  action: OdysStartPanAction
): GlobalState {
  return {
    ...state,
    select: null,
    pan: {
      clickX: action.clickX,
      clickY: action.clickY
    }
  };
}

function onOdysPanAction(
  state: GlobalState,
  action: OdysPanAction
): GlobalState {
  if (state.pan) {
    return {
      ...state,
      svg: {
        ...state.svg,
        translateX: action.clickX - state.pan.clickX,
        translateY: action.clickY - state.pan.clickY
      }
    };
  }

  throw new Error(
    'Cannot ODYS_PAN_ACTION without `state.pan` (did ODYS_START_PAN_ACTION fire first?)'
  );
}

function onOdysEndPanAction(
  state: GlobalState,
  action: OdysEndPanAction
): GlobalState {
  if (state.pan) {
    return {
      ...state,
      drag: null,
      newRectByClick: null,
      pan: null,
      svg: {
        ...state.svg,
        topLeftX: state.svg.topLeftX + state.svg.translateX,
        topLeftY: state.svg.topLeftY + state.svg.translateY,
        translateX: 0,
        translateY: 0
      }
    };
  }

  throw new Error(
    'Could not end pan action. Was it started with ODYS_START_PAN_ACTION?'
  );
}
