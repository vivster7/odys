import React from 'react';
import { ShapeTypeProps } from '../Shape';
import BaseShape from './BaseShape';
import { COLORS } from 'modules/draw/mixins/colors/colors';
export const RECT_WIDTH = 150;
export const RECT_HEIGHT = 75;

const Rect: React.FC<ShapeTypeProps> = (props) => {
  const cursor = props.isDragging ? 'grabbing' : 'grab';
  const fill = COLORS.rectBg;
  const fillOpacity = 1;
  const strokeColor = COLORS.rectDefault;
  const strokeDasharray = 0;
  const textX = (props.shape.width + props.shape.deltaWidth) / 2;
  const textY = (props.shape.height + props.shape.deltaHeight) / 2;
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

export default Rect;
