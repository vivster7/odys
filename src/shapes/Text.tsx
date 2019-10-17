import React from 'react';
import useDraggable from '../hooks/useDraggable';
import Group from './Group';

export interface TextProps extends React.SVGProps<SVGTextElement> {
  type: 'text';
  id: string;
  x: number;
  y: number;
  text: string;
}

// TODO (vivek): Make draggable. Might need to separate from Rect's use of Text.
const Text: React.FC<TextProps> = props => {
  const initTransform = `translate(${props.x}, ${props.y})`;
  const [transform, cursor] = useDraggable(props.id, initTransform);

  return (
    <Group id={props.id} transform={transform} cursor={cursor}>
      <text style={{ textAnchor: 'middle' }}>
        <tspan>{props.text}</tspan>
      </text>
    </Group>
  );
};

export default Text;
