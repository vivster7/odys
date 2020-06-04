import React from 'react';
import { useDispatch } from 'react-redux';

import { addError } from 'modules/errors/errors.reducer';

import { DrawingProps } from '../DrawContainer';
import { COLORS } from 'global/colors';
import { selectDrawing } from '../draw.reducer';
import { useSelector } from 'global/redux';
import { setCursorOver } from 'modules/canvas/canvas.reducer';
import { computeCurve } from './path';
import { Shape } from 'modules/draw/shape/shape.reducer';
import TextBlock from 'modules/draw/mixins/editText/TextBlock';

const TEXT_PADDING = 5;

export interface ArrowTypeProps {
  id: string;
  fromShape: Shape;
  toShape: Shape;
  text: string;
  color: string;
  isCmdPressed: boolean;
  isSelected: boolean;
}

export const Path: React.FC<ArrowTypeProps> = React.memo((props) => {
  const {
    id,
    fromShape,
    toShape,
    text,
    color,
    isCmdPressed,
    isSelected,
  } = props;
  const dispatch = useDispatch();

  const fontSize = 12;
  const strokeWidth = 3;
  const selectionTargetWidth = 20;

  const { path, x1, x2, y1, y2 } = computeCurve(fromShape, toShape);

  const isGhost = id === '' && text === '';

  function handlePointerDown(e: React.MouseEvent) {
    console.log('arrow clicked');
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
      onPointerOver={isCmdPressed ? (e) => handlePointerOver(e) : undefined}
      pointerEvents="visibleStroke"
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
            stroke="red"
            strokeOpacity="1"
            strokeWidth={selectionTargetWidth + 'px'}
            fill="white"
            onClick={(e) => handlePointerDown(e)}
            d={path}
          />
          <TextBlock
            id={id}
            isSelected={isSelected}
            x={Math.min(x1, x2)}
            y={Math.min(y1, y2)}
            width={Math.max(Math.abs(x2 - x1), 100)}
            height={Math.max(Math.abs(y2 - y1), 40)}
            text={text}
            alignText="center"
            backgroundColor={
              isSelected
                ? 'rgba(231, 235, 239, 0.9)'
                : 'rgba(231, 235, 239, 0.3)'
            }
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
  const isCmdPressed = useSelector((s) => s.keyboard.cmdKey);

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
        id,
        isCmdPressed,
        isSelected,
        color,
        text: arrow.text,
        fromShape: r1,
        toShape: r2,
      }}
    />
  );
});

export default Arrow;
