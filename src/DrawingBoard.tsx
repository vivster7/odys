import React from 'react';
import Svg from './shapes/Svg';
import Rect from './shapes/Rect';

const DrawingBoard: React.FC = () => {
  return (
    <Svg>
      <Rect text="A" x={0} y={0}></Rect>
      <Rect text="Hello" x={100} y={120}></Rect>
      <Rect text="B" x={200} y={220}></Rect>
    </Svg>
  );
};

export default DrawingBoard;
