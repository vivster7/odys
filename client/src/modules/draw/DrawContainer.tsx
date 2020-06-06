import React, { useEffect } from 'react';
import { shallowEqual, useDispatch } from 'react-redux';
import { useSelector } from 'global/redux';
import { find, set, get, forEach } from 'lodash';

import Arrow from './arrow/Arrow';
import Shape from './shape/Shape';
import { addError } from 'modules/errors/errors.reducer';
import { Player } from 'modules/players/players.reducer';
import { fetchDrawings, DrawState } from './draw.reducer';
import {
  computeOrientationFromShapes,
  horizontalOrientation,
  ArrowData,
  ArrowOrientation,
} from 'modules/draw/arrow/path';

export interface BaseDrawingProps {
  id: string;
  playerSelected?: Player;
}

export interface DrawingProps extends BaseDrawingProps {
  arrowOrientation: ArrowOrientation;
}

function computeArrowOrder(drawState: DrawState) {
  const order = {};
  const _shapeValues = {};

  const sortArrowForOrientation = (
    shapeId: string,
    orientation: string,
    arrowData: ArrowData
  ) => {
    const values: ArrowData[] = get(order, [shapeId, orientation], []);
    const positionField = horizontalOrientation(orientation) ? 'yMid' : 'xMid';

    values.push(arrowData);
    set(
      order,
      [shapeId, orientation],
      values.sort((a, b) => {
        const _aa = get(_shapeValues, [a.otherShapeId, positionField]);
        const _bb = get(_shapeValues, [b.otherShapeId, positionField]);

        if (_aa < _bb) return -1;
        if (_aa > _bb) return 1;
        if (a.direction === 'from') return -1;
        return 1;
      })
    );
  };

  forEach(drawState.arrows, (arrow, id) => {
    const fromShape = drawState.shapes[arrow.fromShapeId];
    const toShape = drawState.shapes[arrow.toShapeId];
    const { from, to, r1, r2 } = computeOrientationFromShapes(
      fromShape,
      toShape
    );

    set(_shapeValues, fromShape.id, r1);
    set(_shapeValues, toShape.id, r2);

    if (from) {
      sortArrowForOrientation(fromShape.id, from, {
        arrowId: arrow.id,
        otherShapeId: arrow.toShapeId,
        direction: 'to',
      });
    }
    if (to) {
      sortArrowForOrientation(toShape.id, to, {
        arrowId: arrow.id,
        otherShapeId: arrow.fromShapeId,
        direction: 'from',
      });
    }
  });
  return order;
}

const Drawing: React.FC<DrawingProps> = (props) => {
  const { id, arrowOrientation } = props;
  const dispatch = useDispatch();
  const shape = useSelector((s) => s.draw.shapes[id]);
  const arrow = useSelector((s) => s.draw.arrows[id]);

  const playerSelected = useSelector((s) => {
    const playerSelection = find(s.players.selections, (s) =>
      s.select.includes(id)
    );
    return playerSelection ? s.players.players[playerSelection.id] : undefined;
  }, shallowEqual);

  if (shape) return <Shape id={id} playerSelected={playerSelected}></Shape>;
  if (arrow)
    return (
      <Arrow
        id={id}
        playerSelected={playerSelected}
        toShapeArrows={arrowOrientation[arrow.toShapeId]}
        fromShapeArrows={arrowOrientation[arrow.fromShapeId]}
      ></Arrow>
    );

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

  const arrowOrientation = useSelector((s) => computeArrowOrder(s.draw));

  useEffect(() => {
    if (board.loaded !== 'success') return;
    dispatch(fetchDrawings(board.id));
  }, [board, dispatch]);

  return (
    <>
      {drawOrder.map((id) => (
        <Drawing key={id} id={id} arrowOrientation={arrowOrientation}></Drawing>
      ))}
    </>
  );
});

export default DrawContainer;
