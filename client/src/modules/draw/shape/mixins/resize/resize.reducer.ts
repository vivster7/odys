import {
  DrawReducer,
  DrawActionFulfilled,
  DrawActionPending,
  DrawActionRejected,
} from 'modules/draw/draw.reducer';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'App';
import { ShapeApi, Configuration } from 'generated';

export type NEAnchor = 'NEAnchor';
export type NWAnchor = 'NWAnchor';
export type SEAnchor = 'SEAnchor';
export type SWAnchor = 'SWAnchor';
export type Anchor = NEAnchor | NWAnchor | SEAnchor | SWAnchor;

export interface ResizeState {
  id: string;
  anchor: Anchor;
  originalX: number;
  originalY: number;
  clickX: number;
  clickY: number;
}

export interface Resizable {
  id: string;
  width: number;
  height: number;
  deltaWidth: number;
  deltaHeight: number;
  x: number;
  y: number;
  translateX: number;
  translateY: number;
}

interface StartResize {
  id: string;
  anchor: Anchor;
  originalX: number;
  originalY: number;
}

interface Resize {
  clickX: number;
  clickY: number;
  svgScale: number;
}

export const startResizeFn: DrawReducer<StartResize> = (state, action) => {
  state.resize = {
    id: action.payload.id,
    anchor: action.payload.anchor,
    originalX: action.payload.originalX,
    originalY: action.payload.originalY,
    clickX: 0,
    clickY: 0,
  };
};

export const resizeFn: DrawReducer<Resize> = (state, action) => {
  if (!state.resize) {
    throw new Error(
      'Cannot ODYS_RESIZE_ACTION without `state.resize` (did ODYS_START_RESIZE_ACTION fire first?)'
    );
  }

  const { id } = state.resize;
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  const { clickX, clickY, svgScale } = action.payload;
  const { originalX, originalY } = state.resize;

  let translateX = 0;
  let translateY = 0;
  let deltaWidth = 0;
  let deltaHeight = 0;
  switch (state.resize.anchor) {
    case 'SEAnchor':
      deltaWidth = (clickX - originalX) / svgScale;
      deltaHeight = (clickY - originalY) / svgScale;
      break;
    case 'SWAnchor':
      translateX = (clickX - originalX) / svgScale;
      deltaWidth = (originalX - clickX) / svgScale;
      deltaHeight = (clickY - originalY) / svgScale;
      break;
    case 'NEAnchor':
      translateY = (clickY - originalY) / svgScale;
      deltaWidth = (clickX - originalX) / svgScale;
      deltaHeight = (originalY - clickY) / svgScale;
      break;
    case 'NWAnchor':
      translateX = (clickX - originalX) / svgScale;
      translateY = (clickY - originalY) / svgScale;
      deltaWidth = (originalX - clickX) / svgScale;
      deltaHeight = (originalY - clickY) / svgScale;
      break;
    default:
      throw new Error(`Unknown anchor point ${state.resize.anchor}`);
  }

  const shape = state.shapes[id];
  shape.translateX = translateX;
  shape.translateY = translateY;
  shape.deltaWidth = deltaWidth;
  shape.deltaHeight = deltaHeight;
  shape.isLastUpdatedBySync = false;
};

// endResize saves the optimistic update to the DB.
// TODO: This is the same as endDrag
export const endResize: any = createAsyncThunk(
  'draw/endResize',
  async (arg: string, thunkAPI) => {
    const id = arg;
    const state = thunkAPI.getState() as RootState;
    const shape = state.draw.shapes[id];
    if (!shape) {
      throw new Error(`Cannot find shape with ${id}`);
    }

    const api = new ShapeApi(
      new Configuration({ headers: { Prefer: 'resolution=merge-duplicates' } })
    );
    await api.shapePost({ shape: shape });
  }
);

// endResizePending optimistically updates the shape
export const endResizePending: DrawActionPending<string> = (state, action) => {
  if (!state.resize) {
    throw new Error(
      'Could not end resize shape action. Was it started with ODYS_START_RESIZE_ACTION?'
    );
  }

  const { id } = state.resize;
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  const shape = state.shapes[id];
  shape.x = shape.x + shape.translateX;
  shape.y = shape.y + shape.translateY;
  shape.translateX = 0;
  shape.translateY = 0;
  shape.width = shape.width + shape.deltaWidth;
  shape.height = shape.height + shape.deltaHeight;
  shape.deltaWidth = 0;
  shape.deltaHeight = 0;
  shape.isLastUpdatedBySync = false;
  shape.isSavedInDB = false;

  state.drag = null;
  state.newRect = null;
  state.resize = null;
};

// endResizeFulfilled indicates the save was successful
// TODO: This is the same as endDrag
export const endResizeFulfilled: DrawActionFulfilled<string> = (
  state,
  action
) => {
  const id = action.meta.arg;
  const shape = state.shapes[id];
  shape.isSavedInDB = true;
};

// endResizeRejected indicates the save was unsuccessful
// TODO: This is the same as endDrag
export const endResizeRejected: DrawActionRejected<string> = (
  state,
  action
) => {
  const id = action.meta.arg;
  const shape = state.shapes[id];
  shape.isSavedInDB = false;
  // TODO: schedule a future job to try and save?
};
