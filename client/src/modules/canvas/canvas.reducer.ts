import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import {
  zoomLeveltoScaleMap,
  changeZoomLevelFn,
  wheelEndFn,
} from './zoom/zoom.reducer';
import { endPanFn } from './pan/pan.reducer';
import { Cursor } from './cursor/cursor';

export interface CanvasState {
  topLeftX: number;
  topLeftY: number;
  translateX: number;
  translateY: number;
  scale: number;
  zoomLevel: number;
  pan: PanState | null;
  dirty: boolean;
  // TODO: consider moving `cursorOver` state somewhere else
  cursorOver: CursorOver;
  cursor?: Cursor;
}

type CursorOverType =
  | 'background'
  | 'rect'
  | 'grouping_rect'
  | 'text'
  | 'arrow';
interface CursorOver {
  type: CursorOverType;
  id?: string;
}

interface PanState {
  clickX: number;
  clickY: number;
}

const dirtyCanvasFn: CaseReducer<CanvasState, PayloadAction> = (
  state,
  action
) => {
  state.dirty = true;
};

const cleanCanvasFn: CaseReducer<CanvasState, PayloadAction> = (
  state,
  action
) => {
  state.dirty = false;
};

const initialState: CanvasState = {
  topLeftX: 0,
  topLeftY: 0,
  translateX: 0,
  translateY: 0,
  scale: zoomLeveltoScaleMap[5],
  zoomLevel: 5,
  pan: null,
  dirty: false,
  cursorOver: { type: 'background' },
  cursor: undefined,
};

const canvasSlice = createSlice({
  name: 'canvas',
  initialState: initialState,
  reducers: {
    changeZoomLevel: changeZoomLevelFn,
    wheelEnd: wheelEndFn,
    endPan: endPanFn,
    dirtyCanvas: dirtyCanvasFn,
    cleanCanvas: cleanCanvasFn,
    setCursorOver: (state, action: PayloadAction<CursorOver>) => {
      state.cursorOver = action.payload;
    },
    setCursorPosition: (state, action: PayloadAction<Cursor>) => {
      state.cursor = action.payload;
    },
  },
});

export const {
  changeZoomLevel,
  wheelEnd,
  endPan,
  dirtyCanvas,
  cleanCanvas,
  setCursorOver,
  setCursorPosition,
} = canvasSlice.actions;
const canvasReducer = canvasSlice.reducer;
export default canvasReducer;
