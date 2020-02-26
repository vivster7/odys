import React from 'react';
import DrawingBoard from '../components/DrawingBoard';

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
    </div>
  );
};

export default DrawingPage;
