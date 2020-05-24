import { PlayersReducer } from 'modules/players/players.reducer';
import { Cursor } from 'modules/canvas/cursor/cursor';

interface PlayerCursor {
  id: string;
  cursor: Cursor;
}

export const syncCursorFn: PlayersReducer<PlayerCursor> = (state, action) => {
  const { id, cursor } = action.payload;
  if (state.players[id]) {
    state.players[id].cursor = cursor;
  }
};
