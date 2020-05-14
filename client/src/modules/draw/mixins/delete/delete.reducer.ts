import { createAsyncThunk } from '@reduxjs/toolkit';

import { RootState } from 'App';
import { ShapeApi, ArrowApi, Configuration } from 'generated';
import {
  DrawActionPending,
  DrawActionFulfilled,
  DrawActionRejected,
} from 'modules/draw/draw.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import { instanceOfArrow } from 'modules/draw/arrow/arrow.reducer';
import socket from 'socket/socket';

export interface Deleteable {
  id: string;
  deleted: boolean;
}

export const deleteDrawing: any = createAsyncThunk(
  'draw/deleteDrawing',
  async (args: string, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const id = args;
    const drawing = state.draw.shapes[id] ?? state.draw.arrows[id];

    socket.emit('drawingDeleted', id);

    if (instanceOfArrow(drawing)) {
      const api = new ArrowApi(
        new Configuration({
          headers: { Prefer: 'resolution=merge-duplicates' },
        })
      );
      await api.arrowPost({ arrow: drawing });
    } else {
      const api = new ShapeApi(
        new Configuration({
          headers: { Prefer: 'resolution=merge-duplicates' },
        })
      );
      await api.shapePost({ shape: drawing });
    }
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

export const deleteDrawingRejected: DrawActionRejected<string> = (
  state,
  action
) => {};

export const deleteDrawingFulfilled: DrawActionFulfilled<string> = (
  state,
  action
) => {
  // TODO
};
