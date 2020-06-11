import React from 'react';
import Rect from 'modules/draw/shape/type/Rect';
import { useSelector } from 'global/redux';
import { Shape, newShape } from 'modules/draw/shape/shape.reducer';
import { Path, ArrowTypeProps } from 'modules/draw/arrow/Arrow';
import { ShapeTypeProps } from 'modules/draw/shape/Shape';
import { COLORS } from 'global/colors';
import { SHAPE_WIDTH, SHAPE_HEIGHT } from 'modules/draw/shape/type/BaseShape';

const Ghosts: React.FC = () => {
  const cursorPosition = useSelector((s) => s.canvas.cursor);
  const selectedShape = useSelector(
    (s) => !!s.draw.select?.id && s.draw.shapes[s.draw.select.id]
  );
  const cursorOver = useSelector((s) => s.canvas.cursorOver);
  const cursorOverShape = useSelector(
    (s) => s.canvas.cursorOver.id && s.draw.shapes[s.canvas.cursorOver.id]
  );
  const isCmdPressed = useSelector((s) => s.keyboard.cmdKey);
  const isDragging = useSelector((s) => s.draw.drag !== null);
  const isResizing = useSelector((s) => s.draw.resize !== null);

  function getGhost() {
    if (!isCmdPressed || isResizing || isDragging) {
      return <></>;
    }

    if (
      selectedShape &&
      cursorOverShape &&
      selectedShape.id !== cursorOver.id &&
      selectedShape.id !== cursorOverShape.parentId &&
      selectedShape.parentId !== cursorOverShape.id &&
      ['rect', 'grouping_rect', 'text'].includes(cursorOver.type)
    ) {
      const props = ghostArrowProps(selectedShape, cursorOverShape);
      return <Path {...props}></Path>;
    }

    const rectProps = ghostRectProps(cursorPosition.x, cursorPosition.y);
    if (['background'].includes(cursorOver.type) && !selectedShape) {
      return <Rect {...rectProps}></Rect>;
    }

    if (selectedShape && ['background'].includes(cursorOver.type)) {
      const arrowProps = ghostArrowProps(selectedShape, rectProps.shape);
      return (
        <>
          {' '}
          <Rect {...rectProps}></Rect>;<Path {...arrowProps}></Path>{' '}
        </>
      );
    }
    return <></>;
  }

  return <g style={{ pointerEvents: 'none' }}>{getGhost()}</g>;
};

export default Ghosts;

function ghostArrowProps(fromShape: Shape, toShape: Shape) {
  const arrowProps: ArrowTypeProps = {
    id: '',
    fromShape: fromShape,
    toShape: toShape,
    text: '',
    color: COLORS.ghost,
    shouldIgnorePointerOver: false,
    isSelected: false,
    fromShapeArrows: [],
    toShapeArrows: [],
  };
  return arrowProps;
}

function ghostRectProps(x: number, y: number) {
  const boardId = '';
  const shape: Shape = newShape(boardId, {
    id: '', // ghosts have no id
    type: 'rect',
    x: x - SHAPE_WIDTH / 2,
    y: y - SHAPE_HEIGHT / 2,
    isSavedInDB: false,
  });

  const shapeProps: ShapeTypeProps = {
    shape: shape,
    isDragging: false,
    isMultiSelected: false,
    isSelected: false,
    isEditing: false,
    onPointerDown: () => {},
    onPointerOver: () => {},
    shouldIgnorePointerOver: false,
  };

  return shapeProps;
}
