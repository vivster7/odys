import { GlobalActionType, GlobalState } from '../globals';

export interface OdysMouseMoveAction extends GlobalActionType {
  type: 'ODYS_MOUSE_MOVE_ACTION';
  clickX: number;
  clickY: number;
}

const mouseReducerMap = {
  ODYS_MOUSE_MOVE_ACTION: onOdysWheelAction
};

export default mouseReducerMap;

function onOdysWheelAction(
  state: GlobalState,
  action: OdysMouseMoveAction
): GlobalState {
  // // Unsure precisely what inverting does.
  // // Attempts to change coordinate plane from client to svg?
  const invertX = (action.clickX - state.svg.topLeftX) / state.svg.scale;
  const invertY = (action.clickY - state.svg.topLeftY) / state.svg.scale;
  // const k = Math.max(0, state.svg.scale * Math.pow(2, action.scaleFactor));

  return {
    ...state,
    mouse: {
      x: invertX,
      y: invertY
    }
  };
}
