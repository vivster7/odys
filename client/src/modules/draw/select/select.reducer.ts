import { DrawReducer, reorder } from '../draw.reducer';

export interface SelectedShape {
  id: string;
  isEditing: boolean;
}

export const selectShapeFn: DrawReducer<string> = (state, action) => {
  const id = action.payload;
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  state.select = {
    id,
    isEditing: false,
  };
  state.groupSelect = null;
  reorder(state.shapes[id], state);
};

export const cancelSelectFn: DrawReducer = (state, action) => {
  state.select = null;
  state.groupSelect = null;
};
