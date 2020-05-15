import React from 'react';
import { ShapeTypeProps } from '../Shape';
import BaseShape from './BaseShape';
import { zoomLeveltoScaleMap } from 'modules/canvas/zoom/zoom.reducer';

const GroupingRect: React.FC<ShapeTypeProps> = (props) => {
  const { isSelected, isDragging } = props;
  const cursor = isSelected ? (isDragging ? 'grabbing' : 'grab') : 'auto';
  const fill = 'darkgray';
  const fillOpacity = 0.2;
  const strokeDasharray = 3;
  const textX = (props.shape.width + props.shape.deltaWidth) / 2;
  const textY = 20 / zoomLeveltoScaleMap[props.shape.createdAtZoomLevel];
  const childProps = {
    ...props,
    cursor,
    fill,
    fillOpacity,
    strokeDasharray,
    textX,
    textY,
  };
  return <BaseShape {...childProps}></BaseShape>;
};

export default GroupingRect;
