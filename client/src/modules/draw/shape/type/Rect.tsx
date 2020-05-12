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
  const childProps = { ...props, cursor, fill, fillOpacity, strokeDasharray };
  return <BaseShape {...childProps}></BaseShape>;
};

export default Rect;
