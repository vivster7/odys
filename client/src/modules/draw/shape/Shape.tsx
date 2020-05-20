import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { find } from 'lodash';

import { RootState } from 'App';
import { addError } from 'modules/errors/errors.reducer';

import Text from './type/Text';
import Rect from './type/Rect';
import GroupingRect from './type/GroupingRect';
import { isOverlapping } from 'math/box';
import { startDrag, startNewRect } from '../draw.reducer';
import { selectDrawing } from 'modules/draw/mixins/select/select.reducer';
import { Shape as ShapeType } from './shape.reducer';
import { Player } from 'modules/players/players.reducer';
import { drawArrow } from '../arrow/arrow.reducer';
import * as uuid from 'uuid';

export interface ShapeId {
  id: string;
}

// ShapeTypeProps are passed to shape types: rect, text, grouping_rect
export interface ShapeTypeProps {
  shape: ShapeType;
  isDragging: boolean;
  isMultiSelected: boolean;
  isSelected: boolean;
  playerSelected?: Player;
  onMouseDown: (e: React.MouseEvent) => void;
}

export const Shape: React.FC<ShapeId> = (props) => {
  const { id } = props;
  const dispatch = useDispatch();

  const board = useSelector((state: RootState) => state.board);
  const shape = useSelector((state: RootState) => state.draw.shapes[id]);
  const isDragging = useSelector(
    (state: RootState) => state.draw.drag?.id === id
  );
  const isMultiSelected = useSelector(
    (state: RootState) => !!state.draw.multiSelect?.selectedShapeIds[id]
  );
  const selectedShape = useSelector(
    (state: RootState) =>
      !!state.draw.select?.id && state.draw.shapes[state.draw.select?.id]
  );
  const isSelected = selectedShape && selectedShape.id === id;

  const playerSelected = useSelector((state: RootState) => {
    const playerSelection = find(
      state.players.selections,
      (s) => s.select === id
    );
    return playerSelection
      ? state.players.players[playerSelection.id]
      : undefined;
  });

  function onMouseDown(e: React.MouseEvent) {
    e.stopPropagation();
    if (
      e.altKey &&
      !!selectedShape &&
      !isOverlapping(shape, selectedShape) &&
      !isSelected
    ) {
      dispatch(
        drawArrow({
          id: uuid.v4(),
          fromShapeId: selectedShape.id,
          toShapeId: id,
          boardId: board.id,
        })
      );
    } else {
      dispatch(
        startDrag({
          id: id,
          encompassedIds: [],
          clickX: e.clientX,
          clickY: e.clientY,
        })
      );
      dispatch(selectDrawing(id));
    }
  }

  function handleMouseDownInGroupingRect(e: React.MouseEvent) {
    e.stopPropagation();

    if (
      e.altKey &&
      !!selectedShape &&
      !isOverlapping(shape, selectedShape) &&
      !isSelected
    ) {
      dispatch(
        drawArrow({
          id: uuid.v4(),
          fromShapeId: selectedShape.id,
          toShapeId: id,
          boardId: board.id,
        })
      );
    } else if (e.altKey) {
      dispatch(startNewRect({ clickX: e.clientX, clickY: e.clientY }));
    } else {
      dispatch(selectDrawing(id));
      dispatch(
        startDrag({
          id: id,
          encompassedIds: [],
          clickX: e.clientX,
          clickY: e.clientY,
        })
      );
    }
  }

  const childProps = {
    shape,
    isDragging,
    isMultiSelected,
    isSelected,
    playerSelected,
    onMouseDown,
  };

  if (shape?.isDeleted) return <></>;
  if (shape?.type === 'rect') return <Rect {...childProps}></Rect>;
  if (shape?.type === 'text') return <Text {...childProps}></Text>;
  if (shape?.type === 'grouping_rect') {
    const groupingChildProps = Object.assign({}, childProps, {
      onMouseDown: handleMouseDownInGroupingRect,
    });
    return <GroupingRect {...groupingChildProps}></GroupingRect>;
  }

  dispatch(addError(`unknown shape ${id}`));
  return <></>;
};
