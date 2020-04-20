import React from 'react';
import Group from './Group';
import LeftArrowhead from './LeftArrowhead';
import RightArrowhead from './RightArrowhead';
import { v4 } from 'uuid';
import { RectProps } from './Rect';
import Line from '../math/line';
import { RootState } from '../App';
import { useSelector } from 'react-redux';

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

interface R1R2ArrowProps {
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
const Arrow: React.FC<ArrowProps> = React.memo((props) => {
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

  function arrowheadRotation(x1: number, y1: number, x2: number, y2: number) {
    return Math.atan2(y2 - y1, x2 - x1);
  }

  const XYArrow: React.FC<XYArrowProps> = React.memo((props) => {
    const transform = `translate(${props.x1}, ${props.y1})`;
    const rotation = arrowheadRotation(props.x1, props.y1, props.x2, props.y2);

    return (
      <Group id={props.id} transform={transform} cursor={cursor}>
        <line
          x1="0"
          y1="0"
          x2={props.x2 - props.x1}
          y2={props.y2 - props.y1}
          stroke="grey"
        ></line>
        {props.left ? (
          <LeftArrowhead
            id={idFn()}
            x={0}
            y={0}
            rotationAngleFromXInRadians={rotation}
          ></LeftArrowhead>
        ) : (
          <></>
        )}
        {props.right ? (
          <RightArrowhead
            id={idFn()}
            x={props.x2}
            y={props.y2}
            rotationAngleFromXInRadians={rotation}
          ></RightArrowhead>
        ) : (
          <></>
        )}
      </Group>
    );
  });

  const R1R2Arrow: React.FC<R1R2ArrowProps> = React.memo((props) => {
    // arrow goes FROM rect1 (r1)  TO rect2 (r)
    const r1 = useSelector(
      (state: RootState) => state.shapes.data[props.fromId]
    ) as RectProps;
    const r2 = useSelector(
      (state: RootState) => state.shapes.data[props.toId]
    ) as RectProps;

    if (!r1) {
      throw new Error(`[r1Arrow] Could not find shape$ ${props.fromId}`);
    }
    if (!r2) {
      throw new Error(`[r2Arrow] Could not find shape$ ${props.toId}`);
    }

    const r1X = r1.x + r1.translateX;
    const r1Y = r1.y + r1.translateY;
    const r1Height = r1.height + r1.deltaHeight;
    const r1Width = r1.width + r1.deltaWidth;
    const r1XMid = (r1X + (r1X + r1Width)) / 2;
    const r1YMid = (r1Y + (r1Y + r1Height)) / 2;

    const r2X = r2.x + r2.translateX;
    const r2Y = r2.y + r2.translateY;
    const r2Height = r2.height + r2.deltaHeight;
    const r2Width = r2.width + r2.deltaWidth;
    const r2XMid = (r2X + (r2X + r2Width)) / 2;
    const r2YMid = (r2Y + (r2Y + r2Height)) / 2;

    // get angle (in radians) of line from (0, 0) r2 (x, y).
    // will be between 0 and 2 PI
    const angle = (y: number, x: number): number => {
      return Math.atan2(y, x) + Math.PI;
    };

    const r1NW = angle(r1Y - r1YMid, r1X - r1XMid);
    const r1NE = angle(r1Y - r1YMid, r1X + r1Width - r1XMid);
    const r1SW = angle(r1Y + r1Height - r1YMid, r1X - r1XMid);
    const r1SE = angle(r1Y + r1Height - r1YMid, r1X + r1Width - r1XMid);
    const r2NW = angle(r2Y - r2YMid, r2X - r2XMid);
    const r2NE = angle(r2Y - r2YMid, r2X + r2Width - r2XMid);
    const r2SW = angle(r2Y + r2Height - r2YMid, r2X - r2XMid);
    const r2SE = angle(r2Y + r2Height - r2YMid, r2X + r2Width - r2XMid);

    const r1Below = new Line(
      { x: r1X, y: r1Y + r1Height + 5 },
      { x: r1X + r1Width, y: r1Y + r1Height + 5 }
    );
    const r1Above = new Line(
      { x: r1X, y: r1Y - 5 },
      { x: r1X + r1Width, y: r1Y - 5 }
    );
    const r1Left = new Line(
      { x: r1X - 5, y: r1Y },
      { x: r1X - 5, y: r1Y + r1Height }
    );
    const r1Right = new Line(
      { x: r1X + r1Width + 5, y: r1Y },
      { x: r1X + r1Width + 5, y: r1Y + r1Height }
    );

    const r2Below = new Line(
      { x: r2X, y: r2Y + r2Height + 5 },
      { x: r2X + r2Width, y: r2Y + r2Height + 5 }
    );
    const r2Above = new Line(
      { x: r2X, y: r2Y - 5 },
      { x: r2X + r2Width, y: r2Y - 5 }
    );
    const r2Left = new Line(
      { x: r2X - 5, y: r2Y },
      { x: r2X - 5, y: r2Y + r2Height }
    );
    const r2Right = new Line(
      { x: r2X + r2Width + 5, y: r2Y },
      { x: r2X + r2Width + 5, y: r2Y + r2Height }
    );

    const slopeTheta = angle(r2YMid - r1YMid, r2XMid - r1XMid);
    let r1Line: Line;
    if (slopeTheta >= r1NW && slopeTheta < r1NE) {
      r1Line = r1Above;
    } else if (slopeTheta >= r1NE && slopeTheta < r1SE) {
      r1Line = r1Right;
    } else if (slopeTheta >= r1SE && slopeTheta < r1SW) {
      r1Line = r1Below;
    } else if (slopeTheta >= r1SW || slopeTheta < r1NW) {
      r1Line = r1Left;
    } else {
      throw new Error('Could not determine r1Line for arrow offset');
    }

    let r2Line: Line;
    if (slopeTheta >= r2NW && slopeTheta < r2NE) {
      r2Line = r2Below;
    } else if (slopeTheta >= r2NE && slopeTheta < r2SE) {
      r2Line = r2Left;
    } else if (slopeTheta >= r2SE && slopeTheta < r2SW) {
      r2Line = r2Above;
    } else if (slopeTheta >= r2SW || slopeTheta < r2NW) {
      r2Line = r2Right;
    } else {
      throw new Error('Could not determine r2Line for arrow offset');
    }

    const slopeLine = new Line(
      { x: r1XMid, y: r1YMid },
      { x: r2XMid, y: r2YMid }
    );
    const r1Offset = slopeLine.intersects(r1Line);
    const r2Offset = slopeLine.intersects(r2Line);

    const x1 = r1Offset.x;
    const y1 = r1Offset.y;
    const x2 = r2Offset.x;
    const y2 = r2Offset.y;
    const rotation = arrowheadRotation(x1, y1, x2, y2);

    const left = false;
    const right = true;

    return (
      <Group id={props.id} transform={transform} cursor={cursor}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="grey"></line>
        {left ? (
          <LeftArrowhead
            id={idFn()}
            x={0}
            y={0}
            rotationAngleFromXInRadians={rotation}
          ></LeftArrowhead>
        ) : (
          <></>
        )}
        {right ? (
          <RightArrowhead
            id={idFn()}
            x={x2}
            y={y2}
            rotationAngleFromXInRadians={rotation}
          ></RightArrowhead>
        ) : (
          <></>
        )}{' '}
      </Group>
    );
  });

  return (
    <>
      {props.fromId && props.toId && (
        <R1R2Arrow
          id={idFn()}
          fromId={props.fromId}
          toId={props.toId}
        ></R1R2Arrow>
      )}
      {props.x1 &&
        props.y1 &&
        props.x2 &&
        props.y2 &&
        props.translateX &&
        props.translateY && (
          <XYArrow
            id={idFn()}
            x1={props.x1}
            y1={props.y1}
            x2={props.x2}
            y2={props.y2}
            translateX={props.translateX}
            translateY={props.translateY}
            left={false}
            right={true}
          ></XYArrow>
        )}
    </>
  );
});

export default Arrow;
