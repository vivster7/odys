import React from 'react';
import Arrowhead from './Arrowhead';
import { RectProps } from './Rect';
import Line from '../math/line';
import { RootState } from '../App';
import { useSelector, useDispatch } from 'react-redux';
import Shape, { idFn, ShapeId, TextEditable } from './Shape';
import { selectShape } from '../reducers/shapes/shape';
import { zoomLeveltoScaleMap } from '../reducers/svg';
import { addError } from '../reducers/errors';

export type ArrowProps = {
  type: 'arrow';

  // connect to shapes
  fromId: string;
  toId: string;
  createdAtZoomLevel: number;
} & Shape &
  TextEditable;

const Arrow: React.FC<ShapeId> = React.memo((props) => {
  const { id } = props;
  const dispatch = useDispatch();

  function arrowheadRotation(x1: number, y1: number, x2: number, y2: number) {
    return Math.atan2(y2 - y1, x2 - x1);
  }

  const arrow = useSelector(
    (state: RootState) => state.shapes.data[id]
  ) as ArrowProps;

  // arrow goes FROM rect1 (r1)  TO rect2 (r)
  const r1 = useSelector(
    (state: RootState) => state.shapes.data[arrow.fromId]
  ) as RectProps;
  const r2 = useSelector(
    (state: RootState) => state.shapes.data[arrow.toId]
  ) as RectProps;

  const isSelected = useSelector(
    (state: RootState) => state.shapes.select?.id === id
  );
  const color = isSelected ? 'cornflowerblue' : 'gray';

  const fontSize = 14 / zoomLeveltoScaleMap[arrow.createdAtZoomLevel];
  const strokeWidth = 1 / zoomLeveltoScaleMap[arrow.createdAtZoomLevel];
  const offset = 5 / zoomLeveltoScaleMap[arrow.createdAtZoomLevel];

  if (!r1) {
    dispatch(addError(`[r1Arrow] Could not find shape$ ${arrow.fromId}`));
    return <></>;
  }
  if (!r2) {
    dispatch(addError(`[r2Arrow] Could not find shape$ ${arrow.toId}`));
    return <></>;
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
    { x: r1X, y: r1Y + r1Height + offset },
    { x: r1X + r1Width, y: r1Y + r1Height + offset }
  );
  const r1Above = new Line(
    { x: r1X, y: r1Y - offset },
    { x: r1X + r1Width, y: r1Y - offset }
  );
  const r1Left = new Line(
    { x: r1X - offset, y: r1Y },
    { x: r1X - offset, y: r1Y + r1Height }
  );
  const r1Right = new Line(
    { x: r1X + r1Width + offset, y: r1Y },
    { x: r1X + r1Width + offset, y: r1Y + r1Height }
  );

  const r2Below = new Line(
    { x: r2X, y: r2Y + r2Height + offset },
    { x: r2X + r2Width, y: r2Y + r2Height + offset }
  );
  const r2Above = new Line(
    { x: r2X, y: r2Y - offset },
    { x: r2X + r2Width, y: r2Y - offset }
  );
  const r2Left = new Line(
    { x: r2X - offset, y: r2Y },
    { x: r2X - offset, y: r2Y + r2Height }
  );
  const r2Right = new Line(
    { x: r2X + r2Width + offset, y: r2Y },
    { x: r2X + r2Width + offset, y: r2Y + r2Height }
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
    dispatch(addError('Could not determine r1Line for arrow offset'));
    return <></>;
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
    dispatch(addError('Could not determine r2Line for arrow offset'));
    return <></>;
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

  function handleMouseDown(e: React.MouseEvent) {
    e.stopPropagation();
    dispatch(selectShape(id));
  }

  return (
    <g id={props.id} onMouseDown={(e) => handleMouseDown(e)}>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={strokeWidth + 'px'}
      ></line>
      {left ? (
        <Arrowhead
          id={idFn()}
          x={0}
          y={0}
          direction="left"
          isSelected={isSelected}
          rotationAngleFromXInRadians={rotation}
          createdAtZoomLevel={arrow.createdAtZoomLevel}
        ></Arrowhead>
      ) : (
        <></>
      )}
      {right ? (
        <Arrowhead
          id={idFn()}
          x={x2}
          y={y2}
          direction="right"
          isSelected={isSelected}
          rotationAngleFromXInRadians={rotation}
          createdAtZoomLevel={arrow.createdAtZoomLevel}
        ></Arrowhead>
      ) : (
        <></>
      )}
      <text
        x={(x1 + x2) / 2}
        y={(y1 + y2) / 2}
        textAnchor="middle"
        textRendering="optimizeSpeed"
        fontSize={fontSize + 'px'}
        onMouseDown={(e) => handleMouseDown(e)}
      >
        {arrow.text}
      </text>
    </g>
  );
});

export default Arrow;
