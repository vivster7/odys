import { createAsyncThunk, ActionCreatorsMapObject } from '@reduxjs/toolkit';
import {
  Drawing,
  DrawActionPending,
  getDrawings,
  cancelSelect,
} from '../draw.reducer';
import { instanceOfArrow } from '../arrow/arrow.reducer';
import { reorder } from '../mixins/drawOrder/drawOrder';
import { emitEvent } from 'socket/socket';
import { save } from '../mixins/save/save.reducer';
import {
  applySelect,
  isSelected,
} from '../mixins/multiSelect/multiSelect.reducer';
import { RootState } from 'App';

// TimeTravelSafeAction promise not to modify the undo or redo buffer.
// This is not enforced by types, so pretty please just follow the rules.
export type TimeTravelSafeAction =
  | { actionCreatorName: 'safeDeleteDrawings'; arg: string[] }
  | { actionCreatorName: 'safeUpdateDrawings'; arg: Drawing[] };

// These travel together and cancel each other out.
// If undo is called, the pair moves to `redos` state.
// If redo is called, the pair moves to `undos` state.
interface UndoRedo {
  undo: TimeTravelSafeAction;
  redo: TimeTravelSafeAction;
}

export interface TimeTravelState {
  undos: UndoRedo[];
  redos: UndoRedo[];
}

// just like draw/updateDrawing, except this will NEVER update the undo/redo buffer
export const safeUpdateDrawings: any = createAsyncThunk(
  'draw/safeUpdateDrawings',
  async (ds: Drawing[], thunkAPI) => {
    thunkAPI.dispatch(save(ds.map((d) => d.id)));
  }
);

export const safeUpdateDrawingsPending: DrawActionPending<Drawing[]> = (
  state,
  action
) => {
  const updates: Drawing[] = action.meta.arg;
  const drawings = updates.map((update) => {
    const existing: Drawing =
      state.shapes[update.id] ?? state.arrows[update.id] ?? {};
    return { ...existing, ...update };
  });

  drawings.forEach((d) => {
    if (instanceOfArrow(d)) {
      state.arrows[d.id] = d;
    } else {
      state.shapes[d.id] = d;
    }
  });
  reorder(drawings, state);
  applySelect(state, drawings);
};

// just like draw/deleteDrawing, except this will NEVER update the undo/redo buffer
export const safeDeleteDrawings = createAsyncThunk(
  'draw/safeDeleteDrawings',
  async (ids: string[], thunkAPI) => {
    // TODO: bulk socket
    emitEvent('drawingDeleted', ids[0]);
    thunkAPI.dispatch(save(ids));

    const state = thunkAPI.getState() as RootState;
    if (isSelected(state.draw, ids)) {
      thunkAPI.dispatch(cancelSelect());
    }
  }
);

export const safeDeleteDrawingsPending: DrawActionPending<string[]> = (
  state,
  action
) => {
  const ids = action.meta.arg;
  const drawings = getDrawings(state, ids);

  drawings.forEach((d) => (d.isDeleted = true));
  reorder(drawings, state);
};

export const actionCreatorMap: ActionCreatorsMapObject = {
  safeDeleteDrawings: safeDeleteDrawings,
  safeUpdateDrawings: safeUpdateDrawings,
};
