import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import {
  connectPlayersFn,
  disconnectPlayerFn,
} from './mixins/connection/connection.reducer';
import { syncStateFn } from './mixins/sync/sync.reducer';
import { syncCursorFn } from './mixins/cursor/sync.reducer';
import { syncSelectBoxFn } from './mixins/selectbox/sync.reducer';
import { PlayerSelectBox } from './mixins/selectbox/selectbox';
import { PlayerCursor } from './mixins/cursor/cursor';
import uuid from 'uuid';

export const CURRENT_PLAYER_ID = uuid.v4();

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
  select: string[];
}

export interface PlayersState {
  self: string;
  players: { [id: string]: Player };
  selections: PlayerSelection[];
  selectBoxes: { [playerId: string]: PlayerSelectBox };
  cursors: { [playerId: string]: PlayerCursor };
}

const initialState: PlayersState = {
  self: CURRENT_PLAYER_ID,
  players: {},
  selections: [],
  selectBoxes: {},
  cursors: {},
};

const playersSlice = createSlice({
  name: 'players',
  initialState: initialState,
  reducers: {
    connectPlayers: connectPlayersFn,
    disconnectPlayer: disconnectPlayerFn,
    syncCursor: syncCursorFn,
    syncSelectBox: syncSelectBoxFn,
  },
  extraReducers: { 'global/syncState': syncStateFn },
});

export const {
  connectPlayers,
  disconnectPlayer,
  syncCursor,
  syncSelectBox,
} = playersSlice.actions;
const playersReducer = playersSlice.reducer;
export default playersReducer;
