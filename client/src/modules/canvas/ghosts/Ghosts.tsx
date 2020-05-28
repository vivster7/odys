import React from 'react';
import Rect, { RECT_WIDTH, RECT_HEIGHT } from 'modules/draw/shape/type/Rect';
import { useSelector } from 'global/redux';
import { DEFAULT_ZOOM_LEVEL } from '../zoom/zoom.reducer';
import { Shape } from 'modules/draw/shape/shape.reducer';
import { Arrow } from 'modules/draw/arrow/arrow.reducer';

const Ghosts: React.FC = () => {
  const playerId = useSelector((s) => s.players.self);
  const playerCursor = useSelector(
    (s) => s.players.players[playerId] && s.players.players[playerId].cursor
  );
  const selectedShape = useSelector(
    (s) => !!s.draw.select?.id && s.draw.shapes[s.draw.select.id]
  );
  const isAltPressed = useSelector((s) => s.keyboard.altKey);
  const cursorOver = useSelector((s) => s.canvas.cursorOver);
  const isDragging = useSelector((s) => s.draw.drag !== null);
  const isResizing = useSelector((s) => s.draw.resize !== null);

  function getGhost() {
    if (!isAltPressed || isResizing || isDragging) {
      return <></>;
    }

    if (
      selectedShape &&
      (cursorOver.type === 'rect' || cursorOver.type === 'grouping_rect') &&
      cursorOver.id
    ) {
      const arrow: Arrow = {
        id: '',
        fromShapeId: selectedShape.id,
        toShapeId: cursorOver.id,
        text: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        boardId: '',
        isDeleted: false,
        isSavedInDB: false,
      };
      // TODO: convert Arrow to presentational component and then
      // return an Arrow instance here

      return <></>;
    }

    if (
      playerCursor &&
      (cursorOver.type === 'background' || cursorOver.type === 'grouping_rect')
    ) {
      const shape: Shape = {
        type: 'rect',
        x: playerCursor.x - RECT_WIDTH / 2,
        y: playerCursor.y - RECT_HEIGHT / 2,
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

      const rectProps = {
        shape: shape,
        isDragging: false,
        isMultiSelected: false,
        isSelected: false,
        onPointerDown: () => {},
        onPointerOver: () => {},
      };
      return <Rect {...rectProps}></Rect>;
    }
    return <></>;
  }

  return <g style={{ pointerEvents: 'none' }}>{getGhost()}</g>;
};

export default Ghosts;
