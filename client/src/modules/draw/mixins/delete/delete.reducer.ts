import { useEffect, Dispatch } from 'react';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { DrawActionPending } from 'modules/draw/draw.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import socket, { registerSocketListener } from 'socket/socket';
import { save } from '../save/save.reducer';

export interface Deleteable {
  id: string;
  isDeleted: boolean;
}

export const deleteDrawing = createAsyncThunk(
  'draw/deleteDrawing',
  async (id: string, thunkAPI) => {
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
  const snapshot = Object.assign({}, drawing, {
    isLastUpdatedBySync: false,
    isSavedInDB: true, // optimistically assume this operation will succeed
  });
  if (!drawing) {
    throw new Error(`Cannot find drawing with ${id}`);
  }

  drawing.isDeleted = true;
  reorder(drawing, state);

  const undo = { actionCreatorName: 'safeUpdateDrawing', arg: snapshot };
  const redo = { actionCreatorName: 'safeDeleteDrawing', arg: id };
  state.timetravel.undos.push({ undo, redo });
  state.timetravel.redos = [];
};

export function useDrawingDeletedListener(
  dispatch: Dispatch<{
    type: string;
    meta: { arg: any };
  }>
) {
  useEffect(() => {
    const onDrawingDeleted = (data: any) =>
      dispatch({
        type: 'draw/deleteDrawing/pending',
        meta: { arg: data },
      });
    return registerSocketListener('drawingDeleted', onDrawingDeleted);
  }, [dispatch]);
}
