import { createAsyncThunk } from '@reduxjs/toolkit';
import { deleteDrawings } from 'modules/draw/mixins/delete/delete.reducer';
import {
  selectAll,
  cancelSelect,
  ActionPending,
} from 'modules/draw/draw.reducer';
import { undo } from 'modules/draw/timetravel/undo.reducer';
import { redo } from 'modules/draw/timetravel/redo.reducer';
import {
  copy,
  paste,
  cut,
} from 'modules/draw/mixins/copypaste/copypaste.reducer';
import { KeyboardState, KeyEvent } from 'modules/keyboard/keyboard.reducer';
import { createGroup, ungroup } from 'modules/draw/shape/group.reducer';
import uuid from 'uuid';
import { allSelectedIds } from 'modules/draw/mixins/select/select.reducer';
import { RootState } from 'App';

// Only keys in this list will trigger the keydown condition.
const LISTEN_KEYS = [
  'Backspace',
  'Delete',
  'KeyA',
  'KeyC',
  'KeyG',
  'KeyV',
  'KeyX',
  'KeyZ',
  'Escape',
  'AltLeft',
  'AltRight',
  'ShiftLeft',
  'ShiftRight',
  'MetaLeft',
  'MetaRight',
  'Enter',
  'Space',
];

export const keydown: any = createAsyncThunk(
  'keyboard/keydown',
  async (e: KeyEvent, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const dispatch = thunkAPI.dispatch;

    const { shapes, select, multiSelect, editText } = state.draw;
    const isNotEditingText =
      editText === null || (editText.startingText === '' && !editText.hasTyped);

    if ((e.code === 'Backspace' || e.code === 'Delete') && isNotEditingText) {
      const ids = allSelectedIds(state.draw);
      await dispatch(deleteDrawings({ ids }));
    }

    if (e.code === 'KeyA' && e.metaKey && isNotEditingText) {
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

    if (e.code === 'KeyG' && multiSelect) {
      return dispatch(createGroup(uuid.v4()));
    }

    if (
      e.code === 'KeyG' &&
      editText === null &&
      select?.id &&
      shapes[select.id] &&
      shapes[select.id].type === 'grouping_rect'
    ) {
      return dispatch(ungroup(select.id));
    }
  },
  {
    condition: (e: KeyEvent, thunkAPI) => {
      return (
        LISTEN_KEYS.includes(e.code) &&
        // ignore if key is held down (aside from undo/redo)
        (e.repeat === false || e.code === 'KeyZ')
      );
    },
  }
);

export const keydownPendingFn = (
  state: KeyboardState,
  action: ActionPending<KeyEvent>
) => {
  const { code, metaKey, altKey, shiftKey } = action.meta.arg;

  if (altKey) {
    state.altKey = true;
  }

  if (shiftKey) {
    state.shiftKey = true;
  }

  if (metaKey) {
    state.cmdKey = true;
  }

  if (code === 'Space') {
    state.spaceKey = true;
  }
};
