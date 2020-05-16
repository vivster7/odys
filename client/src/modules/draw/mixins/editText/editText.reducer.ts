import { createAsyncThunk } from '@reduxjs/toolkit';
import { DrawReducer, DrawActionPending, getDrawing } from '../../draw.reducer';
import { save } from 'modules/draw/mixins/save/save.reducer';

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
  drawing.isLastUpdatedBySync = false;
  state.editText.isEditing = true;
};

export const endEditText: any = createAsyncThunk(
  'draw/endEditText',
  async (id: string, thunkAPI) => {
    thunkAPI.dispatch(save([id]));
  }
);

export const endEditTextPending: DrawActionPending<string> = (
  state,
  action
) => {
  const id = action.meta.arg;
  const drawing = getDrawing(state, id);

  const snapshot = { ...drawing, text: state.editText.startingText };

  const undo = { actionCreatorName: 'safeUpdateDrawings', arg: [snapshot] };
  const redo = { actionCreatorName: 'safeUpdateDrawings', arg: [drawing] };
  state.timetravel.undos.push({ undo, redo });
  state.timetravel.redos = [];
};
