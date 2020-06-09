import React from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'global/redux';

import { addError } from 'modules/errors/errors.reducer';

import Text from './type/Text';
import Rect from './type/Rect';
import GroupingRect from './type/GroupingRect';
import { isOverlapping } from 'math/box';
import { startDrag, startNewRect, selectDrawing } from '../draw.reducer';
import { DrawingProps } from '../DrawContainer';
import { Shape as ShapeType } from './shape.reducer';
import { Player } from 'modules/players/players.reducer';
import { drawArrow } from '../arrow/arrow.reducer';
import * as uuid from 'uuid';
import { AnyAction } from 'redux';
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

export const Shape: React.FC<DrawingProps> = (props) => {
  const { id, playerSelected } = props;
  const dispatch = useDispatch();

  const board = useSelector((s) => s.board);
  const shape = useSelector((s) => s.draw.shapes[id]);
  const isDragging = useSelector((s) => s.draw.drag?.id === id);
  const isEditing = useSelector((s) => s.draw.editText?.id === id);
  const isMultiSelected = useSelector(
    (s) => !!s.draw.multiSelect?.selectedIds[id]
  );
  const selectedShapeId = useSelector((s) => s.draw.select?.id);
  const selectedShape = useSelector(
    (s) => selectedShapeId && s.draw.shapes[selectedShapeId]
  );
  const isSelected = selectedShapeId === id;
  const shouldIgnorePointerOver = useSelector(
    (s) => !!s.draw.drag || !!s.draw.resize
  );

  function sharedOnPointerDown(
    e: React.PointerEvent,
    onCmdClick?: (a: any) => AnyAction
  ) {
    e.stopPropagation();
    e.preventDefault();

    if (
      e.metaKey &&
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
    } else if (e.metaKey && onCmdClick) {
      dispatch(onCmdClick({ clickX: e.clientX, clickY: e.clientY }));
    } else {
      dispatch(selectDrawing({ id, shiftKey: e.shiftKey }));
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

  function onPointerDown(e: React.PointerEvent) {
    sharedOnPointerDown(e);
  }

  function handlePointerDownInGroupingRect(e: React.PointerEvent) {
    sharedOnPointerDown(e, () =>
      startNewRect({ clickX: e.clientX, clickY: e.clientY, selectedShapeId })
    );
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
  if (shape?.type === 'grouping_rect') {
    const groupingChildProps = Object.assign({}, childProps, {
      onPointerDown: handlePointerDownInGroupingRect,
    });
    return <GroupingRect {...groupingChildProps}></GroupingRect>;
  }

  console.error(`unknown shape ${id}`);
  dispatch(
    addError(
      "We're having issues syncing this diagram. Try refreshing this page."
    )
  );
  return <></>;
};

export default Shape;
