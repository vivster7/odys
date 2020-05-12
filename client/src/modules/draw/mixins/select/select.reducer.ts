import { DrawReducer, reorder } from '../../draw.reducer';

export interface SelectedDrawing {
  id: string;
  isEditing: boolean;
}

export interface Selectable {
  id: string;
}

export const selectDrawingFn: DrawReducer<string> = (state, action) => {
  const id = action.payload;
  const drawing = state.shapes[id] ?? state.arrows[id];
  if (!drawing) {
    throw new Error(`Cannot find drawing with ${id}`);
  }

  state.select = {
    id,
    isEditing: false,
  };
  state.groupSelect = null;
  reorder(drawing, state);
};

export const cancelSelectFn: DrawReducer = (state, action) => {
  state.select = null;
  state.groupSelect = null;
};
