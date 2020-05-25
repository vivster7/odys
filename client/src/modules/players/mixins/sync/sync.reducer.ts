/**
 * Note to future: the logic in `syncSelectedDiff` and `syncMultiSelectedDiff`
 * is extra convoluted because we are deconstructing a diff from `state.draw.select`
 * and `state.draw.multiSelect` to construct the state in `state.players.selections`.
 *
 * Combining these states so we could just apply the diff as a patch would make
 * this much simpler. Think Hard!
 *
 */
import { PayloadAction } from '@reduxjs/toolkit';
import * as jdp from 'jsondiffpatch';
import { PlayersState } from 'modules/players/players.reducer';

// These types were discovered by watching debugger and from:
// https://github.com/benjamine/jsondiffpatch/blob/master/docs/deltas.md
type SelectedDiffSet = [null, { id: string; [key: string]: any }];
type SelectedDiffUnset = [{ id: string; [key: string]: any }, null];
type SelectedDiffChange = { id: [string, string]; [key: string]: any };
type SelectedDiff = SelectedDiffSet | SelectedDiffUnset | SelectedDiffChange;

type MultiSelectedDiffSet = [
  null,
  { selectedShapesId: string; [key: string]: any }
];
type MultiSelectedDiffUnset = [
  { selectedShapesId: string; [key: string]: any },
  null
];
type MultiSelectedDiffChange = {
  selectedShapeIds: { [id: string]: [boolean] | [boolean, 0, 0] };
  [key: string]: any;
};
type MultiSelectedDiff =
  | MultiSelectedDiffSet
  | MultiSelectedDiffUnset
  | MultiSelectedDiffChange;

export const syncStateFn = (
  state: PlayersState,
  action: PayloadAction<any>
) => {
  const clientId = action.payload.clientId;
  const stateDiff = action.payload.data as any;

  if (stateDiff.players && stateDiff.players.players) {
    jdp.patch(state.players, stateDiff.players.players);
  }

  const drawDiff = stateDiff.draw;
  const selectedDiff = drawDiff && (drawDiff.select as SelectedDiff | null);
  const multiSelectedDiff =
    drawDiff && (drawDiff.multiSelect as MultiSelectedDiff | null);

  if (selectedDiff) {
    syncSelectedDiff(state, clientId, selectedDiff, multiSelectedDiff);
  }

  if (multiSelectedDiff) {
    syncMultiSelectedDiff(state, clientId, selectedDiff, multiSelectedDiff);
  }
};

const syncSelectedDiff = (
  state: PlayersState,
  clientId: string,
  selectedDiff: SelectedDiff,
  multiSelectedDiff: MultiSelectedDiff | null
) => {
  if (Array.isArray(selectedDiff)) {
    const [prev, next] = selectedDiff;
    if (prev && !next) {
      // unselect -- but defer to multiSelectedDiff if it exists
      if (!multiSelectedDiff) {
        state.selections = state.selections.filter((s) => s.id !== clientId);
      }
    } else if (!prev && next) {
      // new selection
      state.selections = state.selections.filter((s) => s.id !== clientId);
      state.selections.push({ id: clientId, select: [next.id] });
    }
  } else if (selectedDiff.hasOwnProperty('id')) {
    // changed selection
    const [prev, next] = selectedDiff.id; // eslint-disable-line
    state.selections = state.selections.filter((s) => s.id !== clientId);
    state.selections.push({ id: clientId, select: [next] });
  }
};

const syncMultiSelectedDiff = (
  state: PlayersState,
  clientId: string,
  selectedDiff: SelectedDiff | null,
  multiSelectedDiff: MultiSelectedDiff
) => {
  if (Array.isArray(multiSelectedDiff)) {
    const [prev, next] = multiSelectedDiff as any;
    if (prev && !next) {
      // unselect but defer to selectedDiff if it exists
      if (!selectedDiff) {
        state.selections = state.selections.filter((s) => s.id !== clientId);
      }
    } else if (!prev && next) {
      // new selection
      state.selections = state.selections.filter((s) => s.id !== clientId);
      state.selections.push({
        id: clientId,
        select: Object.keys(next.selectedShapeIds),
      });
    }
  } else if (multiSelectedDiff.hasOwnProperty('selectedShapeIds')) {
    // changed selection
    const selectedShapeIdsDiff = multiSelectedDiff.selectedShapeIds;
    const selectionIdx = state.selections.findIndex((s) => s.id === clientId);
    if (selectionIdx >= 0) {
      const selectedIds = state.selections[selectionIdx].select;
      const set = new Set(selectedIds);
      const toAppend = Object.keys(selectedShapeIdsDiff).filter(
        (id) => !set.has(id)
      );
      const toDelete = new Set(
        selectedIds.filter(
          (id) =>
            selectedShapeIdsDiff[id] &&
            selectedShapeIdsDiff[id].length === 3 &&
            selectedShapeIdsDiff[id][1] === 0 &&
            selectedShapeIdsDiff[id][2] === 0
        )
      );
      const updated = selectedIds
        .filter((id) => !toDelete.has(id))
        .concat(toAppend);
      state.selections[selectionIdx].select = updated;
    }
  }
};