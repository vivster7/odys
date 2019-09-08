import React from 'react';

export interface TextProps extends React.SVGProps<SVGTextElement> {
  x: number;
  y: number;
  text: string;
}

const Text: React.FC<TextProps> = props => {
  return (
    <text x={props.x} y={props.y} style={{ textAnchor: 'middle' }}>
      <tspan>{props.text}</tspan>
    </text>
  );
};

export default Text;
