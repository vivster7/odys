import { DrawReducer } from '../draw.reducer';
import Shape, { TextEditable } from '../shape/Shape';

export const selectedShapeEditTextFn: DrawReducer<string> = (state, action) => {
  const { select } = state;
  if (!select) {
    throw new Error(
      `[draw/editText] Cannot edit text if a shape is not selected. ODYS_SELECT_SHAPE_ACTION should have fired first.`
    );
  }

  const { id } = select;
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  const shape = state.shapes[id] as Shape & TextEditable;
  if (!shape.hasOwnProperty('text')) {
    throw new Error(
      `[draw/editText] Shape is missing 'text' property (${select.id})`
    );
  }

  shape.text = action.payload;
  shape.isLastUpdatedBySync = false;
  select.isEditing = true;
};
