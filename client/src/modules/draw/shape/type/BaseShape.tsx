import React from 'react';
import { zoomLeveltoScaleMap } from 'modules/canvas/zoom/zoom.reducer';
import SelectionCircles from 'modules/draw/mixins/select/SelectionCircles';
import { Shape } from '../shape.reducer';
import { Player } from 'modules/players/players.reducer';
import { COLORS } from 'modules/draw/mixins/colors/colors';
export const SHAPE_WIDTH = 150;
export const SHAPE_HEIGHT = 75;

export interface BaseShapeProps {
  cursor: string;
  fill: string;
  fillOpacity: number;
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
  const fontSize = 14 / scale;
  const radiusSize = 2 / scale;
  const strokeWidth = 2 / scale;
  const selectedStrokeDashArray = 4 / scale;
  const scaledStrokeDasharray = strokeDasharray / scale;

  const selectColor =
    isSelected || isMultiSelected
      ? COLORS.selected
      : playerSelected
      ? playerSelected.color
      : COLORS.default;

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
      <text
        x={textX}
        y={textY}
        textAnchor="middle"
        textRendering="optimizeSpeed"
        fontSize={fontSize + 'px'}
      >
        {text}
      </text>
      {isSelected && (
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
