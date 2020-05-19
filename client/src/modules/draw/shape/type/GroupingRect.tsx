import React from 'react';
import { ShapeTypeProps } from '../Shape';
import BaseShape from './BaseShape';
import { zoomLeveltoScaleMap } from 'modules/canvas/zoom/zoom.reducer';
import { COLORS } from 'modules/draw/mixins/colors/colors';

const GroupingRect: React.FC<ShapeTypeProps> = (props) => {
  const { isSelected, isDragging } = props;
  const cursor = isSelected ? (isDragging ? 'grabbing' : 'grab') : 'auto';
  const fill = COLORS.groupingRectBG;
  const fillOpacity = 0.15;
  const strokeDasharray = 0;
  const strokeColor = COLORS.groupingRectDefault;
  const textX = (props.shape.width + props.shape.deltaWidth) / 2;
  const textY = 20 / zoomLeveltoScaleMap[props.shape.createdAtZoomLevel];
  const childProps = {
    ...props,
    cursor,
    fill,
    fillOpacity,
    strokeColor,
    strokeDasharray,
    textX,
    textY,
  };
  return <BaseShape {...childProps}></BaseShape>;
};

export default GroupingRect;
