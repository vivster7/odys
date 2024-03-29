import { createAsyncThunk } from '@reduxjs/toolkit';
import { DrawActionPending, getDrawings } from 'modules/draw/draw.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import { saveDelete } from '../save/save.reducer';
import { TimeTravelSafeAction } from 'modules/draw/timetravel/timeTravel';
import { RootState } from 'App';
import {
  getConnectedArrows,
  instanceOfArrow,
} from 'modules/draw/arrow/arrow.reducer';
import { cancelSelectFn } from '../select/select.reducer';
import { uniq, uniqBy } from 'lodash';
import { positionArrowsFn } from 'modules/draw/arrowposition/arrowPosition.reducer';

export interface Deleteable {
  id: string;
  isDeleted: boolean;
}

export const deleteDrawings = createAsyncThunk(
  'draw/deleteDrawings',
  async ({ ids }: DeleteDrawings, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const arrows = getConnectedArrows(state.draw, ids);
    const allIds = uniq(ids.concat(arrows.map((a) => a.id)));

    thunkAPI.dispatch(saveDelete(allIds));
  }
);

interface DeleteDrawings {
  ids: string[];
}

export const deleteDrawingsPending: DrawActionPending<DeleteDrawings> = (
  state,
  action
) => {
  const { ids } = action.meta.arg;
  const drawings = uniqBy(
    [...getDrawings(state, ids), ...getConnectedArrows(state, ids)],
    (d) => d.id
  );

  const snapshots = drawings.map((d) => {
    return { ...d, isSavedInDB: true };
  });

  drawings.forEach((d) => (d.isDeleted = true));
  reorder(drawings, state);

  // cancel selection after deletion
  cancelSelectFn(state, { type: 'draw/cancelSelect', payload: undefined });

  const arrows = drawings.filter(instanceOfArrow);
  positionArrowsFn(state, { type: 'draw/positionArrows', payload: arrows });

  const undo: TimeTravelSafeAction = {
    actionCreatorName: 'safeUpdateDrawings',
    arg: { drawings: snapshots },
  };
  const redo: TimeTravelSafeAction = {
    actionCreatorName: 'safeDeleteDrawings',
    arg: drawings.map((d) => d.id),
  };
  state.timetravel.undos.push({ undo, redo });
  state.timetravel.redos = [];
};
