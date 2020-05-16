import { createAsyncThunk } from '@reduxjs/toolkit';
import { DrawReducer, DrawActionPending } from '../../draw.reducer';
import { save } from 'modules/draw/mixins/save/save.reducer';

export interface TextEditable {
  id: string;
  text: string;
}

export const editTextFn: DrawReducer<string> = (state, action) => {
  const { select } = state;
  if (!select) {
    throw new Error(
      `[draw/editText] Cannot edit text if a shape is not selected. ODYS_SELECT_SHAPE_ACTION should have fired first.`
    );
  }

  const { id } = select;
  const drawing = state.shapes[id] ?? state.arrows[id];
  if (!drawing) {
    throw new Error(`Cannot find drawing with ${id}`);
  }

  drawing.text = action.payload;
  drawing.isLastUpdatedBySync = false;
  select.isEditing = true;
};

export const endEditText: any = createAsyncThunk(
  'draw/endEditText',
  async (id: string, thunkAPI) => {
    thunkAPI.dispatch(save(id));
  }
);

export const endEditTextPending: DrawActionPending<string> = (
  state,
  action
) => {
  const id = action.meta.arg;
  const drawing = state.shapes[id] ?? state.arrows[id];

  if (!drawing) {
    throw new Error(`Cannot find drawing with ${id}`);
  }

  // TODO: implement startEditText and capture previous state
  const snapshot = Object.assign({}, drawing, {
    text: '',
  });

  const undo = { actionCreatorName: 'safeUpdateDrawing', arg: snapshot };
  const redo = { actionCreatorName: 'safeUpdateDrawing', arg: drawing };
  state.timetravel.undos.push({ undo, redo });
  state.timetravel.redos = [];
};
