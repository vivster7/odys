import { createAsyncThunk } from '@reduxjs/toolkit';
import { findLast } from 'lodash';
import { isWithinBounds } from 'math/box';
import { DrawActionPending, DrawReducer } from 'modules/draw/draw.reducer';
import { emitEvent } from 'socket/socket';
import { applySelectOrDeselect } from '../multiSelect/multiSelect.reducer';

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
  applySelectOrDeselect(state, id, shiftKey);
};

interface clickPosition {
  x: number;
  y: number;
  shiftKey: boolean;
}

export const selectClickTargetFn: DrawReducer<clickPosition> = (
  state,
  action
) => {
  const { x, y, shiftKey } = action.payload;

  const clickTargetId = findLast(state.drawOrder, (id) =>
    state.shapes[id] ? isWithinBounds(x, y, state.shapes[id]) : false
  );

  if (clickTargetId) {
    applySelectOrDeselect(state, clickTargetId, shiftKey);
  }
};

export const cancelSelectFn: DrawReducer = (state, action) => {
  state.select = null;
  state.multiSelect = null;
};
