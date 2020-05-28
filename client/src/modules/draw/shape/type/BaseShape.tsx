import React from 'react';
import { Shape } from '../shape.reducer';
import { COLORS } from 'global/colors';
import TextBlock from 'modules/draw/mixins/editText/TextBlock';
import SelectionCircles from 'modules/draw/mixins/select/SelectionCircles';
import { Player } from 'modules/players/players.reducer';
export const SHAPE_WIDTH = 150;
export const SHAPE_HEIGHT = 75;

export interface BaseShapeProps {
  cursor: string;
  fill: string;
  fillOpacity: number;
  strokeColor: string;
  strokeDasharray: number;
  textX: number;
  textY: number;
  placeholderText?: string;
  shape: Shape;
  isMultiSelected: boolean;
  isSelected: boolean;
  playerSelected?: Player;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerOver: (e: React.PointerEvent) => void;
}

const BaseShape: React.FC<BaseShapeProps> = (props) => {
  const {
    cursor,
    fill,
    fillOpacity,
    strokeColor,
    strokeDasharray,
    shape,
    textX,
    textY,
    placeholderText,
    isMultiSelected,
    isSelected,
    playerSelected,
    onPointerDown,
    onPointerOver,
  } = props;

  const {
    id,
    x,
    y,
    translateX,
    translateY,
    width,
    height,
    deltaWidth,
    deltaHeight,
    createdAtZoomLevel,
    text,
    isSavedInDB,
  } = shape;

  const transform = `translate(${x + translateX}, ${y + translateY})`;

  const fontSize = 12;
  const radiusSize = 2;
  const strokeWidth = 4;
  const selectedStrokeDashArray = 5;
  const ghostStrokeDashArray = 5;

  const isGhost = id === '';

  const borderColor =
    isSelected || isMultiSelected
      ? COLORS.select
      : playerSelected
      ? playerSelected.color
      : isGhost
      ? COLORS.ghost
      : strokeColor;

  const borderStrokeDash =
    isSelected || isMultiSelected
      ? selectedStrokeDashArray + 'px'
      : isGhost
      ? ghostStrokeDashArray + 'px'
      : strokeDasharray + 'px';

  if (!shape) return <></>;
  return (
    <g
      id={id}
      transform={transform}
      cursor={cursor}
      opacity={isSavedInDB ? 1 : 0.5}
      onPointerDown={(e) => onPointerDown(e)}
      onPointerOver={(e) => onPointerOver(e)}
    >
      <rect
        width={width + deltaWidth}
        height={height + deltaHeight}
        rx={radiusSize + 'px'}
        ry={radiusSize + 'px'}
        fill={fill}
        fillOpacity={fillOpacity}
        stroke={borderColor}
        strokeWidth={strokeWidth + 'px'}
        strokeDasharray={borderStrokeDash}
      ></rect>
      <TextBlock
        isSelected={isSelected}
        x={textX}
        y={textY}
        fontSize={fontSize}
        text={text}
        placeholderText={placeholderText}
        createdAtZoomLevel={createdAtZoomLevel}
      />
      {(isSelected || isMultiSelected || isGhost) && (
        <SelectionCircles
          id={id}
          createdAtZoomLevel={createdAtZoomLevel}
          width={width + deltaWidth}
          height={height + deltaHeight}
        ></SelectionCircles>
      )}
    </g>
  );
};

export default BaseShape;
