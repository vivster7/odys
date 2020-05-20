import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../App';
import { Shape } from './shape/Shape';
import { addError } from 'modules/errors/errors.reducer';
import Arrow from './arrow/Arrow';
import {
  useDebounce,
  useDrawingChangedEmitter,
} from 'modules/draw/mixins/sync/sync';
import { fetchDrawings } from './draw.reducer';

interface DrawId {
  id: string;
}

const Drawing: React.FC<DrawId> = (props) => {
  const { id } = props;
  const dispatch = useDispatch();
  const shape = useSelector((state: RootState) => state.draw.shapes[id]);
  const arrow = useSelector((state: RootState) => state.draw.arrows[id]);

  const debouncedShape = useDebounce(shape, 0);
  useDrawingChangedEmitter(debouncedShape);
  const debouncedArrow = useDebounce(arrow, 0);
  useDrawingChangedEmitter(debouncedArrow);

  if (shape) return <Shape id={id}></Shape>;
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
    dispatch(fetchDrawings(board.id));
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
