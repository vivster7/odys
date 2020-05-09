import { ShapeReducer, ShapeID, reorder } from '../draw.reducer';
import { PayloadAction } from '@reduxjs/toolkit';

export const selectShapeFn: ShapeReducer<PayloadAction<ShapeID>> = (
  state,
  action
) => {
  const id = action.payload;
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  state.select = {
    id,
    isEditing: false,
  };
  state.groupSelect = null;
  reorder(state.shapes, state.shapeOrder, state.shapes[id]);
};

export const cancelSelectFn: ShapeReducer<PayloadAction> = (state, action) => {
  state.select = null;
  state.groupSelect = null;
};
