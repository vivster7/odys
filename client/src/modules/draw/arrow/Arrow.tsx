import React from 'react';
import { useDispatch } from 'react-redux';

import { COLORS } from 'global/colors';
import { selectDrawing } from '../draw.reducer';
import { setCursorOver } from 'modules/canvas/canvas.reducer';
import { computeCurve } from './path';
import { Shape } from 'modules/draw/shape/shape.reducer';
import { Player } from 'modules/players/players.reducer';
import { Arrow as ArrowT } from './arrow.reducer';

export interface ArrowTypeProps {
  id: string;
  fromShape: Shape;
  toShape: Shape;
  text: string;
  color: string;
  shouldIgnorePointerOver: boolean;
  isSelected: boolean;
  fromShapeArrows: string[];
  toShapeArrows: string[];
}

export const Path: React.FC<ArrowTypeProps> = (props) => {
  const {
    id,
    fromShape,
    toShape,
    text,
    color,
    shouldIgnorePointerOver,
    fromShapeArrows,
    toShapeArrows,
  } = props;
  const dispatch = useDispatch();

  const strokeWidth = 3;
  const selectionTargetWidth = 20;

  const { path } = computeCurve(
    id,
    fromShape,
    toShape,
    fromShapeArrows,
    toShapeArrows
  );

  const isGhost = id === '' && text === '';
  const strokeColor = isGhost ? COLORS.arrowGhost : color;

  function handlePointerDown(e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    dispatch(selectDrawing({ id, shiftKey: e.shiftKey }));
  }

  function handlePointerOver(e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    dispatch(setCursorOver({ type: 'arrow', id }));
  }

  return (
    <g id={props.id} cursor="pointer">
      <defs>
        <marker
          id={`arrowhead.${props.id}`}
          markerWidth="2"
          markerHeight="4"
          refX="1"
          refY="2"
          orient="auto"
        >
          <path d="M0,0 V4 L2,2 Z" fill={strokeColor} />
        </marker>
      </defs>
      <path
        stroke={strokeColor}
        strokeWidth={strokeWidth + 'px'}
        fill="transparent"
        d={path}
        pointerEvents="stroke"
        markerEnd={`url(#arrowhead.${props.id})`}
      />
      {isGhost ? (
        <></>
      ) : (
        <>
          <path
            onPointerDown={(e) => handlePointerDown(e)}
            onPointerOver={
              shouldIgnorePointerOver ? undefined : (e) => handlePointerOver(e)
            }
            stroke={color}
            strokeOpacity="0"
            strokeWidth={selectionTargetWidth + 'px'}
            fill="transparent"
            d={path}
          />
          {/* <TextBlock
              id={id}
              isSelected={isSelected}
              x={Math.min(x1, x2)}
              y={Math.min(y1, y2)}
              width={Math.max(Math.abs(x2 - x1), 100)}
              height={Math.max(Math.abs(y2 - y1), 40)}
              text={text}
              alignText="center"
            /> */}
        </>
      )}
    </g>
  );
};

interface ArrowProps {
  arrow: ArrowT;
  playerSelected?: Player;
  isSelected: boolean;
  isMultiSelected: boolean;
  shouldIgnorePointerOver: boolean;
  fromShape: Shape;
  toShape: Shape;
  fromShapeArrows: string[];
  toShapeArrows: string[];
}

const Arrow: React.FC<ArrowProps> = (props) => {
  const {
    arrow,
    playerSelected,
    isSelected,
    isMultiSelected,
    shouldIgnorePointerOver,
    fromShape,
    toShape,
    fromShapeArrows,
    toShapeArrows,
  } = props;
  const { id } = arrow;

  const color =
    isSelected || isMultiSelected
      ? COLORS.select
      : playerSelected
      ? playerSelected.color
      : COLORS.arrowDefault;

  if (!fromShape || !toShape) {
    if (!fromShape)
      console.error(`[r1Arrow] Could not find shape$ ${arrow.fromShapeId}`);
    if (!toShape)
      console.error(`[r2Arrow] Could not find shape$ ${arrow.toShapeId}`);

    // If you undo to delete a shape, but its got new arrow attached,
    // this error will arise. Maybe its fine to just hide arrows without an error?
    // dispatch(
    //   addError(
    //     "We're having issues syncing this diagram. Try refreshing this page."
    //   )
    // );
    return <></>;
  }

  return (
    <Path
      {...{
        id,
        shouldIgnorePointerOver,
        color,
        text: arrow.text,
        fromShape: fromShape,
        toShape: toShape,
        isSelected: isSelected,
        fromShapeArrows: fromShapeArrows,
        toShapeArrows: toShapeArrows,
      }}
    />
  );
};

export default Arrow;
