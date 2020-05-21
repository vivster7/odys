import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { updatePlayerSelectionFn } from './mixins/selection/selection.reducer';
import {
  connectPlayersFn,
  disconnectPlayerFn,
} from './mixins/connection/connection.reducer';
import { syncCursorFn } from './mixins/cursor/cursor.reducer';
import { Cursor } from 'modules/canvas/cursor/cursor';

export type PlayersReducer<T = void> = CaseReducer<
  PlayersState,
  PayloadAction<T>
>;

export interface Player {
  id: string;
  color: string;
  cursor?: Cursor;
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

const playersSlice = createSlice({
  name: 'players',
  initialState: initialState,
  reducers: {
    connectPlayers: connectPlayersFn,
    disconnectPlayer: disconnectPlayerFn,
    updatePlayerSelection: updatePlayerSelectionFn,
    syncCursor: syncCursorFn,
  },
  extraReducers: {},
});

export const {
  connectPlayers,
  disconnectPlayer,
  updatePlayerSelection,
  syncCursor,
} = playersSlice.actions;
const playersReducer = playersSlice.reducer;
export default playersReducer;
