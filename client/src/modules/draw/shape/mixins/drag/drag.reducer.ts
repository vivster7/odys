import {
  DrawReducer,
  reorder,
  DrawActionPending,
  DrawActionFulfilled,
  DrawActionRejected,
} from '../../../draw.reducer';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'App';
import { ShapeApi, Configuration } from 'generated';

export interface DragState {
  id: string;
  clickX: number;
  clickY: number;
}

export interface Draggable {
  id: string;
  x: number;
  y: number;
  translateX: number;
  translateY: number;
}

interface Drag {
  clickX: number;
  clickY: number;
  scale: number;
}

export const startDragFn: DrawReducer<DragState> = (state, action) => {
  const id = action.payload.id;
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  state.drag = {
    id: id,
    clickX: action.payload.clickX,
    clickY: action.payload.clickY,
  };

  state.shapes[id].isLastUpdatedBySync = false;
};

export const dragFn: DrawReducer<Drag> = (state, action) => {
  if (!state.drag) {
    throw new Error(
      'Cannot draw/drag without `state.drag` (did draw/startDrag fire first?)'
    );
  }

  const { id } = state.drag;
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  const { clickX, clickY, scale } = action.payload;

  const shape = state.shapes[id];
  shape.translateX = (clickX - state.drag.clickX) / scale;
  shape.translateY = (clickY - state.drag.clickY) / scale;
  shape.isLastUpdatedBySync = false;
};

// endDrag saves the optimistic update to the DB.
export const endDrag: any = createAsyncThunk(
  'draw/endDrag',
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

// endDragPending optimistically updates the shape
export const endDragPending: DrawActionPending<string> = (state, action) => {
  if (!state.drag) {
    throw new Error(
      'Cannot draw/endDrag without drag state. Did draw/startDrag fire?'
    );
  }

  const { id } = state.drag;
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  const shape = state.shapes[id];
  shape.x = shape.x + shape.translateX;
  shape.y = shape.y + shape.translateY;
  shape.translateX = 0;
  shape.translateY = 0;
  shape.isLastUpdatedBySync = false;
  shape.isSavedInDB = false;
  reorder(shape, state);
  state.drag = null;
};

// endDragFulfilled indicates the save was successful
export const endDragFulfilled: DrawActionFulfilled<string> = (
  state,
  action
) => {
  const id = action.meta.arg;
  const shape = state.shapes[id];
  shape.isSavedInDB = true;
};

// endDragRejected indicates the save was unsuccessful
export const endDragRejected: DrawActionRejected<string> = (state, action) => {
  const id = action.meta.arg;
  const shape = state.shapes[id];
  shape.isSavedInDB = false;
  // TODO: schedule a future job to try and save?
};
