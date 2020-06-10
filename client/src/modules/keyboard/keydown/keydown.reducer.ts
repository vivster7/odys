import { createAsyncThunk } from '@reduxjs/toolkit';
import { deleteDrawings } from 'modules/draw/mixins/delete/delete.reducer';
import { selectAll, cancelSelect } from 'modules/draw/draw.reducer';
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
import { debouncedOnWheelEnd } from 'modules/canvas/Canvas';
import { ActionPending } from 'global/redux';

// Only keys in this list will trigger the keydown condition.
const SPACE = ' ';
const LISTEN_KEYS = [
  'Backspace',
  'Delete',
  'a',
  'c',
  'g',
  'v',
  'x',
  'z',
  'Escape',
  'Shift',
  'Meta',
  'Enter',
  SPACE,
];

export const keydown: any = createAsyncThunk(
  'keyboard/keydown',
  async (e: KeyEvent, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const dispatch = thunkAPI.dispatch;
    // flush wheel end so paste has up-to-date cursor
    debouncedOnWheelEnd.flush();

    const { shapes, select, multiSelect, editText } = state.draw;
    const isNotEditingText =
      editText === null || (editText.startingText === '' && !editText.hasTyped);

    if ((e.key === 'Backspace' || e.key === 'Delete') && isNotEditingText) {
      const ids = allSelectedIds(state.draw);
      await dispatch(deleteDrawings({ ids }));
    }

    if (e.key === 'a' && e.metaKey && isNotEditingText) {
      return dispatch(selectAll());
    }

    if (e.key === 'z' && e.metaKey) {
      if (e.shiftKey) {
        return dispatch(redo());
      } else {
        return dispatch(undo());
      }
    }

    if (e.key === 'c' && e.metaKey && isNotEditingText) {
      return dispatch(copy());
    }
    if (e.key === 'v' && e.metaKey && editText === null) {
      return dispatch(paste());
    }
    if (e.key === 'x' && e.metaKey && isNotEditingText) {
      return dispatch(cut());
    }

    if (e.key === 'Escape') {
      return dispatch(cancelSelect());
    }

    if (e.key === 'g' && multiSelect) {
      return dispatch(createGroup(uuid.v4()));
    }

    if (
      e.key === 'g' &&
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
        LISTEN_KEYS.includes(e.key) &&
        // ignore if key is held down (aside from undo/redo)
        (e.repeat === false || e.key === 'z')
      );
    },
  }
);

export const keydownPendingFn = (
  state: KeyboardState,
  action: ActionPending<KeyEvent>
) => {
  const { key, metaKey, altKey, shiftKey } = action.meta.arg;

  if (altKey) {
    state.altKey = true;
  }

  if (shiftKey) {
    state.shiftKey = true;
  }

  if (metaKey) {
    state.cmdKey = true;
  }

  if (key === SPACE) {
    state.spaceKey = true;
  }
};
