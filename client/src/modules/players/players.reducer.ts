import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { useEffect, Dispatch } from 'react';
import { registerSocketListener } from 'socket/socket';
import { updatePlayerSelectionFn } from './mixins/selection/selection.reducer';
import { PALETTE } from 'modules/draw/mixins/colors/colors';
import { difference, map } from 'lodash';

export type PlayersReducer<T = void> = CaseReducer<
  PlayersState,
  PayloadAction<T>
>;

interface Client {
  id: string;
}

export const connectPlayersFn: PlayersReducer<Client[]> = (state, action) => {
  const clients = action.payload;

  const availableColors = difference(
    PALETTE,
    Object.values(state.players).map((p) => p.color)
  );

  map(clients, ({ id }, idx) => {
    if (id && !state.players[id]) {
      state.players[id] = { id, color: availableColors[idx] };
    }
  });
};

export const disconnectPlayerFn: PlayersReducer<Client> = (state, action) => {
  const { id } = action.payload;
  delete state.players[id];
  state.selections = state.selections.filter((s) => s.playerId !== id);
};

export interface Player {
  id: string;
  color: string;
}

export interface PlayerSelection {
  id: string;
  playerId: string;
}

interface PlayersState {
  players: {
    [id: string]: Player;
  };
  selections: PlayerSelection[];
}

const initialState: PlayersState = {
  players: {},
  selections: [],
};

// playerLeft
// playerCursorMoved

const playersSlice = createSlice({
  name: 'players',
  initialState: initialState,
  reducers: {
    connectPlayers: connectPlayersFn,
    disconnectPlayer: disconnectPlayerFn,
    updatePlayerSelection: updatePlayerSelectionFn,
  },
  extraReducers: {},
});

export const {
  connectPlayers,
  disconnectPlayer,
  updatePlayerSelection,
} = playersSlice.actions;
const playersReducer = playersSlice.reducer;
export default playersReducer;

export function usePlayerConnectionListeners(
  dispatch: Dispatch<PayloadAction<Client[] | Client>>
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
      console.log(`goodbye friend ${data?.id}`);
      dispatch(disconnectPlayer(data));
    };
    return registerSocketListener('playerDisconnected', onPlayerDisonnected);
  }, [dispatch]);
}
