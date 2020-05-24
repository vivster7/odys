import { findLast } from 'lodash';
import { isWithinBounds } from 'math/box';
import { DrawReducer } from 'modules/draw/draw.reducer';
import { applySelectOrDeselect } from '../multiSelect/multiSelect.reducer';

export interface SelectedState {
  playerId: string;
  id: string;
}

export interface SelectedDrawing {
  id: string;
  shiftKey: boolean;
  playerId: string;
}

export interface Selectable {
  id: string;
}

export const selectDrawingFn: DrawReducer<SelectedDrawing> = (
  state,
  action
) => {
  const { id, shiftKey, playerId } = action.payload;
  applySelectOrDeselect(state, id, shiftKey, playerId);
};

interface ClickPosition {
  x: number;
  y: number;
  shiftKey: boolean;
  playerId: string;
}

export const selectClickTargetFn: DrawReducer<ClickPosition> = (
  state,
  action
) => {
  const { x, y, shiftKey, playerId } = action.payload;

  const clickTargetId = findLast(state.drawOrder, (id) =>
    state.shapes[id] ? isWithinBounds(x, y, state.shapes[id]) : false
  );

  if (clickTargetId) {
    applySelectOrDeselect(state, clickTargetId, shiftKey, playerId);
  }
};

export const cancelSelectFn: DrawReducer = (state, action) => {
  state.select = null;
  state.multiSelect = null;
};
