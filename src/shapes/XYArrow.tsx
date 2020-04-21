import React from 'react';
import { Draggable, idFn } from './Shape';
import Group from './Group';
import Arrowhead from './Arrowhead';

export type XYArrowProps = {
  id: string;
  x2: number;
  y2: number;
  left: boolean;
  right: boolean;
} & Draggable;

const XYArrow: React.FC<XYArrowProps> = React.memo((props) => {
  function arrowheadRotation(x1: number, y1: number, x2: number, y2: number) {
    return Math.atan2(y2 - y1, x2 - x1);
  }
  const transform = `translate(${props.x}, ${props.y})`;
  const cursor = 'auto';
  const rotation = arrowheadRotation(props.x, props.y, props.x2, props.y2);

  return (
    <Group id={props.id} transform={transform} cursor={cursor}>
      <line
        x1="0"
        y1="0"
        x2={props.x2 - props.x}
        y2={props.y2 - props.y}
        stroke="grey"
      ></line>
      {props.left ? (
        <Arrowhead
          id={idFn()}
          x={0}
          y={0}
          direction="left"
          rotationAngleFromXInRadians={rotation}
        ></Arrowhead>
      ) : (
        <></>
      )}
      {props.right ? (
        <Arrowhead
          id={idFn()}
          x={props.x2}
          y={props.y2}
          direction="right"
          rotationAngleFromXInRadians={rotation}
        ></Arrowhead>
      ) : (
        <></>
      )}
    </Group>
  );
});

export default XYArrow;
