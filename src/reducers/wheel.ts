import { GlobalActionType, GlobalState } from '../globals';

export interface OdysWheelAction extends GlobalActionType {
  type: 'ODYS_WHEEL_ACTION';
  clickX: number;
  clickY: number;
  scaleFactor: number;
}

const wheelReducerMap = {
  ODYS_WHEEL_ACTION: onOdysWheelAction
};

export default wheelReducerMap;

function onOdysWheelAction(
  state: GlobalState,
  action: OdysWheelAction
): GlobalState {
  // Unsure precisely what inverting does.
  // Attempts to change coordinate plane from client to svg?
  const invertX = (action.clickX - state.svg.topLeftX) / state.svg.scale;
  const invertY = (action.clickY - state.svg.topLeftY) / state.svg.scale;
  const k = Math.max(0, state.svg.scale * Math.pow(2, action.scaleFactor));

  return {
    ...state,
    svg: {
      ...state.svg,
      scale: k,
      topLeftX: action.clickX - invertX * k,
      topLeftY: action.clickY - invertY * k
    }
  };
}
