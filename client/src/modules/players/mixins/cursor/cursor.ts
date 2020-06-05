import { useEffect } from 'react';
import { syncCursor } from 'modules/players/players.reducer';
import { emitEvent, registerSocketListener, ClientEvent } from 'socket/socket';
import { Cursor } from 'modules/canvas/cursor/cursor';
import { OdysDispatch } from 'App';

export interface PlayerCursor {
  playerId: string;
  cursor: Cursor;
}

export function useCursorMovedListener(dispatch: OdysDispatch) {
  useEffect(() => {
    const onCursorMoved = (event: ClientEvent) => {
      dispatch(
        syncCursor({
          playerId: event.playerId,
          cursor: event.data,
        })
      );
    };
    return registerSocketListener('cursorMoved', onCursorMoved);
  }, [dispatch]);
}

export function useCursorMovedEmitter(cursor: Cursor) {
  useEffect(() => {
    emitEvent('cursorMoved', { ...cursor });
  }, [cursor]);
}
