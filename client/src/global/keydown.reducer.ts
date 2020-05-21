import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'App';
import { deleteDrawings } from 'modules/draw/mixins/delete/delete.reducer';
import { selectAll, cancelSelect, copy } from 'modules/draw/draw.reducer';
import { undo } from 'modules/draw/timetravel/undo.reducer';
import { redo } from 'modules/draw/timetravel/redo.reducer';
import { paste, cut } from 'modules/draw/mixins/copypaste/copypaste.reducer';

// Only keys in this list will trigger the keydown condition.
const LISTEN_KEYS = [
  'Backspace',
  'KeyA',
  'KeyZ',
  'KeyC',
  'KeyV',
  'KeyX',
  'Escape',
];

interface Keydown {
  code: string;
  metaKey: boolean;
  shiftKey: boolean;
}

export const keydown = createAsyncThunk(
  'global/keydown',
  async (e: Keydown, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const dispatch = thunkAPI.dispatch;

    const { select, multiSelect, editText } = state.draw;
    if (e.code === 'Backspace') {
      if (select?.id && editText.isEditing === false) {
        await dispatch(deleteDrawings([select.id]));
        return dispatch(cancelSelect());
      }

      if (multiSelect) {
        const ids = Object.keys(multiSelect.selectedShapeIds);
        await dispatch(deleteDrawings(ids));
        return dispatch(cancelSelect());
      }
    }

    if (e.code === 'KeyA' && e.metaKey) {
      return dispatch(selectAll());
    }

    if (e.code === 'KeyZ' && e.metaKey) {
      if (e.shiftKey) {
        return dispatch(redo());
      } else {
        return dispatch(undo());
      }
    }

    if (e.code === 'KeyC' && e.metaKey) {
      return dispatch(copy());
    }
    if (e.code === 'KeyV' && e.metaKey) {
      return dispatch(paste());
    }
    if (e.code === 'KeyX' && e.metaKey) {
      return dispatch(cut());
    }

    if (e.code === 'Escape') {
      return dispatch(cancelSelect());
    }
  },
  { condition: (e: Keydown, thunkAPI) => LISTEN_KEYS.includes(e.code) }
);
