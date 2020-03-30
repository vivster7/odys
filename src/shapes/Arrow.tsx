import React, { useContext } from 'react';
import Group from './Group';
import LeftArrowhead from './LeftArrowhead';
import RightArrowhead from './RightArrowhead';
import { v4 } from 'uuid';
import { GlobalStateContext } from '../globals';
import { RectProps } from './Rect';
import Line from '../math/line';

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
  const transform = ``;
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
    const transform = `translate(${props.x1}, ${props.y1})`;
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

    const fromX = from.x + from.translateX;
    const fromY = from.y + from.translateY;
    const fromHeight = from.height + from.deltaHeight;
    const fromWidth = from.width + from.deltaWidth;

    const toX = to.x + to.translateX;
    const toY = to.y + to.translateY;
    const toHeight = to.height + to.deltaHeight;
    const toWidth = to.width + to.deltaWidth;

    const x1Mid = (fromX + (fromX + fromWidth)) / 2;
    const y1Mid = (fromY + (fromY + fromHeight)) / 2;
    const x2Mid = (toX + (toX + toWidth)) / 2;
    const y2Mid = (toY + (toY + toHeight)) / 2;

    const xOffset = fromWidth / 2 + 5;
    const yOffset = toHeight / 2 + 5;

    const x1Offset = fromWidth / 2 + 5;
    const x2Offset = -(toWidth / 2 + 5);
    const y1Offset = fromHeight / 2 + 5;
    const y2Offset = -(toHeight / 2 + 5);

    const line = new Line({ x: x1Mid, y: y1Mid }, { x: x2Mid, y: y2Mid });
    const theta = Math.atan2(y2Mid - y1Mid, x2Mid - x1Mid) + Math.PI;

    const fromNW = Math.atan2(fromY - y1Mid, fromX - x1Mid) + Math.PI;
    const fromNE =
      Math.atan2(fromY - y1Mid, fromX + fromWidth - x1Mid) + Math.PI;
    const fromSW =
      Math.atan2(fromY + fromHeight - y1Mid, fromX - x1Mid) + Math.PI;
    const fromSE =
      Math.atan2(fromY + fromHeight - y1Mid, fromX + fromWidth - x1Mid) +
      Math.PI;
    const toNW = Math.atan2(toY - y2Mid, toX - x2Mid) + Math.PI;
    const toNE = Math.atan2(toY - y2Mid, toX + toWidth - x2Mid) + Math.PI;
    const toSW = Math.atan2(toY + toHeight - y2Mid, toX - x2Mid) + Math.PI;
    const toSE =
      Math.atan2(toY + toHeight - y2Mid, toX + toWidth - x2Mid) + Math.PI;

    const fromBelow = new Line(
      { x: fromX, y: fromY + fromHeight + 5 },
      { x: fromX + fromWidth, y: fromY + fromHeight + 5 }
    );
    const fromAbove = new Line(
      { x: fromX, y: fromY - 5 },
      { x: fromX + fromWidth, y: fromY - 5 }
    );
    const fromLeft = new Line(
      { x: fromX - 5, y: fromY },
      { x: fromX - 5, y: fromY + fromHeight }
    );
    const fromRight = new Line(
      { x: fromX + fromWidth + 5, y: fromY },
      { x: fromX + fromWidth + 5, y: fromY + fromHeight }
    );

    const toBelow = new Line(
      { x: toX, y: toY + toHeight + 5 },
      { x: toX + toWidth, y: toY + toHeight + 5 }
    );
    const toAbove = new Line(
      { x: toX, y: toY - 5 },
      { x: toX + toWidth, y: toY - 5 }
    );
    const toLeft = new Line(
      { x: toX - 5, y: toY },
      { x: toX - 5, y: toY + toHeight }
    );
    const toRight = new Line(
      { x: toX + toWidth + 5, y: toY },
      { x: toX + toWidth + 5, y: toY + toHeight }
    );

    let fromLine: Line;
    if (theta >= fromNW && theta < fromNE) {
      fromLine = fromAbove;
    } else if (theta >= fromNE && theta < fromSE) {
      fromLine = fromRight;
    } else if (theta >= fromSE && theta < fromSW) {
      fromLine = fromBelow;
    } else if (theta >= fromSW || theta < fromNW) {
      fromLine = fromLeft;
    } else {
      throw new Error('Could not determine fromLine for arrow offset');
    }

    let toLine: Line;
    if (theta >= toNW && theta < toNE) {
      toLine = toBelow;
    } else if (theta >= toNE && theta < toSE) {
      toLine = toLeft;
    } else if (theta >= toSE && theta < toSW) {
      toLine = toAbove;
    } else if (theta >= toSW || theta < toNW) {
      toLine = toRight;
    } else {
      throw new Error('Could not determine toLine for arrow offset');
    }

    const fromOffset = line.intersects(fromLine);
    const toOffset = line.intersects(toLine);

    const x1 = fromOffset.x;
    const y1 = fromOffset.y;
    const x2 = toOffset.x;
    const y2 = toOffset.y;

    const left = false;
    const right = true;

    return (
      <Group id={props.id} transform={transform} cursor={cursor}>
        {/* <line x1={x1Mid} y1={y1Mid} x2={x2Mid} y2={y2Mid} stroke="grey"></line> */}
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
