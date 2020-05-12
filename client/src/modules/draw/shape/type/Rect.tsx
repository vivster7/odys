import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectShape, drawArrow, startDrag } from '../../draw.reducer';
import { RootState } from '../../../../App';
import { ShapeId } from '../Shape';
import { isOverlapping } from '../../../../math/box';
import { zoomLeveltoScaleMap } from '../../../svg/zoom/zoom.reducer';
import SelectionCircles from 'modules/draw/mixins/select/SelectionCircles';
export const RECT_WIDTH = 150;
export const RECT_HEIGHT = 75;

const Rect: React.FC<ShapeId> = React.memo((props) => {
  const { id } = props;

  const dispatch = useDispatch();

  const shape = useSelector((state: RootState) => state.draw.shapes[id]);

  const isDragging = useSelector(
    (state: RootState) => state.draw.drag?.id === id
  );
  const selected = useSelector(
    (state: RootState) =>
      !!state.draw.select?.id && state.draw.shapes[state.draw.select?.id]
  );
  const isGroupSelected = useSelector(
    (state: RootState) => !!state.draw.groupSelect?.selectedShapeIds[id]
  );

  const isSelected = id === (selected && selected.id);

  const [x, y] = [shape.x, shape.y];
  const [textX, textY] = [
    (shape.width + shape.deltaWidth) / 2,
    (shape.height + shape.deltaHeight) / 2,
  ];

  const transform = `translate(${x + shape.translateX}, ${
    y + shape.translateY
  })`;
  const cursor = isDragging ? 'grabbing' : 'grab';

  const rectScale = zoomLeveltoScaleMap[shape.createdAtZoomLevel];
  const fontSize = 14 / rectScale;
  const radiusSize = 4 / rectScale;
  const strokeWidth = 1 / rectScale;
  const selectedStrokeDashArray = 5 / rectScale;

  function handleMouseDown(e: React.MouseEvent) {
    e.stopPropagation();
    if (
      e.altKey &&
      !!selected &&
      !isOverlapping(shape, selected) &&
      !isSelected
    ) {
      dispatch(drawArrow(id));
    } else {
      dispatch(startDrag({ id: id, clickX: e.clientX, clickY: e.clientY }));
      dispatch(selectShape(id));
    }
  }

  if (!shape) return <></>;
  return (
    <g
      id={id}
      transform={transform}
      cursor={cursor}
      onMouseDown={(e) => handleMouseDown(e)}
    >
      <rect
        width={shape.width + shape.deltaWidth}
        height={shape.height + shape.deltaHeight}
        rx={radiusSize + 'px'}
        ry={radiusSize + 'px'}
        fill="white"
        stroke={isSelected || isGroupSelected ? 'cornflowerblue' : 'darkgray'}
        strokeWidth={strokeWidth + 'px'}
        strokeDasharray={
          isSelected || isGroupSelected
            ? selectedStrokeDashArray + 'px'
            : 0 + 'px'
        }
      ></rect>
      <text
        x={textX}
        y={textY}
        textAnchor="middle"
        textRendering="optimizeSpeed"
        fontSize={fontSize + 'px'}
      >
        {shape.text}
      </text>
      {isSelected && (
        <SelectionCircles
          id={id}
          createdAtZoomLevel={shape.createdAtZoomLevel}
          width={shape.width + shape.deltaWidth}
          height={shape.height + shape.deltaHeight}
        ></SelectionCircles>
      )}
    </g>
  );
});

export default Rect;
