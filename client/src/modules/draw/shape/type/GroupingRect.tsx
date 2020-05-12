import React from 'react';
import { ShapeProps } from '../Shape';
import BaseShape from './BaseShape';

const GroupingRect: React.FC<ShapeProps> = (props) => {
  const { isSelected, isDragging } = props;
  const cursor = isSelected ? (isDragging ? 'grabbing' : 'grab') : 'auto';
  const fill = 'darkgray';
  const fillOpacity = 0.2;
  const strokeDasharray = 3;
  const childProps = { ...props, cursor, fill, fillOpacity, strokeDasharray };
  return <BaseShape {...childProps}></BaseShape>;
};

export default GroupingRect;
