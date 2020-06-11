import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'global/redux';

import Arrow from './arrow/Arrow';
import Shape from './shape/Shape';
import { addError } from 'modules/errors/errors.reducer';
import { Player } from 'modules/players/players.reducer';
import { fetchDrawings, Drawing as DrawingT } from './draw.reducer';
import { isEmpty } from 'lodash';
import { instanceOfShape, Shape as ShapeT } from './shape/shape.reducer';
import { instanceOfArrow } from './arrow/arrow.reducer';
import { computeOrientation } from './arrow/path';

export interface DrawingProps {
  drawing: DrawingT;
  isDragging: boolean;
  isEditing: boolean;
  isSelected: boolean;
  isMultiSelected: boolean;
  shouldIgnorePointerOver: boolean;
  playerSelected?: Player;
  selectedShape?: ShapeT;
  fromShape?: ShapeT;
  toShape?: ShapeT;
  fromShapeArrows?: string[];
  toShapeArrows?: string[];
}

const Drawing: React.FC<DrawingProps> = React.memo((props) => {
  const {
    drawing,
    isDragging,
    isEditing,
    isSelected,
    isMultiSelected,
    shouldIgnorePointerOver,
    playerSelected,
    selectedShape,
    fromShape,
    toShape,
    fromShapeArrows,
    toShapeArrows,
  } = props;
  const { id } = drawing;
  const dispatch = useDispatch();
  if (instanceOfShape(drawing)) {
    return (
      <Shape
        shape={drawing}
        playerSelected={playerSelected}
        isDragging={isDragging}
        isEditing={isEditing}
        isSelected={isSelected}
        isMultiSelected={isMultiSelected}
        selectedShape={selectedShape}
        shouldIgnorePointerOver={shouldIgnorePointerOver}
      ></Shape>
    );
  }
  if (
    instanceOfArrow(drawing) &&
    fromShape &&
    toShape &&
    fromShapeArrows &&
    toShapeArrows
  ) {
    return (
      <Arrow
        arrow={drawing}
        fromShape={fromShape}
        toShape={toShape}
        fromShapeArrows={fromShapeArrows}
        toShapeArrows={toShapeArrows}
        playerSelected={playerSelected}
        isSelected={isSelected}
        isMultiSelected={isMultiSelected}
        shouldIgnorePointerOver={shouldIgnorePointerOver}
      ></Arrow>
    );
  }

  console.error(`Cannot draw ${id}`);
  dispatch(
    addError(
      "We're having issues syncing this diagram. Try refreshing this page."
    )
  );
  return <></>;
});

const DrawContainer: React.FC = React.memo(() => {
  const dispatch = useDispatch();
  const drawOrder = useSelector((s) => s.draw.drawOrder);
  const board = useSelector((s) => s.board);
  const shapes = useSelector((s) => s.draw.shapes);
  const arrows = useSelector((s) => s.draw.arrows);

  const playerSelectedMap: { [shapeId: string]: Player } = useSelector((s) => {
    let selectionMap = {};
    s.players.selections.forEach((selections) => {
      const pairs = selections.select.map((shapeId) => [
        shapeId,
        s.players.players[selections.id],
      ]);
      selectionMap = Object.assign({}, selectionMap, Object.fromEntries(pairs));
    });
    return selectionMap;
  });

  const multiSelectMap: { [shapeId: string]: boolean } = useSelector((s) => {
    return s.draw.multiSelect?.selectedIds ?? {};
  });

  const draggingId = useSelector((s) => s.draw.drag?.id);
  const editingId = useSelector((s) => s.draw.editText?.id);
  const selectedId = useSelector((s) => s.draw.select?.id);
  const selectedShape = useSelector(
    (s) => (selectedId && s.draw.shapes[selectedId]) || undefined
  );
  const shouldIgnorePointerOver = useSelector(
    (s) => !!s.draw.drag || !!s.draw.resize
  );

  const arrowPositions = useSelector((s) => s.draw.arrowPositions);

  useEffect(() => {
    if (board.loaded !== 'success') return;
    dispatch(fetchDrawings(board.id));
  }, [board, dispatch]);

  return (
    <>
      {drawOrder.map((id) => {
        const drawing = shapes[id] ?? arrows[id] ?? {};
        if (isEmpty(drawing)) return <></>;

        let fromShape: ShapeT | undefined;
        let toShape: ShapeT | undefined;
        let fromShapeArrows: string[] | undefined;
        let toShapeArrows: string[] | undefined;
        if (instanceOfArrow(drawing)) {
          fromShape = shapes[drawing.fromShapeId];
          toShape = shapes[drawing.toShapeId];
          const { from, to } = computeOrientation(fromShape, toShape);
          fromShapeArrows = arrowPositions[fromShape.id][from];
          toShapeArrows = arrowPositions[toShape.id][to];
        }
        return (
          <Drawing
            key={id}
            drawing={drawing}
            playerSelected={playerSelectedMap[drawing.id]}
            isDragging={drawing.id === draggingId}
            isEditing={drawing.id === editingId}
            isSelected={drawing.id === selectedId}
            isMultiSelected={multiSelectMap[drawing.id] || false}
            selectedShape={selectedShape}
            shouldIgnorePointerOver={shouldIgnorePointerOver}
            fromShape={fromShape}
            toShape={toShape}
            fromShapeArrows={fromShapeArrows}
            toShapeArrows={toShapeArrows}
          ></Drawing>
        );
      })}
    </>
  );
});

export default DrawContainer;
