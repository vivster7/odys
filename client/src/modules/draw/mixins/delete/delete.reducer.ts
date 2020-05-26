import { createAsyncThunk } from '@reduxjs/toolkit';
import { DrawActionPending, getDrawings } from 'modules/draw/draw.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import { save } from '../save/save.reducer';
import { TimeTravelSafeAction } from 'modules/draw/timetravel/timeTravel';
import { RootState } from 'App';
import { getConnectedArrows } from 'modules/draw/arrow/arrow.reducer';

export interface Deleteable {
  id: string;
  isDeleted: boolean;
}

export const deleteDrawings = createAsyncThunk(
  'draw/deleteDrawings',
  async ({ ids }: DeleteDrawings, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const arrows = getConnectedArrows(state.draw, ids);
    const allIds = ids.concat(arrows.map((a) => a.id));

    thunkAPI.dispatch(save(allIds));
  }
);

interface DeleteDrawings {
  ids: string[];
  playerId: string;
}

export const deleteDrawingsPending: DrawActionPending<DeleteDrawings> = (
  state,
  action
) => {
  const { ids, playerId } = action.meta.arg;
  const drawings = getDrawings(state, ids).concat(
    getConnectedArrows(state, ids)
  );
  const snapshots = drawings.map((d) => {
    return { ...d, isSavedInDB: true };
  });

  drawings.forEach((d) => (d.isDeleted = true));
  reorder(drawings, state);

  const undo: TimeTravelSafeAction = {
    actionCreatorName: 'safeUpdateDrawings',
    arg: { playerId: playerId, drawings: snapshots },
  };
  const redo: TimeTravelSafeAction = {
    actionCreatorName: 'safeDeleteDrawings',
    arg: drawings.map((d) => d.id),
  };
  state.timetravel.undos.push({ undo, redo });
  state.timetravel.redos = [];
};
