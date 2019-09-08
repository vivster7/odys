import React, { useContext } from 'react';
import Svg from './shapes/Svg';
import Rect from './shapes/Rect';
import { v4 } from 'uuid';
import { ShapesContext } from './App';

const id = () => `id-${v4()}`;

const DrawingBoard: React.FC = () => {
  const { shapes, setShapes } = useContext(ShapesContext);

  // temp seed data
  if (shapes.length === 0) {
    setShapes([
      { id: id(), text: 'A', x: 0, y: 0 },
      { id: id(), text: 'C', x: 400, y: 400 },
      { id: id(), text: 'B', x: 200, y: 200 }
    ]);
  }

  return (
    <Svg>
      {shapes.map(d => (
        <Rect key={d.id} id={d.id} text={d.text} x={d.x} y={d.y}></Rect>
      ))}
    </Svg>
  );
};

export default DrawingBoard;
