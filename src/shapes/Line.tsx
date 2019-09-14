import React from 'react';
import useDraggable from '../hooks/useDraggable';
import Group from './Group';

export interface LineProps extends React.SVGProps<SVGRectElement> {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const Line: React.FC<LineProps> = props => {
  const initTransform = `translate(${props.x1}, ${props.y1})`;
  const [transform, cursor] = useDraggable(props.id, initTransform);

  return (
    <Group id={props.id} transform={transform} cursor={cursor}>
      <line x1="0" y1="0" x2={props.x2} y2={props.y2} stroke="grey"></line>
    </Group>
  );
};

export default Line;
