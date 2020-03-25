import React, { useContext } from 'react';
import Group from './Group';
import LeftArrowhead from './LeftArrowhead';
import RightArrowhead from './RightArrowhead';
import { v4 } from 'uuid';
import { GlobalStateContext } from '../globals';
import { RectProps } from './Rect';

export interface ArrowProps {
  type: 'arrow';
  id: string;

  // HACK, x,y should be removed
  x: number;
  y: number;

  // absolute placement (not attached to a shape)
  x1: number | null;
  y1: number | null;
  x2: number | null;
  y2: number | null;
  translateX: number | null;
  translateY: number | null;

  // toggle left or right arrowheads
  left: boolean;
  right: boolean;

  // connect to shapes
  fromId: string | null;
  toId: string | null;
}

interface XYArrowProps {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  translateX: number;
  translateY: number;
  left: boolean;
  right: boolean;
}

interface FromToArrowProps {
  id: string;
  fromId: string;
  toId: string;
}

interface ArrowheadProps {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

const idFn = () => `id-${v4()}`;
const Arrow: React.FC<ArrowProps> = props => {
  const { globalState } = useContext(GlobalStateContext);
  // TODO: drag + move edges
  const transform = `translate(${props.x1}, ${props.y1})`;
  const cursor = 'auto';

  (function validate() {
    if (props.fromId && props.toId) {
      return;
    }

    if (
      props.x1 &&
      props.y1 &&
      props.x2 &&
      props.y2 &&
      props.translateX &&
      props.translateY
    ) {
      return;
    }
    throw new Error(
      'Invalid arrow props. Needs either (`from`,`to`). Or (`x1`,`y1`,`x2`,`y2`,`translateX`,`translateY`)'
    );
  })();

  const leftArrowhead: React.FC<ArrowheadProps> = props => {
    const rotation1 = Math.atan2(props.y2 - props.y1, props.x2 - props.x1);
    return (
      <LeftArrowhead
        id={idFn()}
        x={0}
        y={0}
        rotationAngleFromXInRadians={rotation1}
      ></LeftArrowhead>
    );
  };

  const rightArrowhead: React.FC<ArrowheadProps> = props => {
    const rotation2 = Math.atan2(props.y2 - props.y1, props.x2 - props.x1);
    return (
      <RightArrowhead
        id={idFn()}
        x={props.x2}
        y={props.y2}
        rotationAngleFromXInRadians={rotation2}
      ></RightArrowhead>
    );
  };

  const XYArrow: React.FC<XYArrowProps> = props => {
    return (
      <Group id={props.id} transform={transform} cursor={cursor}>
        <line
          x1="0"
          y1="0"
          x2={props.x2 - props.x1}
          y2={props.y2 - props.y1}
          stroke="grey"
        ></line>
        {props.left ? leftArrowhead(props) : <></>}
        {props.right ? rightArrowhead(props) : <></>}
      </Group>
    );
  };

  const FromToArrow: React.FC<FromToArrowProps> = props => {
    const from = globalState.shapes.find(
      s => s.id === props.fromId
    ) as RectProps;
    if (!from) {
      throw new Error(`[fromArrow] Could not find shape$ ${props.fromId}`);
    }
    const to = globalState.shapes.find(s => s.id === props.toId) as RectProps;
    if (!to) {
      throw new Error(`[toArrow] Could not find shape$ ${props.toId}`);
    }

    const x1 =
      (from.x +
        from.translateX +
        from.x +
        from.translateX +
        from.width +
        from.deltaWidth) /
      2;
    const y1 =
      (from.y +
        from.translateY +
        from.y +
        from.translateY +
        from.height +
        from.deltaHeight) /
      2;
    const x2 =
      (to.x + to.translateX + to.x + to.translateX + to.width + to.deltaWidth) /
      2;
    const y2 =
      (to.y +
        to.translateY +
        to.y +
        to.translateY +
        to.height +
        to.deltaHeight) /
      2;

    const left = false;
    const right = true;

    return (
      <Group id={props.id} transform={transform} cursor={cursor}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="grey"></line>
        {left ? leftArrowhead({ x1, x2, y1, y2 }) : <></>}
        {right ? rightArrowhead({ x1, x2, y1, y2 }) : <></>}
      </Group>
    );
  };

  return (
    <>
      {props.fromId && props.toId
        ? FromToArrow(props as FromToArrowProps)
        : XYArrow(props as XYArrowProps)}
    </>
  );
};

export default Arrow;
