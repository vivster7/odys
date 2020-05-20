import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { updatePlayerSelectionFn } from './mixins/selection/selection.reducer';
import {
  connectPlayersFn,
  disconnectPlayerFn,
} from './mixins/connection/connection.reducer';

export type PlayersReducer<T = void> = CaseReducer<
  PlayersState,
  PayloadAction<T>
>;

export interface Player {
  id: string;
  color: string;
}

export interface PlayerSelection {
  id: string;
  select: string;
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
