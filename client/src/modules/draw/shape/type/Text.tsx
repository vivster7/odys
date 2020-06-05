import React from 'react';
import { ShapeTypeProps } from '../Shape';
import BaseShape from './BaseShape';

const Text: React.FC<ShapeTypeProps> = (props) => {
  const cursor = props.isDragging ? 'grabbing' : 'grab';
  const fill = 'white';
  const fillOpacity = 0;
  const strokeColor = 'none';
  const strokeDasharray = 0;
  const alignText = 'center';
  const childProps = {
    ...props,
    cursor,
    fill,
    fillOpacity,
    strokeColor,
    strokeDasharray,
    alignText,
  };
  return <BaseShape {...childProps}></BaseShape>;
};

export default Text;
