import React from 'react';
import Rect from 'modules/draw/shape/type/Rect';
import { useSelector } from 'global/redux';
import { Shape, newShape } from 'modules/draw/shape/shape.reducer';
import { Path, ArrowTypeProps } from 'modules/draw/arrow/Arrow';
import { isOverlapping } from 'math/box';
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
    if (!isCmdPressed || isResizing || isDragging || !cursorPosition) {
      return <></>;
    }

    if (
      ['rect', 'grouping_rect', 'text'].includes(cursorOver.type) &&
      selectedShape &&
      cursorOverShape &&
      selectedShape.id !== cursorOver.id &&
      !isOverlapping(selectedShape, cursorOverShape)
    ) {
      const props = ghostArrowProps(selectedShape, cursorOverShape);
      return <Path {...props}></Path>;
    }

    const rectProps = ghostRectProps(cursorPosition.x, cursorPosition.y);
    if (
      (cursorOver.type === 'background' ||
        cursorOver.type === 'grouping_rect') &&
      (!selectedShape ||
        (selectedShape && isOverlapping(selectedShape, rectProps.shape)))
    ) {
      return <Rect {...rectProps}></Rect>;
    }

    if (selectedShape && selectedShape.id !== cursorOver.id) {
      const arrowProps = ghostArrowProps(selectedShape, rectProps.shape);
      return (
        <>
          <Rect {...rectProps}></Rect>;<Path {...arrowProps}></Path>
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
