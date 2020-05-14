import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'App';
import { instanceOfArrow } from 'modules/draw/arrow/arrow.reducer';
import { ShapeApi, Configuration, ArrowApi } from 'generated';
import {
  DrawActionRejected,
  DrawActionFulfilled,
} from 'modules/draw/draw.reducer';

// Saveable is a mixin related to saving an object in a database.
export interface Saveable {
  id: string;
  isSavedInDB: boolean;
}

export const save: any = createAsyncThunk(
  'draw/save',
  async (arg: string, thunkAPI) => {
    const id = arg;
    const state = thunkAPI.getState() as RootState;
    const drawing = state.draw.shapes[id] ?? state.draw.arrows[id];
    if (!drawing) {
      throw new Error(`Cannot find drawing with ${id}`);
    }

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

export const saveRejected: DrawActionRejected<string> = (state, action) => {
  const id = action.meta.arg;
  const drawing = state.shapes[id] ?? state.arrows[id];
  drawing.isSavedInDB = false;
  // TODO: schedule a future job to try and save?
};

export const saveFulfilled: DrawActionFulfilled<string> = (state, action) => {
  const id = action.meta.arg;
  const drawing = state.shapes[id] ?? state.arrows[id];
  drawing.isSavedInDB = true;
};
