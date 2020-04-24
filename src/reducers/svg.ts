import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit';

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

export interface SVGState {
  topLeftX: number;
  topLeftY: number;
  translateX: number;
  translateY: number;
  scale: number;
  zoomLevel: number;
  pan: PanState | null;
  dirty: boolean;
}

interface PanState {
  clickX: number;
  clickY: number;
}

interface StartPan {
  clickX: number;
  clickY: number;
}

interface Pan {
  clickX: number;
  clickY: number;
}

interface PanEnd {
  topLeftX: number;
  topLeftY: number;
}

interface ChangeZoomLevel {
  zoomLevel: number;
}

interface WheelEnd {
  topLeftX: number;
  topLeftY: number;
  scale: number;
  zoomLevel: number;
}

const changeZoomLevelFn: CaseReducer<
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

const wheelEndFn: CaseReducer<SVGState, PayloadAction<WheelEnd>> = (
  state,
  action
) => {
  const { topLeftX, topLeftY, scale, zoomLevel } = action.payload;

  state.topLeftX = topLeftX;
  state.topLeftY = topLeftY;
  state.scale = scale;
  state.zoomLevel = zoomLevel;
};

const endPanFn: CaseReducer<SVGState, PayloadAction<PanEnd>> = (
  state,
  action
) => {
  state.topLeftX = action.payload.topLeftX;
  state.topLeftY = action.payload.topLeftY;
};

const dirtySvgFn: CaseReducer<SVGState, PayloadAction> = (state, action) => {
  state.dirty = true;
};

const cleanSvgFn: CaseReducer<SVGState, PayloadAction> = (state, action) => {
  state.dirty = false;
};

const initialState: SVGState = {
  topLeftX: 0,
  topLeftY: 0,
  translateX: 0,
  translateY: 0,
  scale: zoomLeveltoScaleMap[5],
  zoomLevel: 5,
  pan: null,
  dirty: false,
};

const svgSlice = createSlice({
  name: 'svg',
  initialState: initialState,
  reducers: {
    changeZoomLevel: changeZoomLevelFn,
    // wheel: wheelFn,
    wheelEnd: wheelEndFn,
    endPan: endPanFn,
    dirtySvg: dirtySvgFn,
    cleanSvg: cleanSvgFn,
  },
});

export const {
  changeZoomLevel,
  // wheel,
  wheelEnd,
  endPan,
  dirtySvg,
  cleanSvg,
} = svgSlice.actions;
const svgReducer = svgSlice.reducer;
export default svgReducer;
