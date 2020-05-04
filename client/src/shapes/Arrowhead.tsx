import React from 'react';
import { zoomLeveltoScaleMap } from '../reducers/svg';

type ArrowheadProps = {
  id: string;
  x: number;
  y: number;
  isSelected: boolean;
  rotationAngleFromXInRadians?: number;
  direction: 'left' | 'right';
  createdAtZoomLevel: number;
};

const radiansToDegrees = (x: number) => x * (180 / Math.PI);

const Arrowhead: React.FC<ArrowheadProps> = React.memo((props) => {
  const color = props.isSelected ? 'cornflowerblue' : 'grey';
  const strokeWidth = 1 / zoomLeveltoScaleMap[props.createdAtZoomLevel];
  const length = 5 / zoomLeveltoScaleMap[props.createdAtZoomLevel];

  let rotation = radiansToDegrees(props.rotationAngleFromXInRadians || 0);
  if (props.direction === 'left') {
    rotation += 180;
  }

  const transform = `translate(${props.x}, ${props.y}) rotate(${rotation})`;

  return (
    <g transform={transform}>
      <line
        x1="0"
        y1="-0"
        x2={-length}
        y2={-length}
        stroke={color}
        strokeWidth={strokeWidth + 'px'}
      ></line>
      <line
        x1="0"
        y1="0"
        x2={-length}
        y2={length}
        stroke={color}
        strokeWidth={strokeWidth + 'px'}
      ></line>
    </g>
  );
});

export default Arrowhead;
