import React from 'react';
import { ShapeProps } from '../Shape';
import BaseShape from './BaseShape';
import { zoomLeveltoScaleMap } from 'modules/svg/zoom/zoom.reducer';

const GroupingRect: React.FC<ShapeProps> = (props) => {
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
