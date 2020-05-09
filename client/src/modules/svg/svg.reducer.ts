import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import {
  zoomLeveltoScaleMap,
  changeZoomLevelFn,
  wheelEndFn,
} from './zoom/zoom.reducer';
import { endPanFn } from './pan/pan.reducer';

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
    wheelEnd: wheelEndFn,
    endPan: endPanFn,
    dirtySvg: dirtySvgFn,
    cleanSvg: cleanSvgFn,
  },
});

export const {
  changeZoomLevel,
  wheelEnd,
  endPan,
  dirtySvg,
  cleanSvg,
} = svgSlice.actions;
const svgReducer = svgSlice.reducer;
export default svgReducer;
