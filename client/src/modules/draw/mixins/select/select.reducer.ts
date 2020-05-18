import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  DrawActionPending,
  DrawReducer,
  getDrawing,
} from 'modules/draw/draw.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import { emitEvent } from 'socket/socket';

export interface SelectedDrawing {
  id: string;
}

export interface Selectable {
  id: string;
}

export const selectDrawing = createAsyncThunk(
  'draw/selectDrawing',
  async (id: string, thunkAPI) => {
    emitEvent('drawingSelected', id);
  }
);

export const selectDrawingPending: DrawActionPending<string> = (
  state,
  action
) => {
  const id = action.meta.arg;
  const drawing = getDrawing(state, id);

  state.select = {
    id,
  };
  state.multiSelect = null;
  reorder([drawing], state);
};

export const cancelSelectFn: DrawReducer = (state, action) => {
  state.select = null;
  state.multiSelect = null;
};
