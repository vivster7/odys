import { createAsyncThunk } from '@reduxjs/toolkit';
import { DrawReducer, DrawActionPending, getDrawing } from '../../draw.reducer';
import { save } from 'modules/draw/mixins/save/save.reducer';
import { TimeTravelSafeAction } from 'modules/draw/timetravel/timeTravel';

export interface EditTextState {
  startingText: string;
  isEditing: boolean;
}

export interface TextEditable {
  id: string;
  text: string;
}

export const startEditTextFn: DrawReducer = (state, action) => {
  const { select } = state;
  if (!select) {
    throw new Error(
      `[draw/startEditText] Cannot edit text if a shape is not selected. draw/select should have fired first.`
    );
  }

  const { id } = select;
  const drawing = getDrawing(state, id);

  state.editText = {
    startingText: drawing.text,
    isEditing: false,
  };
};

export const editTextFn: DrawReducer<string> = (state, action) => {
  const { select } = state;
  if (!select) {
    throw new Error(
      `[draw/editText] Cannot edit text if a shape is not selected. draw/select should have fired first.`
    );
  }

  const { id } = select;
  const drawing = getDrawing(state, id);

  drawing.text = action.payload;
  state.editText.isEditing = true;
};

export const endEditText = createAsyncThunk(
  'draw/endEditText',
  async ({ id }: EndEditText, thunkAPI) => {
    thunkAPI.dispatch(save([id]));
  }
);

interface EndEditText {
  id: string;
}

export const endEditTextPending: DrawActionPending<EndEditText> = (
  state,
  action
) => {
  const { id } = action.meta.arg;
  const drawing = getDrawing(state, id);

  const snapshot = { ...drawing, text: state.editText.startingText };
  state.editText.startingText = drawing.text;

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
