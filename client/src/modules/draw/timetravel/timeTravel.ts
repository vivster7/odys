import { createAsyncThunk, ActionCreatorsMapObject } from '@reduxjs/toolkit';
import { Drawing, DrawActionPending } from '../draw.reducer';
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
export const safeUpdateDrawing: any = createAsyncThunk(
  'draw/safeUpdateDrawing',
  async ({ id }: Drawing, thunkAPI) => {
    thunkAPI.dispatch(save(id));
  }
);

export const safeUpdateDrawingPending: DrawActionPending<Drawing> = (
  state,
  action
) => {
  const { id } = action.meta.arg;
  const existing = state.shapes[id] ?? state.arrows[id] ?? {};
  const drawing = Object.assign({}, existing, action.meta.arg);

  if (instanceOfArrow(drawing)) {
    state.arrows[drawing.id] = drawing;
  } else {
    state.shapes[drawing.id] = drawing;
  }
  reorder(drawing, state);
};

// just like draw/deleteDrawing, except this will NEVER update the undo/redo buffer
export const safeDeleteDrawing: any = createAsyncThunk(
  'draw/safeDeleteDrawing',
  async (id: string, thunkAPI) => {
    socket.emit('drawingDeleted', id);
    thunkAPI.dispatch(save(id));
  }
);

export const safeDeleteDrawingPending: DrawActionPending<string> = (
  state,
  action
) => {
  const id = action.meta.arg;
  const drawing = state.shapes[id] ?? state.arrows[id];
  if (!drawing) {
    throw new Error(`Cannot find drawing with ${id}`);
  }

  drawing.isDeleted = true;
  reorder(drawing, state);
};

export const actionCreatorMap: ActionCreatorsMapObject = {
  safeDeleteDrawing: safeDeleteDrawing,
  safeUpdateDrawing: safeUpdateDrawing,
};
