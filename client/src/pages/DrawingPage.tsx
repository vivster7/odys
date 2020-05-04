import React from 'react';
import DrawingBoard from '../components/DrawingBoard';
import Cockpit from '../components/Cockpit';
import ToastContainer from '../components/ToastContainer';

const DrawingPage: React.FC = () => {
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
