import React from 'react';

type ArrowheadProps = {
  id: string;
  x: number;
  y: number;
  isSelected: boolean;
  rotationAngleFromXInRadians?: number;
  direction: 'left' | 'right';
};

const radiansToDegrees = (x: number) => x * (180 / Math.PI);

const Arrowhead: React.FC<ArrowheadProps> = React.memo((props) => {
  const color = props.isSelected ? 'cornflowerblue' : 'grey';
  let rotation = radiansToDegrees(props.rotationAngleFromXInRadians || 0);
  if (props.direction === 'left') {
    rotation += 180;
  }

  const transform = `translate(${props.x}, ${props.y}) rotate(${rotation})`;

  return (
    <g transform={transform}>
      <line x1="0" y1="-0" x2="-5" y2="-5" stroke={color}></line>
      <line x1="0" y1="0" x2="-5" y2="5" stroke={color}></line>
    </g>
  );
});

export default Arrowhead;
