import { PayloadAction } from '@reduxjs/toolkit';
import { ShapeReducer } from './shape';

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

export const changeZoomLevelFn: ShapeReducer<PayloadAction<ChangeZoomLevel>> = (
  state,
  action
) => {
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

export const wheelFn: ShapeReducer<PayloadAction<Wheel>> = (state, action) => {
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
    let scale2 = entries[j][1];

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

export const wheelEndFn: ShapeReducer<PayloadAction> = (state, action) => {
  state.svg.isZooming = false;
};
