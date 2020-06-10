import React, { useEffect } from 'react';
import { shallowEqual, useDispatch } from 'react-redux';
import { useSelector } from 'global/redux';

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
  ShapeValues,
} from 'modules/draw/arrow/path';

export interface BaseDrawingProps {
  id: string;
  playerSelected?: Player;
}

export interface DrawingProps extends BaseDrawingProps {
  arrowOrientation: ArrowOrientation;
}

function computeArrowOrder(drawState: DrawState) {
  const order: ArrowOrientation = {};
  const _shapeValues: { [shapeId: string]: ShapeValues } = {};

  const sortArrowForOrientation = (
    shapeId: string,
    orientation: string,
    arrowData: ArrowData
  ) => {
    const shapeArrows = order[shapeId] ?? {};
    const values: ArrowData[] = shapeArrows[orientation] ?? [];
    const positionField = horizontalOrientation(orientation) ? 'yMid' : 'xMid';

    values.push(arrowData);
    shapeArrows[orientation] = values.sort((a, b) => {
      const _aa = _shapeValues[a.otherShapeId][positionField];
      const _bb = _shapeValues[b.otherShapeId][positionField];

      if (_aa < _bb) return -1;
      if (_aa > _bb) return 1;
      if (a.direction === 'from') return 1;
      return 1;
    });
    order[shapeId] = shapeArrows;
  };

  Object.values(drawState.arrows).forEach((arrow) => {
    const fromShape = drawState.shapes[arrow.fromShapeId];
    const toShape = drawState.shapes[arrow.toShapeId];
    const { from, to, r1, r2 } = computeOrientationFromShapes(
      fromShape,
      toShape
    );

    _shapeValues[fromShape.id] = r1;
    _shapeValues[toShape.id] = r2;

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
    const playerSelection = s.players.selections.find((s) =>
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
