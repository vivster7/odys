import { findLast } from 'lodash';
import { isWithinBounds } from 'math/box';
import { DrawReducer, DrawState } from 'modules/draw/draw.reducer';
import { applySelectOrDeselect } from '../multiSelect/multiSelect.reducer';
import { getShapes } from 'modules/draw/shape/shape.reducer';
import { uniq } from 'lodash';

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

export const selectDrawingFn: DrawReducer<SelectedDrawing> = (
  state,
  action
) => {
  const { id, shiftKey } = action.payload;
  applySelectOrDeselect(state, id, shiftKey);
};

interface ClickPosition {
  x: number;
  y: number;
  shiftKey: boolean;
}

export const selectClickTargetFn: DrawReducer<ClickPosition> = (
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

export function allSelectedIds(state: DrawState): string[] {
  const { select, multiSelect } = state;
  let ids = [];
  if (select?.id) {
    ids.push(select.id);
  }

  if (multiSelect) {
    ids = ids.concat(Object.keys(multiSelect.selectedShapeIds));
  }

  const shapes = getShapes(state, ids);
  const groups = shapes.filter((s) => s.type === 'grouping_rect');
  const inner = groups.flatMap((g) => g.inside);
  ids = ids.concat(inner);
  return uniq(ids);
}
