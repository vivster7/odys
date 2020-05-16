import { DrawReducer, DrawActionPending } from 'modules/draw/draw.reducer';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { save } from 'modules/draw/mixins/save/save.reducer';

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
  // isNewRect is true when we create a new rect by drag
  isNewRect: boolean;
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
  canvasScale: number;
}

export const startResizeFn: DrawReducer<StartResize> = (state, action) => {
  state.resize = {
    id: action.payload.id,
    anchor: action.payload.anchor,
    originalX: action.payload.originalX,
    originalY: action.payload.originalY,
    clickX: 0,
    clickY: 0,
    isNewRect: false,
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

  const { clickX, clickY, canvasScale } = action.payload;
  const { originalX, originalY } = state.resize;

  let translateX = 0;
  let translateY = 0;
  let deltaWidth = 0;
  let deltaHeight = 0;
  switch (state.resize.anchor) {
    case 'SEAnchor':
      deltaWidth = (clickX - originalX) / canvasScale;
      deltaHeight = (clickY - originalY) / canvasScale;
      break;
    case 'SWAnchor':
      translateX = (clickX - originalX) / canvasScale;
      deltaWidth = (originalX - clickX) / canvasScale;
      deltaHeight = (clickY - originalY) / canvasScale;
      break;
    case 'NEAnchor':
      translateY = (clickY - originalY) / canvasScale;
      deltaWidth = (clickX - originalX) / canvasScale;
      deltaHeight = (originalY - clickY) / canvasScale;
      break;
    case 'NWAnchor':
      translateX = (clickX - originalX) / canvasScale;
      translateY = (clickY - originalY) / canvasScale;
      deltaWidth = (originalX - clickX) / canvasScale;
      deltaHeight = (originalY - clickY) / canvasScale;
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
export const endResize: any = createAsyncThunk(
  'draw/endResize',
  async (id: string, thunkAPI) => {
    thunkAPI.dispatch(save(id));
  }
);

// endResizePending optimistically updates the shape
export const endResizePending: DrawActionPending<string> = (state, action) => {
  if (!state.resize) {
    throw new Error(
      'Could not end resize shape action. Was it started with ODYS_START_RESIZE_ACTION?'
    );
  }

  const { id, isNewRect } = state.resize;
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  const snapshot = Object.assign({}, state.shapes[id], {
    translateX: 0,
    translateY: 0,
    deltaWidth: 0,
    deltaHeight: 0,
    isLastUpdatedBySync: false,
    isSavedInDB: true,
  });

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
  shape.isSavedInDB = true;

  state.drag = null;
  state.newRect = null;
  state.resize = null;

  const undo = isNewRect
    ? { actionCreatorName: 'safeDeleteDrawing', arg: id }
    : { actionCreatorName: 'safeUpdateDrawing', arg: snapshot };
  const redo = { actionCreatorName: 'safeUpdateDrawing', arg: shape };
  state.timetravel.undos.push({ undo, redo });
  state.timetravel.redos = [];
};
