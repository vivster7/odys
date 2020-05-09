import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../App';
import { NewShape } from './shapes/Shape';

const ShapesContainer: React.FC = React.memo(() => {
  const shapeOrder = useSelector((state: RootState) => state.draw.shapeOrder);

  return (
    <>
      {shapeOrder.map((shapeId) => {
        return <NewShape key={shapeId} id={shapeId}></NewShape>;
      })}
    </>
  );
});

export default ShapesContainer;
