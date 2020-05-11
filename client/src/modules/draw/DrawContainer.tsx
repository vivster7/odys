import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../App';
import { NewShape } from './shape/Shape';
import { getShapes } from './draw.reducer';
import { getArrows } from './arrow/arrow.reducer';

const DrawContainer: React.FC = React.memo(() => {
  const dispatch = useDispatch();
  const shapeOrder = useSelector((state: RootState) => state.draw.shapeOrder);
  const board = useSelector((state: RootState) => state.board);

  useEffect(() => {
    if (board.loaded !== 'success') return;
    dispatch(getShapes(board.id));
    dispatch(getArrows(board.id));
  }, [board, dispatch]);

  return (
    <>
      {shapeOrder.map((shapeId) => {
        return <NewShape key={shapeId} id={shapeId}></NewShape>;
      })}
    </>
  );
});

export default DrawContainer;
