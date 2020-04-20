import React from 'react';
import Group from './Group';

export interface LineProps extends React.SVGProps<SVGRectElement> {
  type: 'line';
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  translateX: number;
  translateY: number;
}

const Line: React.FC<LineProps> = React.memo((props) => {
  const transform = `translate(${props.x1}, ${props.y1})`;
  const cursor = 'auto';

  return (
    <Group id={props.id} transform={transform} cursor={cursor}>
      <line x1="0" y1="0" x2={props.x2} y2={props.y2} stroke="grey"></line>
    </Group>
  );
});

export default Line;
