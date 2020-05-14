import React, { useEffect } from 'react';
import DrawingBoard from '../board/DrawingBoard';
import { useDispatch } from 'react-redux';
import { syncDrawing } from '../draw/draw.reducer';
import socket from 'socket/socket';
import { useParams } from 'react-router-dom';
import { getOrCreateRoom } from './room.reducer';

const Room: React.FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const onDrawingChanged = (data: any) => dispatch(syncDrawing(data));
    const emitter = socket.on('drawingChanged', onDrawingChanged);
    return () => {
      emitter.off('drawingChanged', onDrawingChanged);
    };
  }, [dispatch, id]);

  useEffect(() => {
    const onDrawingDeleted = (data: any) =>
      dispatch({
        type: 'draw/deleteDrawing/pending',
        meta: { arg: data },
      });
    const emitter = socket.on('drawingDeleted', onDrawingDeleted);
    return () => {
      emitter.off('drawingDeleted', onDrawingDeleted);
    };
  }, [dispatch, id]);

  useEffect(() => {
    dispatch(getOrCreateRoom(id));
  }, [dispatch, id]);

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
