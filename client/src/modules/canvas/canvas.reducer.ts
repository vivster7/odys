import {
  createSlice,
  CaseReducer,
  PayloadAction,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import {
  zoomLeveltoScaleMap,
  changeZoomLevelFn,
  wheelEndFn,
} from './zoom/zoom.reducer';
import { endPanFn } from './pan/pan.reducer';
import { Cursor } from './cursor/cursor';
import { DrawState } from 'modules/draw/draw.reducer';
import { ActionFulfilled } from 'global/redux';
import Point from 'math/point';

export interface CanvasState {
  topLeftX: number;
  topLeftY: number;
  scale: number;
  zoomLevel: number;
  pan: PanState | null;
  dirty: boolean;
  // TODO: consider moving `cursorOver` state somewhere else
  cursorOver: CursorOver;
  cursor: Cursor;
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

export const centerCanvas = createAsyncThunk(
  'canvas/centerCanvas',
  async (arg: undefined, thunkAPI) => {
    const state = thunkAPI.getState() as any;
    const draw = state.draw as DrawState;
    const shapes = Object.values(draw.shapes);

    if (shapes.length === 0) return { x: 0, y: 0 };

    let leftmost = shapes[0];
    shapes.forEach((s) => {
      if (s.x < leftmost.x) leftmost = s;
    });
    return { x: leftmost.x, y: leftmost.y };
  }
);

const centerCanvasFulfilled = (
  state: CanvasState,
  action: ActionFulfilled<undefined, Point>
) => {
  const xOffset = 100;
  const yOffset = 200;
  state.topLeftX = (action.payload.x - xOffset) * -1;
  state.topLeftY = (action.payload.y - yOffset) * -1;
  dirtyCanvasFn(state, { type: 'canvas/dirtyCanvas', payload: undefined });
};

const initialState: CanvasState = {
  topLeftX: 0,
  topLeftY: 0,
  scale: zoomLeveltoScaleMap[5],
  zoomLevel: 5,
  pan: null,
  dirty: false,
  cursorOver: { type: 'background' },
  cursor: { x: 0, y: 0 },
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
  extraReducers: {
    // drawing
    [centerCanvas.pending as any]: (state, action) => {},
    [centerCanvas.fulfilled as any]: centerCanvasFulfilled,
    [centerCanvas.rejected as any]: (state, action) => {},
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
