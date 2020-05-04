import { ShapeReducer, ShapeID, reorder } from './shape';
import { PayloadAction } from '@reduxjs/toolkit';

export const selectShapeFn: ShapeReducer<PayloadAction<ShapeID>> = (
  state,
  action
) => {
  const id = action.payload;
  if (!state.data[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  state.select = {
    id,
    isEditing: false,
  };
  state.groupSelect = null;
  reorder(state.data, state.shapeOrder, state.data[id]);
};

export const cancelSelectFn: ShapeReducer<PayloadAction> = (state, action) => {
  state.select = null;
  state.groupSelect = null;
};
