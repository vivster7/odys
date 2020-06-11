import React from 'react';
import { useDispatch } from 'react-redux';

import { addError } from 'modules/errors/errors.reducer';

import Text from './type/Text';
import Rect from './type/Rect';
import GroupingRect from './type/GroupingRect';
import { startDrag, selectDrawing } from '../draw.reducer';
import { Shape as ShapeType } from './shape.reducer';
import { Player } from 'modules/players/players.reducer';
import { drawArrow } from '../arrow/arrow.reducer';
import * as uuid from 'uuid';
import { setCursorOver } from 'modules/canvas/canvas.reducer';

// ShapeTypeProps are passed to shape types: rect, text, grouping_rect
export interface ShapeTypeProps {
  shape: ShapeType;
  isDragging: boolean;
  isMultiSelected: boolean;
  isSelected: boolean;
  isEditing: boolean;
  playerSelected?: Player;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerOver: (e: React.PointerEvent) => void;
  shouldIgnorePointerOver: boolean;
}

interface ShapeProps {
  shape: ShapeType;
  playerSelected?: Player;
  isDragging: boolean;
  isEditing: boolean;
  isSelected: boolean;
  isMultiSelected: boolean;
  selectedShape?: ShapeType;
  shouldIgnorePointerOver: boolean;
}

export const Shape: React.FC<ShapeProps> = (props) => {
  const {
    shape,
    playerSelected,
    isDragging,
    isEditing,
    isSelected,
    isMultiSelected,
    selectedShape,
    shouldIgnorePointerOver,
  } = props;
  const { id } = shape;
  const dispatch = useDispatch();

  function onPointerDown(e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();

    if (
      e.metaKey &&
      selectedShape &&
      !isSelected &&
      selectedShape.id !== shape.parentId &&
      selectedShape.parentId !== shape.id
    ) {
      dispatch(
        drawArrow({
          id: uuid.v4(),
          fromShapeId: selectedShape.id,
          toShapeId: id,
          boardId: shape.boardId,
        })
      );
    } else {
      dispatch(selectDrawing({ id, shiftKey: e.shiftKey }));
      dispatch(
        startDrag({
          id: id,
          clickX: e.clientX,
          clickY: e.clientY,
        })
      );
    }
  }

  function onPointerOver(e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    dispatch(setCursorOver({ type: shape.type, id }));
  }

  const childProps = {
    shape,
    isDragging,
    isMultiSelected,
    isSelected,
    playerSelected,
    isEditing,
    onPointerDown,
    onPointerOver,
    shouldIgnorePointerOver,
  };

  if (shape?.isDeleted) return <></>;
  if (shape?.type === 'rect') return <Rect {...childProps}></Rect>;
  if (shape?.type === 'text') return <Text {...childProps}></Text>;
  if (shape?.type === 'grouping_rect')
    return <GroupingRect {...childProps}></GroupingRect>;

  console.error(`unknown shape ${id}`);
  dispatch(
    addError(
      "We're having issues syncing this diagram. Try refreshing this page."
    )
  );
  return <></>;
};

export default Shape;
