import React from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'global/redux';

import { RootState } from 'App';
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

// ShapeTypeProps are passed to shape types: rect, text, grouping_rect
export interface ShapeTypeProps {
  shape: ShapeType;
  isDragging: boolean;
  isMultiSelected: boolean;
  isSelected: boolean;
  playerSelected?: Player;
  onPointerDown: (e: React.PointerEvent) => void;
}

export const Shape: React.FC<DrawingProps> = (props) => {
  const { id, playerSelected } = props;
  const dispatch = useDispatch();

  const playerId = useSelector((s) => s.players.self);
  const board = useSelector((s) => s.board);
  const shape = useSelector((s) => s.draw.shapes[id]);
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

  function sharedOnPointerDown(
    e: React.PointerEvent,
    onAltClick?: (a: any) => AnyAction
  ) {
    e.stopPropagation();
    e.preventDefault();

    if (
      e.altKey &&
      !!selectedShape &&
      !isOverlapping(shape, selectedShape) &&
      !isSelected
    ) {
      dispatch(
        drawArrow({
          playerId: playerId,
          id: uuid.v4(),
          fromShapeId: selectedShape.id,
          toShapeId: id,
          boardId: board.id,
        })
      );
    } else if (e.altKey && onAltClick) {
      dispatch(onAltClick({ clickX: e.clientX, clickY: e.clientY }));
    } else {
      dispatch(selectDrawing({ id, shiftKey: e.shiftKey, playerId: playerId }));
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
      startNewRect({ clickX: e.clientX, clickY: e.clientY })
    );
  }

  const childProps = {
    shape,
    isDragging,
    isMultiSelected,
    isSelected,
    playerSelected,
    onPointerDown,
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

  dispatch(addError(`unknown shape ${id}`));
  return <></>;
};

export default Shape;
