import { DrawReducer, getDrawing } from '../../draw.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';

export interface SelectedDrawing {
  id: string;
}

export interface Selectable {
  id: string;
}

export const selectDrawingFn: DrawReducer<string> = (state, action) => {
  const id = action.payload;
  const drawing = getDrawing(state, id);

  state.select = {
    id,
  };
  state.multiSelect = null;
  reorder([drawing], state);
};

export const cancelSelectFn: DrawReducer = (state, action) => {
  state.select = null;
  state.multiSelect = null;
};
