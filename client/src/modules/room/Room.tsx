import React, { useEffect } from 'react';
import DrawingBoard from '../board/Board';
import { useSelector } from 'global/redux';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getOrCreateRoom } from './room.reducer';
import { keydown } from 'modules/keyboard/keydown/keydown.reducer';
import { usePlayerConnectionListeners } from 'modules/players/mixins/connection/connection.reducer';
import { useCursorMovedListener } from 'modules/players/mixins/cursor/cursor';

import { connect, registerSocketListener } from 'socket/socket';
import { syncState, OdysDispatch } from 'App';
import { keyup, KeyEvent, clearKeys } from 'modules/keyboard/keyboard.reducer';
import throttle from 'lodash.throttle';

const throttledKeydown = throttle(
  (dispatch: OdysDispatch, payload: KeyEvent) => {
    dispatch(keydown(payload));
  },
  50
);

const Room: React.FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const playerId = useSelector((s) => s.players.self);

  // listen to keydown/keyup events and fire events
  // kinda want this at app level, but app doesn't have access to dispatch yet.
  useEffect(() => {
    const downHandler = (e: KeyboardEvent) => {
      const payload: KeyEvent = {
        code: e.code,
        metaKey: e.metaKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
      };
      throttledKeydown(dispatch, payload);
    };

    const upHandler = (e: KeyboardEvent) => {
      const payload = {
        code: e.code,
        metaKey: e.metaKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
      };
      dispatch(keyup(payload));
    };

    // reset keys when switching tabs
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        dispatch(clearKeys());
      }
    });

    window.addEventListener('keydown', downHandler, { capture: true });
    window.addEventListener('keyup', upHandler, { capture: true });
    return () => {
      window.removeEventListener('keydown', downHandler, { capture: true });
      window.removeEventListener('keyup', upHandler, { capture: true });
    };
  }, [dispatch]);

  useEffect(() => {
    connect(dispatch, id);
  }, [dispatch, id]);

  useEffect(() => {
    dispatch(getOrCreateRoom(id));
  }, [dispatch, id]);

  useEffect(() => {
    const onSyncState = (data: any) => {
      if (data.playerId !== playerId && data.data) {
        dispatch(syncState(data));
      }
    };
    return registerSocketListener('updatedState', onSyncState);
  }, [dispatch, playerId]);

  usePlayerConnectionListeners(dispatch);
  useCursorMovedListener(dispatch);

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
      }}
      className="row"
    >
      <div className="col flex-elem">
        <DrawingBoard></DrawingBoard>
      </div>
    </div>
  );
};

export default Room;
