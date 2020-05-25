import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { RootState } from 'App';
import Line, { intersects } from 'math/line';
import { addError } from 'modules/errors/errors.reducer';

import { DrawingProps } from '../DrawContainer';
import { COLORS } from 'global/colors';
import { selectDrawing } from '../draw.reducer';

const TEXT_PADDING = 5;

const Arrow: React.FC<DrawingProps> = React.memo((props) => {
  const { id, playerSelected } = props;
  const dispatch = useDispatch();

  const arrow = useSelector((state: RootState) => state.draw.arrows[id]);
  const playerId = useSelector((state: RootState) => state.players.self);

  // arrow goes FROM rect1 (r1)  TO rect2 (r)
  const r1 = useSelector(
    (state: RootState) => state.draw.shapes[arrow.fromShapeId]
  );
  const r2 = useSelector(
    (state: RootState) => state.draw.shapes[arrow.toShapeId]
  );

  const isSelected = useSelector(
    (state: RootState) => state.draw.select?.id === id
  );

  const color = isSelected
    ? COLORS.select
    : playerSelected
    ? playerSelected.color
    : COLORS.arrowDefault;

  if (!r1) {
    dispatch(addError(`[r1Arrow] Could not find shape$ ${arrow.fromShapeId}`));
    return <></>;
  }
  if (!r2) {
    dispatch(addError(`[r2Arrow] Could not find shape$ ${arrow.toShapeId}`));
    return <></>;
  }

  const fontSize = 12;
  const strokeWidth = 3;
  const offset = 5;
  const selectionTargetWidth = 20;

  const r1X = r1.x + r1.translateX;
  const r1Y = r1.y + r1.translateY;
  const r1Height = r1.height + r1.deltaHeight;
  const r1Width = r1.width + r1.deltaWidth;
  const r1XEdge = r1X + r1Width;
  const r1YEdge = r1Y + r1Height;
  const r1XMid = (r1X + r1XEdge) / 2;
  const r1YMid = (r1Y + r1YEdge) / 2;

  const r2X = r2.x + r2.translateX;
  const r2Y = r2.y + r2.translateY;
  const r2Height = r2.height + r2.deltaHeight;
  const r2Width = r2.width + r2.deltaWidth;
  const r2XEdge = r2X + r2Width;
  const r2YEdge = r2Y + r2Height;
  const r2XMid = (r2X + r2XEdge) / 2;
  const r2YMid = (r2Y + r2YEdge) / 2;

  let path;
  const OFFSET = 5;
  const controlPointOffset = (start: number, end: number) => (end - start) / 2;
  /**
    if x-diff is greater than y-diff, so draw arrows primarily along x-axis as the anchor
    else draw arrows primarily along y-axis as the anchor
  */
  if (Math.abs(r2XMid - r1XMid) > Math.abs(r2YMid - r1YMid)) {
    /**
      if r1-x position is greater than r2-x position, then arrow is traveling in the negative-x direction (left),
      else arrow is traveling in the positive x-direction (right)
    */
    const yStart = r1YMid;
    const yEnd = r2YMid;

    if (r1XMid > r2XMid) {
      const cp = controlPointOffset(r2XEdge, r1X);
      const xStart = r1X - OFFSET;
      const xEnd = r2XEdge + OFFSET;

      path = `M ${xStart} ${yStart} C ${xStart - cp} ${yStart} ${
        xEnd + cp
      } ${yEnd}, ${xEnd} ${yEnd}`;
    } else {
      const cp = controlPointOffset(r1XEdge, r2X);
      const xStart = r1XEdge + OFFSET;
      const xEnd = r2X - OFFSET;

      path = `M ${xStart} ${yStart} C ${xStart + cp} ${yStart} ${
        xEnd - cp
      } ${yEnd}, ${xEnd} ${yEnd}`;
    }
  } else {
    /**
      if r1-y position is greater than r2-y position, then arrow is traveling in the negative-y direction (up),
      else arrow is traveling in the positive y-direction (down)
    */
    const xStart = r1XMid;
    const xEnd = r2XMid;

    if (r1YMid > r2YMid) {
      const cp = controlPointOffset(r2YEdge, r1Y);
      const yStart = r1Y - OFFSET;
      const yEnd = r2YEdge + OFFSET;

      path = `M ${xStart} ${yStart} C ${xStart} ${yStart - cp} ${xEnd} ${
        yEnd + cp
      }, ${xEnd} ${yEnd}`;
    } else {
      const cp = controlPointOffset(r1YEdge, r2Y);
      const yStart = r1YEdge + OFFSET;
      const yEnd = r2Y - OFFSET;

      path = `M ${xStart} ${yStart} C ${xStart} ${yStart + cp} ${xEnd} ${
        yEnd - cp
      }, ${xEnd} ${yEnd}`;
    }
  }

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

  const r1Below = {
    p: { x: r1X, y: r1Y + r1Height + offset },
    q: { x: r1X + r1Width, y: r1Y + r1Height + offset },
  };
  const r1Above = {
    p: { x: r1X, y: r1Y - offset },
    q: { x: r1X + r1Width, y: r1Y - offset },
  };
  const r1Left = {
    p: { x: r1X - offset, y: r1Y },
    q: { x: r1X - offset, y: r1Y + r1Height },
  };
  const r1Right = {
    p: { x: r1X + r1Width + offset, y: r1Y },
    q: { x: r1X + r1Width + offset, y: r1Y + r1Height },
  };

  const r2Below = {
    p: { x: r2X, y: r2Y + r2Height + offset },
    q: { x: r2X + r2Width, y: r2Y + r2Height + offset },
  };
  const r2Above = {
    p: { x: r2X, y: r2Y - offset },
    q: { x: r2X + r2Width, y: r2Y - offset },
  };
  const r2Left = {
    p: { x: r2X - offset, y: r2Y },
    q: { x: r2X - offset, y: r2Y + r2Height },
  };
  const r2Right = {
    p: { x: r2X + r2Width + offset, y: r2Y },
    q: { x: r2X + r2Width + offset, y: r2Y + r2Height },
  };

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

  const slopeLine = {
    p: { x: r1XMid, y: r1YMid },
    q: { x: r2XMid, y: r2YMid },
  };
  const r1Offset = intersects(slopeLine, r1Line);
  const r2Offset = intersects(slopeLine, r2Line);

  const x1 = r1Offset.x;
  const y1 = r1Offset.y;
  const x2 = r2Offset.x;
  const y2 = r2Offset.y;

  function handleMouseDown(e: React.MouseEvent) {
    e.stopPropagation();
    dispatch(selectDrawing({ id, shiftKey: e.shiftKey, playerId: playerId }));
  }

  return (
    <g id={props.id} onMouseDown={(e) => handleMouseDown(e)}>
      <defs>
        <marker
          id={`arrowhead.${props.id}`}
          markerWidth="2"
          markerHeight="4"
          refX="1"
          refY="2"
          orient="auto"
        >
          <path d="M0,0 V4 L2,2 Z" fill={color} />
        </marker>
      </defs>
      <path
        stroke={color}
        strokeWidth={strokeWidth + 'px'}
        fill="transparent"
        d={path}
        markerEnd={`url(#arrowhead.${props.id})`}
      />
      <path
        stroke={color}
        strokeOpacity="0"
        strokeWidth={selectionTargetWidth + 'px'}
        fill="transparent"
        d={path}
      />
      {/*<line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={strokeWidth + 'px'}
        markerEnd={`url(#arrowhead.${props.id})`}
      ></line>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={selectionTargetWidth + 'px'}
        strokeOpacity="0"
      ></line>*/}
      <text
        x={(x1 + x2) / 2}
        y={(y1 + y2) / 2 - TEXT_PADDING}
        textAnchor="middle"
        textRendering="optimizeSpeed"
        dominantBaseline="baseline"
        fontSize={fontSize + 'px'}
        fill={COLORS.text}
        onMouseDown={(e) => handleMouseDown(e)}
      >
        {arrow.text}
      </text>
    </g>
  );
});

export default Arrow;
