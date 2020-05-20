import React from 'react';
import BaseShape from './BaseShape';
import { ShapeTypeProps } from '../Shape';
import { COLORS } from 'modules/draw/mixins/colors/colors';

const GroupingRect: React.FC<ShapeTypeProps> = (props) => {
  const { isSelected, isDragging } = props;
  const cursor = isSelected ? (isDragging ? 'grabbing' : 'grab') : 'pointer';
  const fill = COLORS.groupingRectBG;
  const fillOpacity = 0.15;
  const strokeDasharray = 0;
  const strokeColor = COLORS.groupingRectDefault;
  const textX = (props.shape.width + props.shape.deltaWidth) / 2;
  const textY = 0;
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
