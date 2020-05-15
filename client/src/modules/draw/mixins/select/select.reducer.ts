import { useEffect, Dispatch } from 'react';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { DrawActionPending, DrawReducer, getDrawing } from 'modules/draw/draw.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import socket, { registerSocketListener } from 'socket/socket';

export interface SelectedDrawing {
  id: string;
}

export interface Selectable {
  id: string;
}

export const selectDrawing = createAsyncThunk(
  'draw/selectDrawing',
  async (id: string, thunkAPI) => {
    socket.emit('drawingSelected', id);
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

export function useDrawingSelectedListener(
  dispatch: Dispatch<{
    type: string;
    meta: { arg: any };
  }>
) {
  useEffect(() => {
    const onDrawingSelected = (data: any) =>
      dispatch({
        type: 'draw/selectDrawing/pending',
        meta: { arg: data },
      });
    return registerSocketListener('drawingSelected', onDrawingSelected);
  }, [dispatch]);
}
