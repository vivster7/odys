import React from 'react';
import Shape from './Shape';
import Group from './Group';

export interface RightArrowheadProps
  extends React.SVGProps<SVGRectElement>,
    Shape {
  id: string;
  x: number;
  y: number;
  rotationAngleFromXInRadians?: number;
}

const radiansToDegrees = (x: number) => x * (180 / Math.PI);

const RightArrowhead: React.FC<RightArrowheadProps> = props => {
  const rotation = radiansToDegrees(props.rotationAngleFromXInRadians || 0);

  const transform = `translate(${props.x}, ${props.y}) rotate(${rotation})`;

  return (
    <Group id={props.id} transform={transform} cursor="pointer">
      <line x1="0" y1="-0" x2="-20" y2="-20" stroke="grey"></line>
      <line x1="0" y1="0" x2="-20" y2="20" stroke="grey"></line>
    </Group>
  );
};

export default RightArrowhead;
