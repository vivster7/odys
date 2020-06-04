import { useEffect, Dispatch } from 'react';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  PlayersReducer,
  connectPlayers,
  disconnectPlayer,
} from 'modules/players/players.reducer';
import { registerSocketListener } from 'socket/socket';
import { PALETTE } from 'global/colors';
import { difference, map } from 'lodash';

export const registerSelfFn: PlayersReducer<string> = (state, action) => {
  const id = action.payload;
  state.self = id;

  const connectPlayerAction = {
    type: 'players/connectPlayers',
    payload: [id],
  };
  connectPlayersFn(state, connectPlayerAction);
};

export const unregisterSelfFn: PlayersReducer = (state, action) => {
  const id = state.self;
  const disconnectPlayerAction = {
    type: 'players/disconnectPlayer',
    payload: id,
  };
  disconnectPlayerFn(state, disconnectPlayerAction);
};

export const connectPlayersFn: PlayersReducer<string[]> = (state, action) => {
  const playerIds = action.payload;

  const availableColors = difference(
    PALETTE,
    Object.values(state.players).map((p) => p.color)
  );

  map(playerIds, (id, idx) => {
    if (id && !state.players[id]) {
      state.players[id] = {
        id,
        color: availableColors[idx % availableColors.length],
      };
    }
  });
};

export const disconnectPlayerFn: PlayersReducer<string> = (state, action) => {
  const id = action.payload;
  delete state.players[id];
  // filter player out from selections
  state.selections = state.selections.filter((s) => s.id !== id);
};

export function usePlayerConnectionListeners(
  dispatch: Dispatch<PayloadAction<string[] | string>>
) {
  useEffect(() => {
    const onPlayersConnected = (data: any) => {
      console.log(`welcome friends ${data}`);
      dispatch(connectPlayers(data));
    };
    return registerSocketListener('playersConnected', onPlayersConnected);
  }, [dispatch]);

  useEffect(() => {
    const onPlayerDisonnected = (data: any) => {
      console.log(`goodbye friend ${data}`);
      dispatch(disconnectPlayer(data));
    };
    return registerSocketListener('playerDisconnected', onPlayerDisonnected);
  }, [dispatch]);
}
