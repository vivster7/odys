import { createAsyncThunk } from '@reduxjs/toolkit';
import { deleteDrawings } from 'modules/draw/mixins/delete/delete.reducer';
import {
  selectAll,
  cancelSelect,
  copy,
  ActionPending,
} from 'modules/draw/draw.reducer';
import { undo } from 'modules/draw/timetravel/undo.reducer';
import { redo } from 'modules/draw/timetravel/redo.reducer';
import { paste, cut } from 'modules/draw/mixins/copypaste/copypaste.reducer';
import { KeyboardState, KeyEvent } from 'modules/keyboard/keyboard.reducer';

// Only keys in this list will trigger the keydown condition.
const LISTEN_KEYS = [
  'Backspace',
  'Delete',
  'KeyA',
  'KeyZ',
  'KeyC',
  'KeyV',
  'KeyX',
  'Escape',
  'AltLeft',
  'AltRight',
  'ShiftLeft',
  'ShiftRight',
];

export const keydown = createAsyncThunk(
  'keyboard/keydown',
  async (e: KeyEvent, thunkAPI) => {
    const state = thunkAPI.getState() as any;
    const dispatch = thunkAPI.dispatch;

    const { select, multiSelect, editText } = state.draw;
    if (e.code === 'Backspace' || e.code === 'Delete') {
      if (select?.id && editText.isEditing === false) {
        await dispatch(deleteDrawings({ ids: [select.id] }));
        return dispatch(cancelSelect());
      }

      if (multiSelect) {
        const ids = Object.keys(multiSelect.selectedShapeIds);
        await dispatch(deleteDrawings({ ids }));
        return dispatch(cancelSelect());
      }
    }

    if (e.code === 'KeyA' && e.metaKey) {
      return dispatch(selectAll(state.players.self));
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
  { condition: (e: KeyEvent, thunkAPI) => LISTEN_KEYS.includes(e.code) }
);

export const keydownPendingFn = (
  state: KeyboardState,
  action: ActionPending<KeyEvent>
) => {
  const { code } = action.meta.arg;
  if (code === 'AltLeft' || code === 'AltRight') {
    state.altKey = true;
  }

  if (code === 'ShiftLeft' || code === 'ShiftRight') {
    state.shiftKey = true;
  }
};
