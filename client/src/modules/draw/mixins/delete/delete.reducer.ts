import { createAsyncThunk } from '@reduxjs/toolkit';
import { DrawActionPending } from 'modules/draw/draw.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import { instanceOfArrow } from 'modules/draw/arrow/arrow.reducer';
import socket from 'socket/socket';
import { save } from '../save/save.reducer';

export interface Deleteable {
  id: string;
  deleted: boolean;
}

export const deleteDrawing: any = createAsyncThunk(
  'draw/deleteDrawing',
  async (arg: string, thunkAPI) => {
    const id = arg;
    socket.emit('drawingDeleted', id);
    thunkAPI.dispatch(save(id));
  }
);

export const deleteDrawingPending: DrawActionPending<string> = (
  state,
  action
) => {
  const id = action.meta.arg;
  const drawing = state.shapes[id] ?? state.arrows[id];
  if (!drawing) {
    throw new Error(`Cannot find drawing with ${id}`);
  }

  if (instanceOfArrow(drawing)) {
    drawing.deleted = true;
  } else {
    drawing.deleted = true;
  }
  reorder(drawing, state);
};
