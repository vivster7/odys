import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit';

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

export interface SVGState {
  topLeftX: number;
  topLeftY: number;
  translateX: number;
  translateY: number;
  scale: number;
  zoomLevel: number;
  isZooming: boolean;
  pan: PanState | null;
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

interface ChangeZoomLevel {
  zoomLevel: number;
}

interface Wheel {
  clickX: number;
  clickY: number;
  scaleFactor: number;
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

const wheelFn: CaseReducer<SVGState, PayloadAction<Wheel>> = (
  state,
  action
) => {
  // Unsure precisely what inverting does.
  // Attempts to change coordinate plane from client to svg?
  const invertX = (action.payload.clickX - state.topLeftX) / state.scale;
  const invertY = (action.payload.clickY - state.topLeftY) / state.scale;
  const k = bound(
    state.scale * Math.pow(2, action.payload.scaleFactor),
    1 * 4 ** -4,
    1 * 4 ** 4
  );

  state.scale = k;
  state.topLeftX = action.payload.clickX - invertX * k;
  state.topLeftY = action.payload.clickY - invertY * k;
  state.zoomLevel = zoomLevelBucket(k);
  state.isZooming = true;
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

const wheelEndFn: CaseReducer<SVGState, PayloadAction> = (state, action) => {
  state.isZooming = false;
};

const startPanFn: CaseReducer<SVGState, PayloadAction<StartPan>> = (
  state,
  action
) => {
  state.pan = {
    clickX: action.payload.clickX,
    clickY: action.payload.clickY,
  };
};

const panFn: CaseReducer<SVGState, PayloadAction<Pan>> = (state, action) => {
  if (!state.pan) {
    throw new Error(
      'Cannot ODYS_PAN_ACTION without `state.pan` (did ODYS_START_PAN_ACTION fire first?)'
    );
  }

  state.translateX = action.payload.clickX - state.pan.clickX;
  state.translateY = action.payload.clickY - state.pan.clickY;
};

const endPanFn: CaseReducer<SVGState, PayloadAction> = (state, action) => {
  if (!state.pan) {
    throw new Error(
      'Could not end pan action. Was it started with ODYS_START_PAN_ACTION?'
    );
  }
  state.pan = null;
  state.topLeftX = state.topLeftX + state.translateX;
  state.topLeftY = state.topLeftY + state.translateY;
  state.translateX = 0;
  state.translateY = 0;
};

const initialState: SVGState = {
  topLeftX: 0,
  topLeftY: 0,
  translateX: 0,
  translateY: 0,
  scale: zoomLeveltoScaleMap[5] + zoomLeveltoScaleMap[6] * 0.25,
  zoomLevel: 5,
  isZooming: false,
  pan: null,
};

const svgSlice = createSlice({
  name: 'svg',
  initialState: initialState,
  reducers: {
    changeZoomLevel: changeZoomLevelFn,
    wheel: wheelFn,
    wheelEnd: wheelEndFn,
    startPan: startPanFn,
    pan: panFn,
    endPan: endPanFn,
  },
});

export const {
  changeZoomLevel,
  wheel,
  wheelEnd,
  startPan,
  pan,
  endPan,
} = svgSlice.actions;
const svgReducer = svgSlice.reducer;
export default svgReducer;
