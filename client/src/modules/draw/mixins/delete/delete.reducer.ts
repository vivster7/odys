import { useEffect } from 'react';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { DrawActionPending, getDrawings } from 'modules/draw/draw.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import { emitEvent, registerSocketListener } from 'socket/socket';
import { save } from '../save/save.reducer';
import { TimeTravelSafeAction } from 'modules/draw/timetravel/timeTravel';
import { OdysDispatch, RootState } from 'App';
import { getConnectedArrows } from 'modules/draw/arrow/arrow.reducer';

export interface Deleteable {
  id: string;
  isDeleted: boolean;
}

export const deleteDrawings = createAsyncThunk(
  'draw/deleteDrawings',
  async (ids: string[], thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const arrows = getConnectedArrows(state.draw, ids);
    const allIds = ids.concat(arrows.map((a) => a.id));

    // TOOD: bulk socket
    emitEvent('drawingDeleted', allIds[0]);
    thunkAPI.dispatch(save(allIds));
  }
);

export const deleteDrawingsPending: DrawActionPending<string[]> = (
  state,
  action
) => {
  const ids = action.meta.arg;
  const drawings = getDrawings(state, ids).concat(
    getConnectedArrows(state, ids)
  );
  const snapshots = drawings.map((d) => {
    return { ...d, isLastUpdatedBySync: false, isSavedInDB: true };
  });

  drawings.forEach((d) => (d.isDeleted = true));
  reorder(drawings, state);

  const undo: TimeTravelSafeAction = {
    actionCreatorName: 'safeUpdateDrawings',
    arg: snapshots,
  };
  const redo: TimeTravelSafeAction = {
    actionCreatorName: 'safeDeleteDrawings',
    arg: drawings.map((d) => d.id),
  };
  state.timetravel.undos.push({ undo, redo });
  state.timetravel.redos = [];
};

export function useDrawingDeletedListener(dispatch: OdysDispatch) {
  useEffect(() => {
    const onDrawingDeleted = (data: any) =>
      dispatch({
        type: 'draw/deleteDrawings/pending',
        meta: { arg: [data] },
      });
    return registerSocketListener('drawingDeleted', onDrawingDeleted);
  }, [dispatch]);
}
