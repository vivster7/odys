import React, { useContext } from 'react';
import Group from './Group';
import { GlobalStateContext, Anchor } from '../globals';
import { useDispatch, useSelector } from 'react-redux';
import { selectShape, drawArrow, startDrag } from '../reducers/shape';
import { RootState } from '../App';

export const RECT_WIDTH = 150;
export const RECT_HEIGHT = 75;
export const FONT_SIZE = 14;

export interface RectProps extends React.SVGProps<SVGRectElement> {
  type: 'rect';
  id: string;

  x: number;
  y: number;
  translateX: number;
  translateY: number;

  width: number;
  height: number;
  deltaWidth: number;
  deltaHeight: number;

  text: string;
}

const Rect: React.FC<RectProps> = (props) => {
  const id = props.id;
  const [x, y] = [props.x, props.y];
  const [textX, textY] = [
    (props.width + props.deltaWidth) / 2,
    (props.height + props.deltaHeight) / 2,
  ];

  const transform = `translate(${x + props.translateX}, ${
    y + props.translateY
  })`;
  const { dispatch } = useContext(GlobalStateContext);
  const newDispatch = useDispatch();
  const dragState = useSelector((state: RootState) => state.shapes.drag);
  const select = useSelector((state: RootState) => state.shapes.select);
  const cursor = dragState && dragState.id === id ? 'grabbing' : 'grab';

  const isSelected = id === (select && select.id);

  function handleMouseDown(e: React.MouseEvent) {
    e.stopPropagation();
    newDispatch(startDrag({ id: id, clickX: e.clientX, clickY: e.clientY }));

    if (select && e.altKey) {
      newDispatch(drawArrow(id));
    } else {
      newDispatch(selectShape(id));
    }
  }

  const SelectionCircles = () => {
    function startResizeRect(e: React.MouseEvent, anchor: Anchor) {
      e.stopPropagation();
      dispatch({
        type: 'ODYS_START_RESIZE_ACTION',
        id: id,
        anchor: anchor,
        originalX: e.clientX,
        originalY: e.clientY,
      });
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
        <tspan style={{ userSelect: 'none' }}>{props.text}</tspan>
      </text>
      {isSelected && <SelectionCircles></SelectionCircles>}
    </Group>
  );
};

export default Rect;
