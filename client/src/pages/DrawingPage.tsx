import React from 'react';
import DrawingBoard from '../components/DrawingBoard';
import Cockpit from '../components/cockpit/Cockpit';
import ToastContainer from '../components/ToastContainer';
import { useDispatch } from 'react-redux';
import { syncShape } from '../reducers/shapes/shape';
import socket from '../socket';

const DrawingPage: React.FC = () => {
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
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
        }}
      >
        <Cockpit></Cockpit>
      </div>
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
        }}
      >
        <ToastContainer></ToastContainer>
      </div>
    </div>
  );
};

export default DrawingPage;
