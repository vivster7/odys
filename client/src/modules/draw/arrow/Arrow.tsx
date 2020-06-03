import React from 'react';
import { useDispatch } from 'react-redux';

import { DrawingProps } from '../DrawContainer';
import { COLORS } from 'global/colors';
import { selectDrawing } from '../draw.reducer';
import { useSelector } from 'global/redux';
import { setCursorOver } from 'modules/canvas/canvas.reducer';
import { computeCurve } from './path';
import { Shape } from 'modules/draw/shape/shape.reducer';

export interface ArrowTypeProps {
  id: string;
  fromShape: Shape;
  toShape: Shape;
  text: string;
  color: string;
}

export const Path: React.FC<ArrowTypeProps> = React.memo((props) => {
  const { id, fromShape, toShape, text, color } = props;
  const dispatch = useDispatch();

  const strokeWidth = 3;
  const selectionTargetWidth = 20;

  const { path } = computeCurve(fromShape, toShape);

  const isGhost = id === '' && text === '';

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
    <g
      id={props.id}
      onPointerDown={(e) => handlePointerDown(e)}
      onPointerOver={(e) => handlePointerOver(e)}
      cursor="pointer"
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
      {isGhost ? (
        <></>
      ) : (
        <>
          <path
            stroke={color}
            strokeOpacity="0"
            strokeWidth={selectionTargetWidth + 'px'}
            fill="transparent"
            d={path}
          />
        </>
      )}
    </g>
  );
});

const Arrow: React.FC<DrawingProps> = React.memo((props) => {
  const { id, playerSelected } = props;
  const arrow = useSelector((s) => s.draw.arrows[id]);

  // arrow goes FROM rect1 (r1)  TO rect2 (r)
  const r1 = useSelector((s) => s.draw.shapes[arrow.fromShapeId]);
  const r2 = useSelector((s) => s.draw.shapes[arrow.toShapeId]);

  const isSelected = useSelector((s) => s.draw.select?.id === id);

  const color = isSelected
    ? COLORS.select
    : playerSelected
    ? playerSelected.color
    : COLORS.arrowDefault;

  if (!r1 || !r2) {
    if (!r1)
      console.error(`[r1Arrow] Could not find shape$ ${arrow.fromShapeId}`);
    if (!r2)
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
        id: id,
        text: arrow.text,
        fromShape: r1,
        toShape: r2,
        color: color,
      }}
    />
  );
});

export default Arrow;
