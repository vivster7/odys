import { useEffect, Dispatch } from 'react';
import { PayloadAction } from '@reduxjs/toolkit';
import { PlayersReducer, syncCursor } from 'modules/players/players.reducer';
import { emitEvent, registerSocketListener, ClientEvent } from 'socket/socket';
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

export function useCursorMovedListener(
  dispatch: Dispatch<PayloadAction<PlayerCursor>>
) {
  useEffect(() => {
    const onPlayersConnected = (event: ClientEvent) => {
      dispatch(
        syncCursor({
          id: event.clientId,
          cursor: event.data,
        })
      );
    };
    return registerSocketListener('cursorMoved', onPlayersConnected);
  }, [dispatch]);
}

export function useCursorMovedEmitter(cursor: Cursor) {
  useEffect(() => {
    emitEvent('cursorMoved', { ...cursor });
  }, [cursor]);
}
