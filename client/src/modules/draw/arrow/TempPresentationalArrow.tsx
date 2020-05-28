/**
 * THIS FILE IS TEMPORARY TO MINIMIZE ANY DIFFS LEGARLIN MIGHT HAVE
 * WHEN DOING INPUT/OUTPUT ARROWS.
 *
 * IT MUST BE DELETED BY 05/29/2020. PLEASE.
 */

import React from 'react';
import { useDispatch } from 'react-redux';

import { addError } from 'modules/errors/errors.reducer';

import { COLORS } from 'global/colors';
import { selectDrawing } from '../draw.reducer';
import { useSelector } from 'global/redux';
import { setCursorOver } from 'modules/canvas/canvas.reducer';
import { Player } from 'modules/players/players.reducer';

const TEXT_PADDING = 5;

export interface ArrowProps {
  id: string;
  fromShapeId: string;
  toShapeId: string;
  text: string;
  playerSelected?: Player;
  playerId: string;
  isSavedInDB: boolean;
}

const TempPresentationalArrow: React.FC<ArrowProps> = React.memo((props) => {
  const {
    id,
    fromShapeId,
    toShapeId,
    text,
    playerId,
    playerSelected,
    isSavedInDB,
  } = props;
  const dispatch = useDispatch();

  // arrow goes FROM rect1 (r1)  TO rect2 (r)
  const r1 = useSelector((s) => s.draw.shapes[fromShapeId]);
  const r2 = useSelector((s) => s.draw.shapes[toShapeId]);

  const isSelected = useSelector((s) => s.draw.select?.id === id);

  const color = isSelected
    ? COLORS.select
    : playerSelected
    ? playerSelected.color
    : COLORS.arrowDefault;

  if (!r1) {
    dispatch(addError(`[r1Arrow] Could not find shape$ ${fromShapeId}`));
    return <></>;
  }
  if (!r2) {
    dispatch(addError(`[r2Arrow] Could not find shape$ ${toShapeId}`));
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
  const controlPointOffset = (start: number, end: number) => (end - start) / 2;

  let x1: number;
  let x2: number;
  let y1: number;
  let y2: number;
  /**
    if x-diff is greater than y-diff, so draw arrows primarily along x-axis as the anchor
    else draw arrows primarily along y-axis as the anchor
  */
  if (Math.abs(r2XMid - r1XMid) > Math.abs(r2YMid - r1YMid)) {
    /**
      if r1-x position is greater than r2-x position, then arrow is traveling in the negative-x direction (left),
      else arrow is traveling in the positive x-direction (right)
    */
    y1 = r1YMid;
    y2 = r2YMid;

    if (r1XMid > r2XMid) {
      const cp = controlPointOffset(r2XEdge, r1X);
      x1 = r1X - offset;
      x2 = r2XEdge + offset;

      path = `M ${x1} ${y1} C ${x1 - cp} ${y1} ${x2 + cp} ${y2}, ${x2} ${y2}`;
    } else {
      const cp = controlPointOffset(r1XEdge, r2X);
      x1 = r1XEdge + offset;
      x2 = r2X - offset;

      path = `M ${x1} ${y1} C ${x1 + cp} ${y1} ${x2 - cp} ${y2}, ${x2} ${y2}`;
    }
  } else {
    /**
      if r1-y position is greater than r2-y position, then arrow is traveling in the negative-y direction (up),
      else arrow is traveling in the positive y-direction (down)
    */
    x1 = r1XMid;
    x2 = r2XMid;

    if (r1YMid > r2YMid) {
      const cp = controlPointOffset(r2YEdge, r1Y);
      y1 = r1Y - offset;
      y2 = r2YEdge + offset;

      path = `M ${x1} ${y1} C ${x1} ${y1 - cp} ${x2} ${y2 + cp}, ${x2} ${y2}`;
    } else {
      const cp = controlPointOffset(r1YEdge, r2Y);
      y1 = r1YEdge + offset;
      y2 = r2Y - offset;

      path = `M ${x1} ${y1} C ${x1} ${y1 + cp} ${x2} ${y2 - cp}, ${x2} ${y2}`;
    }
  }

  function handlePointerDown(e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    dispatch(selectDrawing({ id, shiftKey: e.shiftKey, playerId: playerId }));
  }

  function handlePointerOver(e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    dispatch(setCursorOver({ type: 'arrow', id }));
  }

  return (
    <g
      id={props.id}
      onPointerDown={(e) => handlePointerDown(e)}
      onPointerOver={(e) => handlePointerOver(e)}
      cursor="pointer"
      opacity={isSavedInDB ? 1 : 0.5}
    >
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
        onPointerDown={(e) => handlePointerDown(e)}
      >
        {text}
      </text>
    </g>
  );
});

export default TempPresentationalArrow;
