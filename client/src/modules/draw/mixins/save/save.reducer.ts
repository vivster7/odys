import { useEffect, Dispatch } from 'react';
import { createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'App';
import { instanceOfArrow, Arrow } from 'modules/draw/arrow/arrow.reducer';
import { OdysArrowToJSON, OdysShapeToJSON } from 'generated';
import {
  Drawing,
  DrawActionRejected,
  DrawActionFulfilled,
  syncDrawing,
  getDrawings,
} from 'modules/draw/draw.reducer';
import socket, { registerSocketListener } from 'socket/socket';
import { instanceOfShape, Shape } from 'modules/draw/shape/shape.reducer';

// Saveable is a mixin related to saving an object in a database.
export interface Saveable {
  id: string;
  isSavedInDB: boolean;
}

export const save = createAsyncThunk(
  'draw/save',
  async (ids: string[], thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const drawings = getDrawings(state.draw, ids);

    const arrows = drawings.filter((d) => instanceOfArrow(d)) as Arrow[];
    const shapes = drawings.filter((d) => instanceOfShape(d)) as Shape[];

    const arrowUrl = 'http://localhost:3001/arrow';
    const shapeUrl = 'http://localhost:3001/shape';

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Prefer', 'resolution=merge-duplicates');

    // generated client missing support for bulk
    const p1 = await fetch(arrowUrl, {
      headers: headers,
      method: 'POST',
      body: JSON.stringify(arrows.map((a) => OdysArrowToJSON(a))),
    });

    const p2 = await fetch(shapeUrl, {
      headers: headers,
      method: 'POST',
      body: JSON.stringify(shapes.map((s) => OdysShapeToJSON(s))),
    });

    await Promise.all([p1, p2]);

    // TODO: bulk socket
    socket.emit('drawingSaved', drawings[0]);
  }
);

export const saveRejected: DrawActionRejected<string[]> = (state, action) => {
  const ids = action.meta.arg;
  const drawings = getDrawings(state, ids);
  drawings.forEach((d) => (d.isSavedInDB = false));
  // TODO: schedule a future job to try and save?
};

export const saveFulfilled: DrawActionFulfilled<string[]> = (state, action) => {
  const ids = action.meta.arg;
  const drawings = getDrawings(state, ids);
  drawings.forEach((d) => (d.isSavedInDB = true));
};

export function useDrawingSavedListener(
  dispatch: Dispatch<PayloadAction<Drawing>>
) {
  useEffect(() => {
    const onDrawingSaved = (data: any) => dispatch(syncDrawing(data));
    return registerSocketListener('drawingSaved', onDrawingSaved);
  }, [dispatch]);
}
