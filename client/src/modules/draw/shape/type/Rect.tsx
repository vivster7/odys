import React from 'react';
import { ShapeProps } from '../Shape';
import BaseShape from './BaseShape';
export const RECT_WIDTH = 150;
export const RECT_HEIGHT = 75;

const Rect: React.FC<ShapeProps> = (props) => {
  const cursor = props.isDragging ? 'grabbing' : 'grab';
  const fill = 'white';
  const fillOpacity = 1;
  const strokeDasharray = 0;
  const textX = (props.shape.width + props.shape.deltaWidth) / 2;
  const textY = (props.shape.height + props.shape.deltaHeight) / 2;
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

export default Rect;
