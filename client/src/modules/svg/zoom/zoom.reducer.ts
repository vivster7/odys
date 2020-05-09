import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { SVGState } from '../svg.reducer';

export const zoomLeveltoScaleMap: {
  [key: number]: number;
} = {
  1: 1 * 8 ** -4,
  2: 1 * 8 ** -3,
  3: 1 * 8 ** -2,
  4: 1 * 8 ** -1,
  5: 1 * 8 ** 0,
  6: 1 * 8 ** 1,
  7: 1 * 8 ** 2,
  8: 1 * 8 ** 3,
  9: 1 * 8 ** 4,
};

interface ChangeZoomLevel {
  zoomLevel: number;
}

export const changeZoomLevelFn: CaseReducer<
  SVGState,
  PayloadAction<ChangeZoomLevel>
> = (state, action) => {
  // TODO: grab (x,y) as center of viewport
  const x = 640;
  const y = 360;
  const zoomLevel = bound(action.payload.zoomLevel, 1, 9);

  const invertX = (x - state.topLeftX) / state.scale;
  const invertY = (y - state.topLeftY) / state.scale;
  const k = Math.max(0, zoomLeveltoScaleMap[zoomLevel]);

  state.zoomLevel = action.payload.zoomLevel;
  state.scale = k;
  state.topLeftX = x - invertX * k;
  state.topLeftY = y - invertY * k;
};

// force `n` to be between min and max (inclusive)
function bound(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

interface WheelEnd {
  topLeftX: number;
  topLeftY: number;
  scale: number;
  zoomLevel: number;
}

export const wheelEndFn: CaseReducer<SVGState, PayloadAction<WheelEnd>> = (
  state,
  action
) => {
  const { topLeftX, topLeftY, scale, zoomLevel } = action.payload;

  state.topLeftX = topLeftX;
  state.topLeftY = topLeftY;
  state.scale = scale;
  state.zoomLevel = zoomLevel;
};
