import { createAsyncThunk, ActionCreatorsMapObject } from '@reduxjs/toolkit';
import {
  Drawing,
  DrawActionPending,
  getDrawing,
  getDrawings,
} from '../draw.reducer';
import { instanceOfArrow } from '../arrow/arrow.reducer';
import { reorder } from '../mixins/drawOrder/drawOrder';
import socket from 'socket/socket';
import { save } from '../mixins/save/save.reducer';

// TimeTravelSafeAction promise not to modify the undo or redo buffer.
// This is not enforced by types, so pretty please just follow the rules.
interface TimeTravelSafeAction<T = any> {
  actionCreatorName: string;
  arg: T;
}

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
    reorder(d, state);
  });
};

// just like draw/deleteDrawing, except this will NEVER update the undo/redo buffer
export const safeDeleteDrawings = createAsyncThunk(
  'draw/safeDeleteDrawings',
  async (ids: string[], thunkAPI) => {
    // TODO: bulk socket
    socket.emit('drawingDeleted', ids[0]);
    thunkAPI.dispatch(save(ids));
  }
);

export const safeDeleteDrawingsPending: DrawActionPending<string[]> = (
  state,
  action
) => {
  const ids = action.meta.arg;
  const drawings = getDrawings(state, ids);

  drawings.forEach((d) => (d.isDeleted = true));
  drawings.forEach((d) => reorder(d, state));
};

export const actionCreatorMap: ActionCreatorsMapObject = {
  safeDeleteDrawings: safeDeleteDrawings,
  safeUpdateDrawings: safeUpdateDrawings,
};
