import { PlayersReducer } from 'modules/players/players.reducer';
import { PlayerCursor } from './cursor';

export const syncCursorFn: PlayersReducer<PlayerCursor> = (state, action) => {
  const { id, cursor } = action.payload;
  if (state.players[id]) {
    state.players[id].cursor = cursor;
  }
};
