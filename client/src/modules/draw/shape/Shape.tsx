import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { RootState } from 'App';
import { addError } from 'modules/errors/errors.reducer';

import Text from './type/Text';
import Rect from './type/Rect';
import GroupingRect from './type/GroupingRect';
import { useDrawingChangeEmitter } from '../mixins/sync/sync';
import { isOverlapping } from 'math/box';
import {
  drawArrow,
  startDrag,
  selectDrawing,
  startNewRectByClick,
  startNewRectByDrag,
} from '../draw.reducer';
import { Shape as ShapeType } from './shape.reducer';

export interface ShapeId {
  id: string;
}

export interface ShapeProps {
  shape: ShapeType;
  isDragging: boolean;
  isGroupSelected: boolean;
  isSelected: boolean;
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
  const isGroupSelected = useSelector(
    (state: RootState) => !!state.draw.groupSelect?.selectedShapeIds[id]
  );
  const selectedShape = useSelector(
    (state: RootState) =>
      !!state.draw.select?.id && state.draw.shapes[state.draw.select?.id]
  );
  const isSelected = selectedShape && selectedShape.id === id;

  useDrawingChangeEmitter(shape);

  function onMouseDown(e: React.MouseEvent) {
    e.stopPropagation();
    if (
      e.altKey &&
      !!selectedShape &&
      !isOverlapping(shape, selectedShape) &&
      !isSelected
    ) {
      dispatch(drawArrow({ id, boardId: board.id }));
    } else {
      dispatch(startDrag({ id: id, clickX: e.clientX, clickY: e.clientY }));
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
      dispatch(drawArrow({ id, boardId: board.id }));
    } else if (e.altKey) {
      dispatch(startNewRectByClick({ clickX: e.clientX, clickY: e.clientY }));
      dispatch(startNewRectByDrag({ clickX: e.clientX, clickY: e.clientY }));
    } else {
      dispatch(selectDrawing(id));
      dispatch(startDrag({ id: id, clickX: e.clientX, clickY: e.clientY }));
    }
  }

  const childProps = {
    shape,
    isDragging,
    isGroupSelected,
    isSelected,
    onMouseDown,
  };

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
