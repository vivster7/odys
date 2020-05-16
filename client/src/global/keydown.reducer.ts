import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'App';
import { deleteDrawing } from 'modules/draw/mixins/delete/delete.reducer';
import { selectAll, cancelSelect } from 'modules/draw/draw.reducer';
import { undo } from 'modules/draw/timetravel/undo.reducer';
import { redo } from 'modules/draw/timetravel/redo.reducer';

// Only keys in this list will trigger the keydown condition.
const LISTEN_KEYS = ['Backspace', 'KeyA', 'KeyZ'];

interface Keydown {
  code: string;
  metaKey: boolean;
  shiftKey: boolean;
}

export const keydown = createAsyncThunk(
  'global/keydown',
  async (e: Keydown, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;

    const { select, multiSelect, editText } = state.draw;
    if (e.code === 'Backspace') {
      if (select?.id && editText.isEditing === false) {
        return thunkAPI.dispatch(deleteDrawing(select?.id));
      }

      if (multiSelect) {
        const ids = Object.keys(multiSelect.selectedShapeIds);
        await Promise.all(
          ids.map((id) => thunkAPI.dispatch(deleteDrawing(id)))
        );
        return thunkAPI.dispatch(cancelSelect());
      }
    }

    if (e.code === 'KeyA' && e.metaKey) {
      return thunkAPI.dispatch(selectAll());
    }

    if (e.code === 'KeyZ' && e.metaKey) {
      if (e.shiftKey) {
        return thunkAPI.dispatch(redo());
      } else {
        return thunkAPI.dispatch(undo());
      }
    }
  },
  { condition: (e: Keydown, thunkAPI) => LISTEN_KEYS.includes(e.code) }
);
