import React from 'react';
import Rect, { RECT_WIDTH, RECT_HEIGHT } from 'modules/draw/shape/type/Rect';
import { useSelector } from 'global/redux';
import { DEFAULT_ZOOM_LEVEL } from '../zoom/zoom.reducer';
import { Shape } from 'modules/draw/shape/shape.reducer';
import TempPresentationalArrow, {
  ArrowProps,
} from 'modules/draw/arrow/TempPresentationalArrow';
import { isOverlapping } from 'math/box';
import { ShapeTypeProps } from 'modules/draw/shape/Shape';

const Ghosts: React.FC = () => {
  const playerId = useSelector((s) => s.players.self);
  const playerCursor = useSelector(
    (s) => s.players.players[playerId] && s.players.players[playerId].cursor
  );
  const selectedShape = useSelector(
    (s) => !!s.draw.select?.id && s.draw.shapes[s.draw.select.id]
  );
  const cursorOver = useSelector((s) => s.canvas.cursorOver);
  const cursorOverShape = useSelector(
    (s) => s.canvas.cursorOver.id && s.draw.shapes[s.canvas.cursorOver.id]
  );
  const isAltPressed = useSelector((s) => s.keyboard.altKey);
  const isDragging = useSelector((s) => s.draw.drag !== null);
  const isResizing = useSelector((s) => s.draw.resize !== null);

  function getGhost() {
    if (!isAltPressed || isResizing || isDragging || !playerCursor) {
      return <></>;
    }

    if (
      (cursorOver.type === 'rect' || cursorOver.type === 'grouping_rect') &&
      selectedShape &&
      cursorOverShape &&
      selectedShape.id !== cursorOver.id &&
      !isOverlapping(selectedShape, cursorOverShape)
    ) {
      const props = ghostArrowProps(selectedShape, cursorOverShape);
      return <TempPresentationalArrow {...props}></TempPresentationalArrow>;
    }

    const rectProps = ghostRectProps(playerCursor.x, playerCursor.y);
    if (
      (cursorOver.type === 'background' ||
        cursorOver.type === 'grouping_rect') &&
      (!selectedShape ||
        (selectedShape && isOverlapping(selectedShape, rectProps.shape)))
    ) {
      return <Rect {...rectProps}></Rect>;
    }

    if (selectedShape) {
      const arrowProps = ghostArrowProps(selectedShape, rectProps.shape);
      return (
        <>
          <Rect {...rectProps}></Rect>;
          <TempPresentationalArrow {...arrowProps}></TempPresentationalArrow>
        </>
      );
    }
    return <></>;
  }

  return <g style={{ pointerEvents: 'none' }}>{getGhost()}</g>;
};

export default Ghosts;

function ghostArrowProps(fromShape: Shape, toShape: Shape) {
  const arrowProps: ArrowProps = {
    id: '',
    fromShape: fromShape,
    toShape: toShape,
    text: '',
    isSavedInDB: false,
  };
  return arrowProps;
}

function ghostRectProps(x: number, y: number) {
  const shape: Shape = {
    type: 'rect',
    x: x - RECT_WIDTH / 2,
    y: y - RECT_HEIGHT / 2,
    id: '',
    text: '',
    width: RECT_WIDTH,
    height: RECT_HEIGHT,
    createdAtZoomLevel: DEFAULT_ZOOM_LEVEL,
    boardId: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false,
    translateX: 0,
    translateY: 0,
    deltaWidth: 0,
    deltaHeight: 0,
    isSavedInDB: false,
  };

  const shapeProps: ShapeTypeProps = {
    shape: shape,
    isDragging: false,
    isMultiSelected: false,
    isSelected: false,
    onPointerDown: () => {},
    onPointerOver: () => {},
  };

  return shapeProps;
}
