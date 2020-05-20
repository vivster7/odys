import { PayloadAction } from '@reduxjs/toolkit';
import { useEffect, Dispatch } from 'react';
import { registerSocketListener, ClientEvent } from 'socket/socket';
import {
  PlayersReducer,
  PlayerSelection,
  updatePlayerSelection,
} from '../../players.reducer';

export const updatePlayerSelectionFn: PlayersReducer<PlayerSelection> = (
  state,
  action
) => {
  const { id, select } = action.payload;
  if (!state.players[id]) return;
  if (state.selections.find((s) => s.id === id && s.select === select)) return;

  state.selections = state.selections.filter((s) => s.id !== id);
  state.selections = [{ ...action.payload }, ...state.selections];
};

export function useDrawingSelectedListener(
  dispatch: Dispatch<PayloadAction<PlayerSelection>>
) {
  useEffect(() => {
    const onDrawingSelected = (event: ClientEvent) =>
      dispatch(
        updatePlayerSelection({
          id: event.clientId,
          select: event.data,
        })
      );
    return registerSocketListener('drawingSelected', onDrawingSelected);
  }, [dispatch]);
}
