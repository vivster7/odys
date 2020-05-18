import {
  createSlice,
  CaseReducer,
  PayloadAction,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { useEffect, Dispatch } from 'react';
import { registerSocketListener } from 'socket/socket';

export type PlayersReducer<T = void> = CaseReducer<
  PlayersState,
  PayloadAction<T>
>;

interface Client {
  id: string;
}

export const connectPlayersFn: PlayersReducer<Client[]> = (state, action) => {
  const clients = action.payload;
  map(clients, ({ id }, idx) => {
    if (id && !state.players[id]) {
      state.players[id] = { id, color: 'red' };
    }
  });
};

export const disconnectPlayerFn: PlayersReducer<Client> = (state, action) => {
  const { id } = action.payload;
  delete state.players[id];
  state.selections.filter((s) => s.playerId !== id);
};

export interface Player {
  id: string;
  color: string;
}

interface PlayersState {
  players: {
    [id: string]: Player;
  };
  selections: {
    id: string;
    playerId: string;
  }[];
}

const initialState: PlayersState = {
  players: {},
  selections: [],
};

// playerLeft
// playerCursorMoved
// playerSelected

const playersSlice = createSlice({
  name: 'players',
  initialState: initialState,
  reducers: {
    connectPlayers: connectPlayersFn,
    disconnectPlayer: disconnectPlayerFn,
  },
  extraReducers: {},
});

export const { connectPlayers, disconnectPlayer } = playersSlice.actions;
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
