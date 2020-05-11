import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectShape,
  drawArrow,
  startDrag,
  startNewRectByClick,
  startNewRectByDrag,
} from '../draw.reducer';
import { RootState } from '../../../App';
import Shape, {
  ShapeId,
  Selectable,
  Draggable,
  TextEditable,
  Resizable,
  useShapeChangeEmitter,
} from './Shape';
import { isOverlapping } from '../../../math/rect';
import { zoomLeveltoScaleMap } from '../../svg/zoom/zoom.reducer';
import SelectionCircles from '../select/SelectionCircles';

export const RECT_WIDTH = 150;
export const RECT_HEIGHT = 75;

export type GroupingRectProps = {
  type: 'grouping_rect';
  createdAtZoomLevel: number;
} & Shape &
  Selectable &
  Draggable &
  TextEditable &
  Resizable;

const GroupingRect: React.FC<ShapeId> = React.memo((props) => {
  const { id } = props;

  const dispatch = useDispatch();

  const shape = useSelector(
    (state: RootState) => state.draw.shapes[id] as GroupingRectProps
  );

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

  useShapeChangeEmitter(shape);

  const isSelected = id === (selected && selected.id);

  const [x, y] = [shape.x, shape.y];
  const [textX, textY] = [
    (shape.width + shape.deltaWidth) / 2,
    20 / zoomLeveltoScaleMap[shape.createdAtZoomLevel],
  ];

  const transform = `translate(${x + shape.translateX}, ${
    y + shape.translateY
  })`;

  const rectScale = zoomLeveltoScaleMap[shape.createdAtZoomLevel];
  const fontSize = 14 / rectScale;
  const selectedStrokeDashArray = 5 / rectScale;
  const groupStrokeDashArray = 3 / rectScale;
  const groupCursor = isSelected ? (isDragging ? 'grabbing' : 'grab') : 'auto';

  function handleMouseDown(e: React.MouseEvent) {
    e.stopPropagation();

    if (
      e.altKey &&
      !!selected &&
      !isOverlapping(shape, selected as GroupingRectProps) &&
      !isSelected
    ) {
      dispatch(drawArrow(id));
    } else if (e.altKey) {
      // endNewRect handled on MouseUp.
      dispatch(startNewRectByClick({ clickX: e.clientX, clickY: e.clientY }));
      dispatch(startNewRectByDrag({ clickX: e.clientX, clickY: e.clientY }));
    } else {
      dispatch(selectShape(id));
      dispatch(startDrag({ id: id, clickX: e.clientX, clickY: e.clientY }));
    }
  }

  if (!shape) return <></>;
  return (
    <g
      id={id}
      transform={transform}
      cursor={groupCursor}
      onMouseDown={(e) => handleMouseDown(e)}
    >
      <rect
        width={shape.width + shape.deltaWidth}
        height={shape.height + shape.deltaHeight}
        rx="4"
        ry="4"
        fill="darkgray"
        fillOpacity={0.2}
        stroke={isSelected || isGroupSelected ? 'cornflowerblue' : 'darkgray'}
        strokeDasharray={
          isSelected || isGroupSelected
            ? selectedStrokeDashArray + 'px'
            : groupStrokeDashArray + 'px'
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

export default GroupingRect;
