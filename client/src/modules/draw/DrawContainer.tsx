import React, { useEffect } from 'react';
import { shallowEqual, useDispatch } from 'react-redux';
import { useSelector } from 'global/redux';

import Arrow from './arrow/Arrow';
import Shape from './shape/Shape';
import { addError } from 'modules/errors/errors.reducer';
import { Player } from 'modules/players/players.reducer';
import { fetchDrawings } from './draw.reducer';

export interface DrawingProps {
  id: string;
  playerSelected?: Player;
}

const Drawing: React.FC<DrawingProps> = (props) => {
  const { id } = props;
  const dispatch = useDispatch();
  const shape = useSelector((s) => s.draw.shapes[id]);
  const arrow = useSelector((s) => s.draw.arrows[id]);

  const playerSelected = useSelector((s) => {
    const playerSelection = s.players.selections.find((s) =>
      s.select.includes(id)
    );
    return playerSelection ? s.players.players[playerSelection.id] : undefined;
  }, shallowEqual);

  if (shape) return <Shape id={id} playerSelected={playerSelected}></Shape>;
  if (arrow) return <Arrow id={id} playerSelected={playerSelected}></Arrow>;

  console.error(`Cannot draw ${id}`);
  dispatch(
    addError(
      "We're having issues syncing this diagram. Try refreshing this page."
    )
  );
  return <></>;
};

const DrawContainer: React.FC = React.memo(() => {
  const dispatch = useDispatch();
  const drawOrder = useSelector((s) => s.draw.drawOrder);
  const board = useSelector((s) => s.board);

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
