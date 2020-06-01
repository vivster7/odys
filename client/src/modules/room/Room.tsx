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
import { syncState } from 'App';
import { keyup } from 'modules/keyboard/keyboard.reducer';

const Room: React.FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const selfClientId = useSelector((s) => s.players.self);

  // listen to keydown/keyup events and fire events
  // kinda want this at app level, but app doesn't have access to dispatch yet.
  useEffect(() => {
    const downHandler = (e: KeyboardEvent) => {
      const payload = {
        code: e.code,
        metaKey: e.metaKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
      };
      dispatch(keydown(payload));
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
      if (data.clientId !== selfClientId && data.data) {
        dispatch(syncState(data));
      }
    };
    return registerSocketListener('updatedState', onSyncState);
  }, [dispatch, selfClientId]);

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
