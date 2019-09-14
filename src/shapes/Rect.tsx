import React from 'react';
import Group from './Group';
import Text from './Text';
import useDraggable from '../hooks/useDraggable';
import Shape from './Shape';

export interface RectProps extends React.SVGProps<SVGRectElement>, Shape {
  id: string;
  x: number;
  y: number;
  text: string;
}

const Rect: React.FC<RectProps> = props => {
  const id = props.id;
  const [x, y] = [props.x, props.y];
  const [width, height] = [200, 100];
  const [textX, textY] = [width / 2, height / 2];

  const initTransform = `translate(${x}, ${y})`;
  const [transform, cursor] = useDraggable(id, initTransform);

  return (
    <Group id={id} transform={transform} cursor={cursor}>
      <rect
        width={width}
        height={height}
        rx="4"
        ry="4"
        fill="white"
        stroke="darkgray"
      ></rect>
      <Text x={textX} y={textY} text={props.text}></Text>
    </Group>
  );
};

export default Rect;
