import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { CanvasState } from '../canvas.reducer';

export const zoomLeveltoScaleMap: {
  [key: number]: number;
} = {
  1: 1 * 2 ** -4,
  2: 1 * 2 ** -3,
  3: 1 * 2 ** -2,
  4: 1 * 2 ** -1,
  5: 1 * 2 ** 0,
  6: 1 * 2 ** 1,
  7: 1 * 2 ** 2,
  8: 1 * 2 ** 3,
  9: 1 * 2 ** 4,
};

export const DEFAULT_ZOOM_LEVEL = 5;
export const MIN_ZOOM_LEVEL = 1;
export const MAX_ZOOM_LEVEL = 9;

interface ChangeZoomLevel {
  zoomLevel: number;
}

export const changeZoomLevelFn: CaseReducer<
  CanvasState,
  PayloadAction<ChangeZoomLevel>
> = (state, action) => {
  // TODO: grab (x,y) as center of viewport
  const x = 640;
  const y = 360;
  const zoomLevel = bound(
    action.payload.zoomLevel,
    MIN_ZOOM_LEVEL,
    MAX_ZOOM_LEVEL
  );

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

export const wheelEndFn: CaseReducer<CanvasState, PayloadAction<WheelEnd>> = (
  state,
  action
) => {
  const { topLeftX, topLeftY, scale, zoomLevel } = action.payload;

  state.topLeftX = topLeftX;
  state.topLeftY = topLeftY;
  state.scale = scale;
  state.zoomLevel = zoomLevel;
};
