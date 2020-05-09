import React from 'react';
import DrawingBoard from '../board/DrawingBoard';
import { useDispatch } from 'react-redux';
import { syncShape } from '../draw/draw.reducer';
import socket from '../../socket/socket';

const Room: React.FC = () => {
  const dispatch = useDispatch();

  socket.on('shapeChange', (data: any) => {
    dispatch(syncShape(data));
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
