import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'App';
import { deleteDrawing } from 'modules/draw/mixins/delete/delete.reducer';
import { selectAll } from 'modules/draw/draw.reducer';

// Only keys in this list will trigger the keydown condition.
const LISTEN_KEYS = ['Backspace', 'KeyA'];

interface Keydown {
  code: string;
  metaKey: boolean;
}

export const keydown = createAsyncThunk(
  'global/keydown',
  (e: Keydown, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;

    const { select } = state.draw;
    if (e.code === 'Backspace' && select?.id && select.isEditing === false) {
      return thunkAPI.dispatch(deleteDrawing(select?.id));
    }

    if (e.code === 'KeyA' && e.metaKey) {
      return thunkAPI.dispatch(selectAll());
    }
  },
  { condition: (e: Keydown, thunkAPI) => LISTEN_KEYS.includes(e.code) }
);
