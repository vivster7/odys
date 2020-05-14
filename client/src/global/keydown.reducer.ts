import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'App';
import { deleteDrawing } from 'modules/draw/mixins/delete/delete.reducer';
import { selectAll, cancelSelect } from 'modules/draw/draw.reducer';

// Only keys in this list will trigger the keydown condition.
const LISTEN_KEYS = ['Backspace', 'KeyA'];

interface Keydown {
  code: string;
  metaKey: boolean;
}

export const keydown = createAsyncThunk(
  'global/keydown',
  async (e: Keydown, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;

    const { select, groupSelect } = state.draw;
    if (e.code === 'Backspace') {
      if (select?.id && select.isEditing === false) {
        return thunkAPI.dispatch(deleteDrawing(select?.id));
      }

      if (groupSelect) {
        const ids = Object.keys(groupSelect.selectedShapeIds);
        await Promise.all(
          ids.map((id) => thunkAPI.dispatch(deleteDrawing(id)))
        );
        return thunkAPI.dispatch(cancelSelect());
      }
    }

    if (e.code === 'KeyA' && e.metaKey) {
      return thunkAPI.dispatch(selectAll());
    }
  },
  { condition: (e: Keydown, thunkAPI) => LISTEN_KEYS.includes(e.code) }
);
