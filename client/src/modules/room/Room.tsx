import React, { useEffect } from 'react';
import DrawingBoard from '../board/DrawingBoard';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getOrCreateRoom } from './room.reducer';
import { keydown } from 'global/keydown.reducer';
import { useDrawingSelectedListener } from 'modules/draw/mixins/select/select.reducer';
import { useDrawingChangedListener } from 'modules/draw/mixins/sync/sync';
import { useDrawingDeletedListener } from 'modules/draw/mixins/delete/delete.reducer';
import { useDrawingSavedListener } from 'modules/draw/mixins/save/save.reducer';
import { usePlayerConnectionListeners } from 'modules/players/players.reducer';

import { connect } from 'socket/socket';

const Room: React.FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

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
    dispatch(getOrCreateRoom(id));
  }, [dispatch, id]);

  useEffect(() => {
    connect(id);
  }, [id]);

  usePlayerConnectionListeners(dispatch);
  useDrawingChangedListener(dispatch);
  useDrawingSavedListener(dispatch);
  useDrawingDeletedListener(dispatch);
  useDrawingSelectedListener(dispatch);

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
