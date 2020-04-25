import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectShape,
  drawArrow,
  startDrag,
  Anchor,
  startResize,
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
  const selectedId = useSelector((state: RootState) => state.shapes.select?.id);

  const [x, y] = [shape.x, shape.y];
  const [textX, textY] = [
    (shape.width + shape.deltaWidth) / 2,
    (shape.height + shape.deltaHeight) / 2,
  ];
  const fontSize = 14 / zoomLeveltoScaleMap[shape.createdAtZoomLevel];
  const radiusSize = 4 / zoomLeveltoScaleMap[shape.createdAtZoomLevel];
  const strokeWidth = 1 / zoomLeveltoScaleMap[shape.createdAtZoomLevel];
  const strokeDasharray = 5 / zoomLeveltoScaleMap[shape.createdAtZoomLevel];

  const transform = `translate(${x + shape.translateX}, ${
    y + shape.translateY
  })`;
  const cursor = draggedId === id ? 'grabbing' : 'grab';
  const isSelected = id === selectedId;

  function handleMouseDown(e: React.MouseEvent) {
    e.stopPropagation();
    dispatch(startDrag({ id: id, clickX: e.clientX, clickY: e.clientY }));

    if (selectedId && e.altKey) {
      dispatch(drawArrow(id));
    } else {
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
      <g id={id} transform={transform} cursor={cursor}>
        <rect
          width={shape.width + shape.deltaWidth}
          height={shape.height + shape.deltaHeight}
          rx="4"
          ry="4"
          fill="darkgray"
          fillOpacity={0.6}
          stroke={isSelected ? 'cornflowerblue' : 'darkgray'}
          strokeDasharray={isSelected ? 5 : 0}
          onMouseDown={(e) => handleMouseDown(e)}
        ></rect>
        <text
          x={textX}
          y={20}
          textAnchor="middle"
          textRendering="optimizeSpeed"
          fontSize="10em"
          onMouseDown={(e) => handleMouseDown(e)}
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
      onClick={(e) => e.stopPropagation()}
    >
      <rect
        width={shape.width + shape.deltaWidth}
        height={shape.height + shape.deltaHeight}
        rx={radiusSize + 'px'}
        ry={radiusSize + 'px'}
        fill="white"
        stroke={isSelected ? 'cornflowerblue' : 'darkgray'}
        strokeWidth={strokeWidth + 'px'}
        strokeDasharray={isSelected ? strokeDasharray + 'px' : 0 + 'px'}
        onMouseDown={(e) => handleMouseDown(e)}
      ></rect>
      <text
        x={textX}
        y={textY}
        textAnchor="middle"
        textRendering="optimizeSpeed"
        fontSize={fontSize + 'px'}
        onMouseDown={(e) => handleMouseDown(e)}
      >
        {shape.text}
      </text>
      {isSelected && <SelectionCircles></SelectionCircles>}
    </g>
  );
});

export default Rect;
