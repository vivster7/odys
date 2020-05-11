import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../App';
import { NewShape } from './shape/Shape';
import { getArrows } from './arrow/arrow.reducer';
import { getShapes } from './shape/shape.reducer';
import { addError } from 'modules/errors/errors.reducer';
import Arrow from './arrow/Arrow';

interface DrawId {
  id: string;
}

const Drawing: React.FC<DrawId> = (props) => {
  const { id } = props;
  const dispatch = useDispatch();
  const shape = useSelector((state: RootState) => state.draw.shapes[id]);
  const arrow = useSelector((state: RootState) => state.draw.arrows[id]);

  if (shape) return <NewShape id={id}></NewShape>;
  if (arrow) return <Arrow id={id}></Arrow>;

  dispatch(addError(`Cannot draw ${id}`));
  return <></>;
};

const DrawContainer: React.FC = React.memo(() => {
  const dispatch = useDispatch();
  const drawOrder = useSelector((state: RootState) => state.draw.drawOrder);
  const board = useSelector((state: RootState) => state.board);

  useEffect(() => {
    if (board.loaded !== 'success') return;
    dispatch(getShapes(board.id));
    dispatch(getArrows(board.id));
  }, [board, dispatch]);

  return (
    <>
      {drawOrder.map((id) => (
        <Drawing key={id} id={id}></Drawing>
      ))}
    </>
  );
});

export default DrawContainer;
