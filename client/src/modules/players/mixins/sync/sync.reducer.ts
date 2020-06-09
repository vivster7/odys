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

type MultiSelectedDiffSet = [null, { selectedIds: string; [key: string]: any }];
type MultiSelectedDiffUnset = [
  { selectedIds: string; [key: string]: any },
  null
];
type MultiSelectedDiffChange = {
  selectedIds: { [id: string]: [boolean] | [boolean, 0, 0] };
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
  const playerId = action.payload.playerId;
  const stateDiff = action.payload.data as any;

  if (stateDiff.players && stateDiff.players.players) {
    try {
      jdp.patch(state.players, stateDiff.players.players);
    } catch (err) {
      console.error(err);
    }
  }

  const drawDiff = stateDiff.draw;
  const selectedDiff = drawDiff && (drawDiff.select as SelectedDiff | null);
  const multiSelectedDiff =
    drawDiff && (drawDiff.multiSelect as MultiSelectedDiff | null);

  if (selectedDiff) {
    syncSelectedDiff(state, playerId, selectedDiff, multiSelectedDiff);
  }

  if (multiSelectedDiff) {
    syncMultiSelectedDiff(state, playerId, selectedDiff, multiSelectedDiff);
  }
};

const syncSelectedDiff = (
  state: PlayersState,
  playerId: string,
  selectedDiff: SelectedDiff,
  multiSelectedDiff: MultiSelectedDiff | null
) => {
  if (Array.isArray(selectedDiff)) {
    const [prev, next] = selectedDiff;
    if (prev && !next) {
      // unselect -- but defer to multiSelectedDiff if it exists
      if (!multiSelectedDiff) {
        state.selections = state.selections.filter((s) => s.id !== playerId);
      }
    } else if (!prev && next) {
      // new selection
      state.selections = state.selections.filter((s) => s.id !== playerId);
      state.selections.push({ id: playerId, select: [next.id] });
    }
  } else if (selectedDiff.hasOwnProperty('id')) {
    // changed selection
    const [prev, next] = selectedDiff.id; // eslint-disable-line
    state.selections = state.selections.filter((s) => s.id !== playerId);
    state.selections.push({ id: playerId, select: [next] });
  }
};

const syncMultiSelectedDiff = (
  state: PlayersState,
  playerId: string,
  selectedDiff: SelectedDiff | null,
  multiSelectedDiff: MultiSelectedDiff
) => {
  if (Array.isArray(multiSelectedDiff)) {
    const [prev, next] = multiSelectedDiff as any;
    if (prev && !next) {
      // unselect but defer to selectedDiff if it exists
      if (!selectedDiff) {
        state.selections = state.selections.filter((s) => s.id !== playerId);
      }
    } else if (!prev && next) {
      // new selection
      state.selections = state.selections.filter((s) => s.id !== playerId);
      state.selections.push({
        id: playerId,
        select: Object.keys(next.selectedIds),
      });
    }
  } else if (multiSelectedDiff.hasOwnProperty('selectedIds')) {
    // changed selection
    const selectedIdsDiff = multiSelectedDiff.selectedIds;
    const selectionIdx = state.selections.findIndex((s) => s.id === playerId);
    if (selectionIdx >= 0) {
      const selectedIds = state.selections[selectionIdx].select;
      const set = new Set(selectedIds);
      const toAppend = Object.keys(selectedIdsDiff).filter(
        (id) => !set.has(id)
      );
      const toDelete = new Set(
        selectedIds.filter(
          (id) =>
            selectedIdsDiff[id] &&
            selectedIdsDiff[id].length === 3 &&
            selectedIdsDiff[id][1] === 0 &&
            selectedIdsDiff[id][2] === 0
        )
      );
      const updated = selectedIds
        .filter((id) => !toDelete.has(id))
        .concat(toAppend);
      state.selections[selectionIdx].select = updated;
    }
  }
};
