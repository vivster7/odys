import React from 'react';
import Group from './Group';
import useDraggable from '../hooks/useDraggable';

export const RECT_WIDTH = 200;
export const RECT_HEIGHT = 100;

export interface RectProps extends React.SVGProps<SVGRectElement> {
  type: 'rect';
  id: string;
  x: number;
  y: number;
  text: string;
}

const Rect: React.FC<RectProps> = props => {
  const id = props.id;
  const [x, y] = [props.x, props.y];
  const [textX, textY] = [RECT_WIDTH / 2, RECT_HEIGHT / 2];

  const initTransform = `translate(${x}, ${y})`;
  const [transform, cursor] = useDraggable(id, initTransform);

  return (
    <Group id={id} transform={transform} cursor={cursor}>
      <rect
        width={RECT_WIDTH}
        height={RECT_HEIGHT}
        rx="4"
        ry="4"
        fill="white"
        stroke="darkgray"
      ></rect>
      <text x={textX} y={textY} style={{ textAnchor: 'middle' }}>
        <tspan>{props.text}</tspan>
      </text>
    </Group>
  );
};

export default Rect;
