import React from 'react';
import Group from './Group';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectShape,
  drawArrow,
  startDrag,
  Anchor,
  startResize,
} from '../reducers/shapes/shape';
import { RootState } from '../App';
import Shape, { Selectable, Draggable, TextEditable, Resizable } from './Shape';

export const RECT_WIDTH = 150;
export const RECT_HEIGHT = 75;

export type RectProps = {
  type: 'rect';
} & Shape &
  Selectable &
  Draggable &
  TextEditable &
  Resizable;

const Rect: React.FC<RectProps> = React.memo((props) => {
  const id = props.id;
  const [x, y] = [props.x, props.y];
  const [textX, textY] = [
    (props.width + props.deltaWidth) / 2,
    (props.height + props.deltaHeight) / 2,
  ];

  const transform = `translate(${x + props.translateX}, ${
    y + props.translateY
  })`;
  const newDispatch = useDispatch();
  const draggedId = useSelector(
    (state: RootState) => state.shapes.drag && state.shapes.drag.id
  );
  const selectedId = useSelector(
    (state: RootState) => state.shapes.select && state.shapes.select.id
  );
  const cursor = draggedId === id ? 'grabbing' : 'grab';

  const isSelected = id === selectedId;

  function handleMouseDown(e: React.MouseEvent) {
    e.stopPropagation();
    newDispatch(startDrag({ id: id, clickX: e.clientX, clickY: e.clientY }));

    if (selectedId && e.altKey) {
      newDispatch(drawArrow(id));
    } else {
      newDispatch(selectShape(id));
    }
  }

  const SelectionCircles = () => {
    function startResizeRect(e: React.MouseEvent, anchor: Anchor) {
      e.stopPropagation();
      newDispatch(
        startResize({ id, anchor, originalX: e.clientX, originalY: e.clientY })
      );
    }

    return (
      <>
        <circle
          fill="cornflowerblue"
          r="6"
          cursor="nw-resize"
          onMouseDown={(e) => startResizeRect(e, 'NWAnchor')}
        ></circle>
        <circle
          fill="cornflowerblue"
          r="6"
          cursor="ne-resize"
          onMouseDown={(e) => startResizeRect(e, 'NEAnchor')}
          cx={props.width + props.deltaWidth}
        ></circle>
        <circle
          fill="cornflowerblue"
          r="6"
          cursor="sw-resize"
          onMouseDown={(e) => startResizeRect(e, 'SWAnchor')}
          cy={props.height + props.deltaHeight}
        ></circle>
        <circle
          fill="cornflowerblue"
          r="6"
          cursor="se-resize"
          onMouseDown={(e) => startResizeRect(e, 'SEAnchor')}
          cx={props.width + props.deltaWidth}
          cy={props.height + props.deltaHeight}
        ></circle>
      </>
    );
  };

  return (
    <Group
      id={id}
      transform={transform}
      cursor={cursor}
      onClick={(e) => e.stopPropagation()}
    >
      <rect
        width={props.width + props.deltaWidth}
        height={props.height + props.deltaHeight}
        rx="4"
        ry="4"
        fill="white"
        stroke={isSelected ? 'cornflowerblue' : 'darkgray'}
        strokeDasharray={isSelected ? 5 : 0}
        onMouseDown={(e) => handleMouseDown(e)}
      ></rect>
      <text
        x={textX}
        y={textY}
        style={{
          textAnchor: 'middle',
          textRendering: 'optimizeSpeed',
        }}
        onMouseDown={(e) => handleMouseDown(e)}
      >
        {props.text}
      </text>
      {isSelected && <SelectionCircles></SelectionCircles>}
    </Group>
  );
});

export default Rect;
