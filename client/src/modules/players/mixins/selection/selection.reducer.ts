import { PayloadAction } from '@reduxjs/toolkit';
import { useEffect, Dispatch } from 'react';
import { registerSocketListener } from 'socket/socket';
import {
  PlayersReducer,
  PlayerSelection,
  updatePlayerSelection,
} from '../../players.reducer';

export const updatePlayerSelectionFn: PlayersReducer<PlayerSelection> = (
  state,
  action
) => {
  const { playerId } = action.payload;
  if (!state.players[playerId]) return;

  state.selections = state.selections.filter((s) => s.playerId !== playerId);
  state.selections = [{ ...action.payload }, ...state.selections];
};

export function useDrawingSelectedListener(
  dispatch: Dispatch<PayloadAction<PlayerSelection>>
) {
  useEffect(() => {
    const onDrawingSelected = (data: any) =>
      dispatch(updatePlayerSelection(data));
    return registerSocketListener('drawingSelected', onDrawingSelected);
  }, [dispatch]);
}
