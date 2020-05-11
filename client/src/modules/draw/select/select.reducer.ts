import { ShapeReducer, ShapeID, reorder } from '../draw.reducer';
import { PayloadAction } from '@reduxjs/toolkit';

export interface SelectedShape {
  id: string;
  isEditing: boolean;
}

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
  reorder(state.shapes, state.drawOrder, state.shapes[id]);
};

export const cancelSelectFn: ShapeReducer<PayloadAction> = (state, action) => {
  state.select = null;
  state.groupSelect = null;
};
