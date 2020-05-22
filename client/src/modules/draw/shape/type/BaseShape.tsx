import React from 'react';
import { Shape } from '../shape.reducer';
import { zoomLeveltoScaleMap } from 'modules/canvas/zoom/zoom.reducer';
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
  shape: Shape;
  isMultiSelected: boolean;
  isSelected: boolean;
  playerSelected?: Player;
  onMouseDown: (e: React.MouseEvent) => void;
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
    isMultiSelected,
    isSelected,
    playerSelected,
    onMouseDown,
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

  const scale = zoomLeveltoScaleMap[createdAtZoomLevel];
  const fontSize = 12 / scale;
  const radiusSize = 2 / scale;
  const strokeWidth = 4 / scale;
  const selectedStrokeDashArray = 5 / scale;
  const scaledStrokeDasharray = strokeDasharray / scale;

  const selectColor =
    isSelected || isMultiSelected
      ? COLORS.select
      : playerSelected
      ? playerSelected.color
      : strokeColor;

  if (!shape) return <></>;
  return (
    <g
      id={id}
      transform={transform}
      cursor={cursor}
      opacity={isSavedInDB ? 1 : 0.5}
      onMouseDown={(e) => onMouseDown(e)}
    >
      <rect
        width={width + deltaWidth}
        height={height + deltaHeight}
        rx={radiusSize + 'px'}
        ry={radiusSize + 'px'}
        fill={fill}
        fillOpacity={fillOpacity}
        stroke={selectColor}
        strokeWidth={strokeWidth + 'px'}
        strokeDasharray={
          isSelected || isMultiSelected
            ? selectedStrokeDashArray + 'px'
            : scaledStrokeDasharray + 'px'
        }
      ></rect>
      <TextBlock
        isSelected={isSelected}
        x={textX}
        y={textY}
        fontSize={fontSize}
        text={text}
        createdAtZoomLevel={createdAtZoomLevel}
      />
      {(isSelected || isMultiSelected) && (
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
