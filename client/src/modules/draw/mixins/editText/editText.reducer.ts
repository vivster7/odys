import { DrawReducer } from '../../draw.reducer';

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
