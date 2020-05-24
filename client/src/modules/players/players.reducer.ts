import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import {
  connectPlayersFn,
  disconnectPlayerFn,
  registerSelfFn,
} from './mixins/connection/connection.reducer';
import { syncCursorFn } from './mixins/cursor/cursor.reducer';
import { Cursor } from 'modules/canvas/cursor/cursor';
import { RootState } from 'App';

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
  select: string[];
}

interface PlayersState {
  self: string;
  players: { [id: string]: Player };
  selections: PlayerSelection[];
}

const initialState: PlayersState = {
  self: '',
  players: {},
  selections: [],
};

const playersSlice = createSlice({
  name: 'players',
  initialState: initialState,
  reducers: {
    registerSelf: registerSelfFn,
    connectPlayers: connectPlayersFn,
    disconnectPlayer: disconnectPlayerFn,
    syncCursor: syncCursorFn,
  },
  extraReducers: {
    'global/syncState': (state, action: any) => {
      const clientId = action.payload.clientId;
      const rootState = action.payload.data as Partial<RootState>;

      const playerState = rootState.players;
      const drawState = rootState.draw;
      const selected = drawState && drawState.select;
      const multiSelected = drawState && drawState.multiSelect;

      if (playerState && playerState.players) {
        state.players = playerState.players;
      }

      const selections = state.selections.filter((s) => s.id !== clientId);
      if (!selected && !multiSelected) {
        state.selections = selections;
      } else if (selected) {
        selections.push({ id: clientId, select: [selected.id] });
        state.selections = selections;
      } else if (multiSelected) {
        const multiSelectedIds = Object.keys(multiSelected.selectedShapeIds);
        selections.push({ id: clientId, select: multiSelectedIds });
        state.selections = selections;
      }
    },
  },
});

export const {
  registerSelf,
  connectPlayers,
  disconnectPlayer,
  syncCursor,
} = playersSlice.actions;
const playersReducer = playersSlice.reducer;
export default playersReducer;
