import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectShape,
  drawArrow,
  startDrag,
  Anchor,
  startResize,
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

export const RECT_WIDTH = 150;
export const RECT_HEIGHT = 75;

export type RectProps = {
  type: 'rect';
  isGroupingRect: boolean;
  createdAtZoomLevel: number;
} & Shape &
  Selectable &
  Draggable &
  TextEditable &
  Resizable;

const Rect: React.FC<ShapeId> = React.memo((props) => {
  const { id } = props;

  const dispatch = useDispatch();

  const shape = useSelector(
    (state: RootState) => state.draw.shapes[id] as RectProps
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
  const groupStrokeDashArray = 3 / rectScale;
  const groupCursor = isSelected ? (isDragging ? 'grabbing' : 'grab') : 'auto';

  function handleMouseDown(e: React.MouseEvent) {
    e.stopPropagation();
    if (
      e.altKey &&
      !!selected &&
      !isOverlapping(shape, selected as RectProps) &&
      !isSelected
    ) {
      dispatch(drawArrow(id));
    } else {
      dispatch(startDrag({ id: id, clickX: e.clientX, clickY: e.clientY }));
      dispatch(selectShape(id));
    }
  }

  function handleGroupMouseDown(e: React.MouseEvent) {
    e.stopPropagation();

    if (
      e.altKey &&
      !!selected &&
      !isOverlapping(shape, selected as RectProps) &&
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

  const SelectionCircles = () => {
    const radiusSize = 6 / zoomLeveltoScaleMap[shape.createdAtZoomLevel];
    function startResizeRect(e: React.MouseEvent, anchor: Anchor) {
      e.stopPropagation();
      dispatch(
        startResize({ id, anchor, originalX: e.clientX, originalY: e.clientY })
      );
    }

    return (
      <>
        <circle
          fill="cornflowerblue"
          r={radiusSize + 'px'}
          cursor="nw-resize"
          onMouseDown={(e) => startResizeRect(e, 'NWAnchor')}
        ></circle>
        <circle
          fill="cornflowerblue"
          r={radiusSize + 'px'}
          cursor="ne-resize"
          onMouseDown={(e) => startResizeRect(e, 'NEAnchor')}
          cx={shape.width + shape.deltaWidth}
        ></circle>
        <circle
          fill="cornflowerblue"
          r={radiusSize + 'px'}
          cursor="sw-resize"
          onMouseDown={(e) => startResizeRect(e, 'SWAnchor')}
          cy={shape.height + shape.deltaHeight}
        ></circle>
        <circle
          fill="cornflowerblue"
          r={radiusSize + 'px'}
          cursor="se-resize"
          onMouseDown={(e) => startResizeRect(e, 'SEAnchor')}
          cx={shape.width + shape.deltaWidth}
          cy={shape.height + shape.deltaHeight}
        ></circle>
      </>
    );
  };

  if (!shape) return <></>;
  if (shape.isGroupingRect) {
    return (
      <g
        id={id}
        transform={transform}
        cursor={groupCursor}
        onMouseDown={(e) => handleGroupMouseDown(e)}
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
          y={20 / zoomLeveltoScaleMap[shape.createdAtZoomLevel]}
          textAnchor="middle"
          textRendering="optimizeSpeed"
          fontSize={fontSize + 'px'}
        >
          {shape.text}
        </text>
        {isSelected && <SelectionCircles></SelectionCircles>}
      </g>
    );
  }
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
      {isSelected && <SelectionCircles></SelectionCircles>}
    </g>
  );
});

export default Rect;
