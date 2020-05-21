import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  DrawActionPending,
  DrawReducer,
  getDrawings,
} from 'modules/draw/draw.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import { emitEvent } from 'socket/socket';
import { applySelect } from '../multiSelect/multiSelect.reducer';

export interface SelectedState {
  id: string;
}

export interface SelectedDrawing {
  id: string;
  shiftKey: boolean;
}

export interface Selectable {
  id: string;
}

export const selectDrawing = createAsyncThunk(
  'draw/selectDrawing',
  async ({ id }: SelectedDrawing, thunkAPI) => {
    // TODO: bulk sync (multiselect)
    emitEvent('drawingSelected', id);
  }
);

export const selectDrawingPending: DrawActionPending<SelectedDrawing> = (
  state,
  action
) => {
  const { id, shiftKey } = action.meta.arg;
  let ids: Set<string> = new Set([id]);
  if (shiftKey) {
    if (state.select) {
      ids.add(state.select.id);
    }
    if (state.multiSelect) {
      Object.keys(state.multiSelect.selectedShapeIds).forEach((id) =>
        ids.add(id)
      );
    }
  }

  const drawings = getDrawings(state, Array.from(ids));
  applySelect(state, drawings);
  reorder(drawings, state);
};

export const cancelSelectFn: DrawReducer = (state, action) => {
  state.select = null;
  state.multiSelect = null;
};
