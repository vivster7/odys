import { DrawReducer, reorder, DrawState } from '../../../draw.reducer';
import { createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'App';

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

  const shape = state.shapes[id];
  shape.translateX =
    (action.payload.clickX - state.drag.clickX) / action.payload.scale;
  shape.translateY =
    (action.payload.clickY - state.drag.clickY) / action.payload.scale;
  shape.isLastUpdatedBySync = false;
};

export const endDrag: any = createAsyncThunk(
  'draw/endDrag',
  async (args: void, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    if (!state.draw.drag) {
      throw new Error(
        'Could not end drag action. Was it started with ODYS_START_DRAG_ACTION?'
      );
    }
    const { id } = state.draw.drag;
    if (!state.draw.shapes[id]) {
      throw new Error(`Cannot find shape with ${id}`);
    }

    const shape = state.draw.shapes[id];
    const result: Draggable = {
      id: id,
      x: shape.x + shape.translateX,
      y: shape.y + shape.translateY,
      translateX: 0,
      translateY: 0,
    };
    return result;
  }
);

export const endDragFulfilled = (
  state: DrawState,
  action: PayloadAction<Draggable>
) => {
  const { id, x, y, translateX, translateY } = action.payload;

  const shape = state.shapes[id];
  shape.x = x;
  shape.y = y;
  shape.translateX = translateX;
  shape.translateY = translateY;
  shape.isLastUpdatedBySync = false;
  reorder(shape, state);
  state.drag = null;
};
