import React from 'react';
import { ShapeProps } from '../Shape';
import BaseShape from './BaseShape';

const Text: React.FC<ShapeProps> = (props) => {
  const cursor = props.isDragging ? 'grabbing' : 'grab';
  const fill = 'white';
  const fillOpacity = 0;
  const strokeDasharray = 0;
  const childProps = { ...props, cursor, fill, fillOpacity, strokeDasharray };
  return <BaseShape {...childProps}></BaseShape>;
};

export default Text;
