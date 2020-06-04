import { PlayersReducer } from 'modules/players/players.reducer';
import { PlayerCursor } from './cursor';

export const syncCursorFn: PlayersReducer<PlayerCursor> = (state, action) => {
  const { playerId, cursor } = action.payload;
  if (!state.players[playerId]) {
    if (state.cursors[playerId]) {
      delete state.cursors[playerId];
    }
    return;
  }
  state.cursors[playerId] = {
    playerId,
    cursor,
  };
};
