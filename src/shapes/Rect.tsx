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
} from '../reducers/shapes/shape';
import { RootState } from '../App';
import Shape, {
  ShapeId,
  Selectable,
  Draggable,
  TextEditable,
  Resizable,
} from './Shape';
import { zoomLeveltoScaleMap } from '../reducers/svg';

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
    (state: RootState) => state.shapes.data[id] as RectProps
  );

  const draggedId = useSelector((state: RootState) => state.shapes.drag?.id);
  const selected = useSelector(
    (state: RootState) =>
      !!state.shapes.select?.id && state.shapes.data[state.shapes.select?.id]
  );

  const [x, y] = [shape.x, shape.y];
  const [textX, textY] = [
    (shape.width + shape.deltaWidth) / 2,
    (shape.height + shape.deltaHeight) / 2,
  ];

  const transform = `translate(${x + shape.translateX}, ${
    y + shape.translateY
  })`;
  const cursor = draggedId === id ? 'grabbing' : 'grab';
  const isSelected = id === (selected && selected.id);

  const fontSize = 14 / zoomLeveltoScaleMap[shape.createdAtZoomLevel];
  const radiusSize = 4 / zoomLeveltoScaleMap[shape.createdAtZoomLevel];
  const strokeWidth = 1 / zoomLeveltoScaleMap[shape.createdAtZoomLevel];
  const selectedStrokeDashArray =
    5 / zoomLeveltoScaleMap[shape.createdAtZoomLevel];
  const groupStrokeDashArray =
    3 / zoomLeveltoScaleMap[shape.createdAtZoomLevel];
  const groupCursor = isSelected
    ? draggedId === id
      ? 'grabbing'
      : 'grab'
    : 'auto';

  function overlaps(s: Shape): boolean {
    const shape2 = s as RectProps;
    return (
      ((shape.x < shape2.x && shape.x + shape.width >= shape2.x) ||
        (shape2.x < shape.x && shape2.x + shape2.width >= shape.x)) &&
      ((shape.y < shape2.y && shape.y + shape.height >= shape2.y) ||
        (shape2.y < shape.y && shape2.y + shape2.height >= shape.y))
    );
  }

  function handleMouseDown(e: React.MouseEvent) {
    e.stopPropagation();
    if (e.altKey && !!selected && !overlaps(selected) && !isSelected) {
      dispatch(drawArrow(id));
    } else {
      dispatch(startDrag({ id: id, clickX: e.clientX, clickY: e.clientY }));
      dispatch(selectShape(id));
    }
  }

  function handleGroupMouseDown(e: React.MouseEvent) {
    e.stopPropagation();

    if (!e.altKey) {
      dispatch(startDrag({ id: id, clickX: e.clientX, clickY: e.clientY }));
    }

    if (e.altKey && !!selected && !overlaps(selected) && !isSelected) {
      dispatch(drawArrow(id));
    } else if (e.altKey) {
      // endNewRect handled on MouseUp.
      dispatch(startNewRectByClick({ clickX: e.clientX, clickY: e.clientY }));
      dispatch(startNewRectByDrag({ clickX: e.clientX, clickY: e.clientY }));
    } else if (!e.altKey) {
      dispatch(selectShape(id));
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
          stroke={isSelected ? 'cornflowerblue' : 'darkgray'}
          strokeDasharray={
            isSelected
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
        stroke={isSelected ? 'cornflowerblue' : 'darkgray'}
        strokeWidth={strokeWidth + 'px'}
        strokeDasharray={isSelected ? selectedStrokeDashArray + 'px' : 0 + 'px'}
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
