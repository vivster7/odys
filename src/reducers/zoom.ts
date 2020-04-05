import { GlobalActionType, GlobalState } from '../globals';

const zoomLeveltoScaleMap: {
  [key: number]: number;
} = {
  1: 1 * 3 ** -4,
  2: 1 * 3 ** -3,
  3: 1 * 3 ** -2,
  4: 1 * 3 ** -1,
  5: 1 * 3 ** 0,
  6: 1 * 3 ** 1,
  7: 1 * 3 ** 2,
  8: 1 * 3 ** 3,
  9: 1 * 3 ** 4
};

export interface OdysChangeZoomLevelAction extends GlobalActionType {
  type: 'ODYS_CHANGE_ZOOM_LEVEL_ACTION';
  zoomLevel: number;
}

export interface OdysWheelAction extends GlobalActionType {
  type: 'ODYS_WHEEL_ACTION';
  clickX: number;
  clickY: number;
  scaleFactor: number;
}

const zoomReducerMap = {
  ODYS_CHANGE_ZOOM_LEVEL_ACTION: onOdysChangeZoomLevelAction,
  ODYS_WHEEL_ACTION: onOdysWheelAction
};

export default zoomReducerMap;

function onOdysChangeZoomLevelAction(
  state: GlobalState,
  action: OdysChangeZoomLevelAction
): GlobalState {
  // TODO: grab (x,y) as center of viewport
  const x = 640;
  const y = 360;
  const zoomLevel = bound(action.zoomLevel, 1, 9);

  const invertX = (x - state.svg.topLeftX) / state.svg.scale;
  const invertY = (y - state.svg.topLeftY) / state.svg.scale;
  const k = Math.max(0, zoomLeveltoScaleMap[zoomLevel]);

  return {
    ...state,
    svg: {
      ...state.svg,
      zoomLevel: action.zoomLevel,
      scale: k,
      topLeftX: x - invertX * k,
      topLeftY: y - invertY * k
    }
  };
}

function onOdysWheelAction(
  state: GlobalState,
  action: OdysWheelAction
): GlobalState {
  // Unsure precisely what inverting does.
  // Attempts to change coordinate plane from client to svg?
  const invertX = (action.clickX - state.svg.topLeftX) / state.svg.scale;
  const invertY = (action.clickY - state.svg.topLeftY) / state.svg.scale;
  const k = bound(
    state.svg.scale * Math.pow(2, action.scaleFactor),
    1 * 3 ** -4,
    1 * 3 ** 4
  );

  return {
    ...state,
    svg: {
      ...state.svg,
      scale: k,
      topLeftX: action.clickX - invertX * k,
      topLeftY: action.clickY - invertY * k,
      zoomLevel: zoomLevelBucket(k)
    }
  };
}

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

  return Math.max(...Object.keys(zoomLeveltoScaleMap).map(s => parseInt(s)));
}

// force `n` to be between min and max (inclusive)
function bound(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}
