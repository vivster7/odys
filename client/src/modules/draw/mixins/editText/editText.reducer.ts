import { createAsyncThunk } from '@reduxjs/toolkit';
import { DrawReducer, DrawActionPending, getDrawing } from '../../draw.reducer';
import { save } from 'modules/draw/mixins/save/save.reducer';
import { TimeTravelSafeAction } from 'modules/draw/timetravel/timeTravel';

export interface EditTextState {
  // id of drawing being edited
  id: string;
  startingText: string;

  // indicates if user has typed anything
  // if false and startingText is empty, a 'Delete' will delete the object
  hasTyped: boolean;
}

export interface TextEditable {
  id: string;
  text: string;
}

export const startEditTextFn: DrawReducer<string> = (state, action) => {
  const id = action.payload;

  const drawing = getDrawing(state, id);
  if (!drawing) return;
  state.editText = {
    id: id,
    startingText: drawing.text,
    hasTyped: false,
  };
};

interface EditText {
  id: string;
  text: string;
}

export const editText = createAsyncThunk(
  'draw/editText',
  async ({ id }: EditText, thunkAPI) => {
    thunkAPI.dispatch(save([id]));
  }
);

export const editTextPending: DrawActionPending<EditText> = (state, action) => {
  const { id, text } = action.meta.arg;
  const drawing = getDrawing(state, id);
  if (!drawing) return;
  drawing.text = text;
  if (state.editText) state.editText.hasTyped = true;
  // NOTE: intentionally skipping undo/redo
};

export const endEditText = createAsyncThunk(
  'draw/endEditText',
  async (id: string, thunkAPI) => {
    await thunkAPI.dispatch(save([id]));
  }
);

export const endEditTextPending: DrawActionPending<string> = (
  state,
  action
) => {
  if (!state.editText) return;

  const { id, startingText } = state.editText;
  // assume this endEditText has already been cleaned up
  if (action.meta.arg !== id) return;

  state.editText = null;

  const drawing = getDrawing(state, id);
  if (!drawing) return;
  if (drawing.text === startingText) return;

  const snapshot = { ...drawing, text: startingText };
  const undo: TimeTravelSafeAction = {
    actionCreatorName: 'safeUpdateDrawings',
    arg: { drawings: [snapshot] },
  };
  const redo: TimeTravelSafeAction = {
    actionCreatorName: 'safeUpdateDrawings',
    arg: { drawings: [drawing] },
  };
  state.timetravel.undos.push({ undo, redo });
  state.timetravel.redos = [];
};
