import React from 'react';
import DrawingBoard from '../components/DrawingBoard';
import Cockpit from '../components/Cockpit';

const DrawingPage: React.FC = () => {
  return (
    <div
      style={{
        height: '100%',
        width: '100%'
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
          right: '10px'
        }}
      >
        <Cockpit></Cockpit>
      </div>
    </div>
  );
};

export default DrawingPage;
