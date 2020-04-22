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

export const RECT_WIDTH = 150;
export const RECT_HEIGHT = 75;

export type RectProps = {
  type: 'rect';
} & Shape &
  Selectable &
  Draggable &
  TextEditable &
  Resizable;

const Rect: React.FC<ShapeId> = React.memo((props) => {
  const { id } = props;

  const newDispatch = useDispatch();

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

  const transform = `translate(${x + shape.translateX}, ${
    y + shape.translateY
  })`;
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
          cx={shape.width + shape.deltaWidth}
        ></circle>
        <circle
          fill="cornflowerblue"
          r="6"
          cursor="sw-resize"
          onMouseDown={(e) => startResizeRect(e, 'SWAnchor')}
          cy={shape.height + shape.deltaHeight}
        ></circle>
        <circle
          fill="cornflowerblue"
          r="6"
          cursor="se-resize"
          onMouseDown={(e) => startResizeRect(e, 'SEAnchor')}
          cx={shape.width + shape.deltaWidth}
          cy={shape.height + shape.deltaHeight}
        ></circle>
      </>
    );
  };

  if (!shape) return <></>;
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
        rx="4"
        ry="4"
        fill="white"
        stroke={isSelected ? 'cornflowerblue' : 'darkgray'}
        strokeDasharray={isSelected ? 5 : 0}
        onMouseDown={(e) => handleMouseDown(e)}
        onDrag={(e) => console.log('dragging rect')}
        onDragStart={() => console.log('start drag')}
        onClick={() => console.log('clicked')}
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
        {shape.text}
      </text>
      {isSelected && <SelectionCircles></SelectionCircles>}
    </g>
  );
});

export default Rect;
