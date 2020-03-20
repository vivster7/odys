import React, { useContext } from 'react';
import Group from './Group';
import { GlobalStateContext } from '../globals';

export const RECT_WIDTH = 200;
export const RECT_HEIGHT = 100;

export interface RectProps extends React.SVGProps<SVGRectElement> {
  type: 'rect';
  id: string;
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  text: string;
}

const Rect: React.FC<RectProps> = props => {
  const id = props.id;
  const [x, y] = [props.x, props.y];
  const [textX, textY] = [RECT_WIDTH / 2, RECT_HEIGHT / 2];

  const transform = `translate(${x + props.translateX}, ${y +
    props.translateY})`;
  const { globalState, dispatch } = useContext(GlobalStateContext);
  const cursor =
    globalState.drag && globalState.drag.id === id ? 'grabbing' : 'grab';

  const isSelected = id === globalState.selectedId;

  function startDrag(e: React.MouseEvent) {
    dispatch({
      type: 'ODYS_START_DRAG_ACTION',
      id: id,
      clickX: e.clientX,
      clickY: e.clientY
    });
  }

  function select(e: React.MouseEvent) {
    dispatch({
      type: 'ODYS_SELECT_ACTION',
      id: id
    });
  }

  function handleMouseDown(e: React.MouseEvent) {
    e.stopPropagation();
    startDrag(e);
    select(e);
  }

  return (
    <Group
      id={id}
      transform={transform}
      cursor={cursor}
      onClick={e => e.stopPropagation()}
      onMouseDown={e => handleMouseDown(e)}
    >
      <rect
        width={RECT_WIDTH}
        height={RECT_HEIGHT}
        rx="4"
        ry="4"
        fill="white"
        stroke={isSelected ? 'cornflowerblue' : 'darkgray'}
        strokeDasharray={isSelected ? 5 : 0}
      ></rect>
      <text x={textX} y={textY} style={{ textAnchor: 'middle' }}>
        <tspan style={{ userSelect: 'none' }}>{props.text}</tspan>
      </text>
    </Group>
  );
};

export default Rect;
