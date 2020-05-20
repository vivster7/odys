import React, { useEffect } from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { find } from 'lodash';

import { RootState } from '../../App';
import Arrow from './arrow/Arrow';
import { Shape } from './shape/Shape';
import { addError } from 'modules/errors/errors.reducer';
import { Player } from 'modules/players/players.reducer';
import {
  useDebounce,
  useDrawingChangedEmitter,
} from 'modules/draw/mixins/sync/sync';
import { fetchDrawings } from './draw.reducer';

export interface DrawingProps {
  id: string;
  playerSelected?: Player;
}

const Drawing: React.FC<DrawingProps> = (props) => {
  const { id } = props;
  const dispatch = useDispatch();
  const shape = useSelector((state: RootState) => state.draw.shapes[id]);
  const arrow = useSelector((state: RootState) => state.draw.arrows[id]);

  const debouncedShape = useDebounce(shape, 0);
  useDrawingChangedEmitter(debouncedShape);
  const debouncedArrow = useDebounce(arrow, 0);
  useDrawingChangedEmitter(debouncedArrow);

  const playerSelected = useSelector((state: RootState) => {
    const playerSelection = find(
      state.players.selections,
      (s) => s.select === id
    );
    return playerSelection
      ? state.players.players[playerSelection.id]
      : undefined;
  }, shallowEqual);

  if (shape) return <Shape id={id} playerSelected={playerSelected}></Shape>;
  if (arrow) return <Arrow id={id} playerSelected={playerSelected}></Arrow>;

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
