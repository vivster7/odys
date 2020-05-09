import React, { useEffect } from 'react';
import DrawingBoard from '../board/DrawingBoard';
import { useDispatch } from 'react-redux';
import { syncShape } from '../draw/draw.reducer';
import socket from '../../socket/socket';
import { useParams } from 'react-router-dom';

const Room: React.FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on('shapeChange', (data: any) => {
      dispatch(syncShape(data));
    });
  });

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
