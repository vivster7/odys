import React from 'react';
import { zoomLeveltoScaleMap } from '../../../svg/zoom/zoom.reducer';
import SelectionCircles from 'modules/draw/mixins/select/SelectionCircles';
import { Shape } from '../shape.reducer';
export const SHAPE_WIDTH = 150;
export const SHAPE_HEIGHT = 75;

export interface BaseShapeProps {
  cursor: string;
  fill: string;
  fillOpacity: number;
  strokeDasharray: number;
  shape: Shape;
  isGroupSelected: boolean;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

const BaseShape: React.FC<BaseShapeProps> = (props) => {
  const {
    cursor,
    fill,
    fillOpacity,
    strokeDasharray,
    shape,
    isGroupSelected,
    isSelected,
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
  } = shape;

  const textX = (width + deltaWidth) / 2;
  const textY = (height + deltaHeight) / 2;

  const transform = `translate(${x + translateX}, ${y + translateY})`;

  const scale = zoomLeveltoScaleMap[createdAtZoomLevel];
  const fontSize = 14 / scale;
  const radiusSize = 4 / scale;
  const strokeWidth = 1 / scale;
  const selectedStrokeDashArray = 5 / scale;
  const scaledStrokeDasharray = strokeDasharray / scale;

  if (!shape) return <></>;
  return (
    <g
      id={id}
      transform={transform}
      cursor={cursor}
      onMouseDown={(e) => onMouseDown(e)}
    >
      <rect
        width={width + deltaWidth}
        height={height + deltaHeight}
        rx={radiusSize + 'px'}
        ry={radiusSize + 'px'}
        fill={fill}
        fillOpacity={fillOpacity}
        stroke={isSelected || isGroupSelected ? 'cornflowerblue' : 'darkgray'}
        strokeWidth={strokeWidth + 'px'}
        strokeDasharray={
          isSelected || isGroupSelected
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
