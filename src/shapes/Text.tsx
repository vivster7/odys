import React from 'react';

export interface TextProps extends React.SVGProps<SVGTextElement> {
  type: 'text';
  x: number;
  y: number;
  text: string;
}

// TODO (vivek): Make draggable. Might need to separate from Rect's use of Text.
const Text: React.FC<TextProps> = props => {
  return (
    <text x={props.x} y={props.y} style={{ textAnchor: 'middle' }}>
      <tspan>{props.text}</tspan>
    </text>
  );
};

export default Text;
