import React, { useEffect } from 'react';
import DrawingBoard from '../board/DrawingBoard';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getOrCreateRoom } from './room.reducer';
import { keydown } from 'global/keydown.reducer';
import { usePlayerConnectionListeners } from 'modules/players/mixins/connection/connection.reducer';

import { connect, registerSocketListener } from 'socket/socket';
import { syncState, RootState } from 'App';

const Room: React.FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const selfClientId = useSelector((state: RootState) => state.players.self);

  // listen to keydown events and fire events
  // kinda want this at app level, but app doesn't have access to dispatch yet.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      dispatch(
        keydown({ code: e.code, metaKey: e.metaKey, shiftKey: e.shiftKey })
      );
    };
    window.addEventListener('keydown', handler, { capture: true });
    return () => {
      window.removeEventListener('keydown', handler, { capture: true });
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
      if (data.clientId !== selfClientId) {
        dispatch(syncState(data));
      }
    };
    return registerSocketListener('updatedState', onSyncState);
  }, [dispatch, selfClientId]);

  usePlayerConnectionListeners(dispatch);

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
