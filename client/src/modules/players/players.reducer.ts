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

export const connectPlayerFn: PlayersReducer<Client> = (state, action) => {
  const { id } = action.payload;
  if (!state.players[id]) {
    state.players[id] = { color: 'red' };
  }
};

export const disconnectPlayerFn: PlayersReducer<Client> = (state, action) => {
  const { id } = action.payload;
  delete state.players[id];
  state.selections.filter((s) => s.playerId !== id);
};

interface Client {
  id: string;
}

interface Players {
  [id: string]: {
    color: string;
  };
}

interface PlayersState {
  players: Players;
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
    connectPlayer: connectPlayerFn,
    disconnectPlayer: disconnectPlayerFn,
  },
  extraReducers: {},
});

export const { connectPlayer, disconnectPlayer } = playersSlice.actions;
const playersReducer = playersSlice.reducer;
export default playersReducer;

export function usePlayerConnectionListeners(
  dispatch: Dispatch<PayloadAction<Client>>
) {
  useEffect(() => {
    const onPlayerConnected = (data: any) => {
      console.log(`welcome friend ${data?.id}`);
      dispatch(connectPlayer(data));
    };
    return registerSocketListener('playerConnected', onPlayerConnected);
  }, [dispatch]);

  useEffect(() => {
    const onPlayerDisonnected = (data: any) => {
      console.log(`goodbye friend ${data?.id}`);
      dispatch(disconnectPlayer(data));
    };
    return registerSocketListener('playerDisconnected', onPlayerDisonnected);
  }, [dispatch]);
}
