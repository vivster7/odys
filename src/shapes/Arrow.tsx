import React from 'react';
import useDraggable from '../hooks/useDraggable';
import Group from './Group';
import LeftArrowhead from './LeftArrowhead';
import RightArrowhead from './RightArrowhead';
import { v4 } from 'uuid';

export interface ArrowProps extends React.SVGProps<SVGRectElement> {
  type: 'arrow';
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  left: boolean;
  right: boolean;
}

const idFn = () => `id-${v4()}`;

const Arrow: React.FC<ArrowProps> = props => {
  const initTransform = `translate(${props.x1}, ${props.y1})`;
  const [transform, cursor] = useDraggable(props.id, initTransform);

  const leftArrowhead = () => {
    const rotation1 = Math.atan2(props.y1, props.x1);
    return (
      <LeftArrowhead
        id={idFn()}
        x={0}
        y={0}
        rotationAngleFromXInRadians={rotation1}
      ></LeftArrowhead>
    );
  };

  const rightArrowhead = () => {
    const rotation2 = Math.atan2(props.y2, props.x2);
    return (
      <RightArrowhead
        id={idFn()}
        x={props.x2}
        y={props.y2}
        rotationAngleFromXInRadians={rotation2}
      ></RightArrowhead>
    );
  };

  return (
    <Group id={props.id} transform={transform} cursor={cursor}>
      <line x1="0" y1="0" x2={props.x2} y2={props.y2} stroke="grey"></line>
      {props.left ? leftArrowhead() : <></>}
      {props.right ? rightArrowhead() : <></>}
    </Group>
  );
};

export default Arrow;
