import React from 'react';
import Text from './Text';

interface RoundRectProps extends React.SVGProps<SVGRectElement> {
  x: number;
  y: number;
  text: string;
}

const RoundRect: React.FC<RoundRectProps> = (props: RoundRectProps) => {
  const [x, y] = [props.x, props.y];
  const [width, height] = [200, 100];
  const [textX, textY] = [x + width / 2, y + height / 2];

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="10"
        ry="10"
        fill="white"
        stroke="black"
      ></rect>
      <Text x={textX} y={textY} text={props.text}></Text>
    </g>
  );
};

export default RoundRect;
