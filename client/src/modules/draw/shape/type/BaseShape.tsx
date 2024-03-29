import React from 'react';
import CSS from 'csstype';
import { Shape } from '../shape.reducer';
import { COLORS } from 'global/colors';
import TextBlock from 'modules/draw/mixins/editText/TextBlock';
import SelectionCircles from 'modules/draw/mixins/select/SelectionCircles';
import { Player } from 'modules/players/players.reducer';
import { Ungroup } from './GroupingRect';
export const SHAPE_WIDTH = 150;
export const SHAPE_HEIGHT = 75;

export interface BaseShapeProps {
  cursor: string;
  fill: string;
  fillOpacity: number;
  strokeColor: string;
  strokeDasharray: number;
  justifyContent: string;
  alignItems: string;
  textAlign: CSS.TextAlignProperty;
  shape: Shape;
  isMultiSelected: boolean;
  isSelected: boolean;
  playerSelected?: Player;
  isEditing: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerOver: (e: React.PointerEvent) => void;
  shouldIgnorePointerOver: boolean;
}

const BaseShape: React.FC<BaseShapeProps> = (props) => {
  const {
    cursor,
    fill,
    fillOpacity,
    strokeColor,
    strokeDasharray,
    shape,
    justifyContent,
    alignItems,
    textAlign,
    isMultiSelected,
    isSelected,
    playerSelected,
    isEditing,
    onPointerDown,
    onPointerOver,
    shouldIgnorePointerOver,
  } = props;

  const {
    id,
    x,
    y,
    width,
    height,
    createdAtZoomLevel,
    text,
    isSavedInDB,
  } = shape;

  const transform = `translate(${x}, ${y})`;

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
      onPointerOver={
        shouldIgnorePointerOver ? undefined : (e) => onPointerOver(e)
      }
    >
      <rect
        width={width}
        height={height}
        rx={radiusSize + 'px'}
        ry={radiusSize + 'px'}
        fill={fill}
        fillOpacity={fillOpacity}
        stroke={borderColor}
        strokeWidth={strokeWidth + 'px'}
        strokeDasharray={borderStrokeDash}
      ></rect>
      <TextBlock
        id={id}
        isEditing={isEditing}
        isSelected={isSelected}
        width={width}
        height={height}
        text={text}
        justifyContent={justifyContent}
        alignItems={alignItems}
        textAlign={textAlign}
      />
      {(isSelected || isMultiSelected || isGhost) && (
        <SelectionCircles
          id={id}
          createdAtZoomLevel={createdAtZoomLevel}
          width={width}
          height={height}
        ></SelectionCircles>
      )}
      {isSelected && shape.type === 'grouping_rect' && (
        <Ungroup shape={shape}></Ungroup>
      )}
    </g>
  );
};

export default BaseShape;
