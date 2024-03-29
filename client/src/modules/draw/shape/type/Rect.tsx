import React from 'react';
import { ShapeTypeProps } from '../Shape';
import BaseShape from './BaseShape';
import { COLORS } from 'global/colors';

const Rect: React.FC<ShapeTypeProps> = (props) => {
  const { isSelected, isDragging } = props;
  const cursor = isSelected ? (isDragging ? 'grabbing' : 'grab') : 'pointer';
  const fill = COLORS.rectBg;
  const fillOpacity = 1;
  const strokeColor = COLORS.rectDefault;
  const strokeDasharray = 0;
  const justifyContent = 'center';
  const alignItems = 'center';
  const textAlign = 'center' as const;
  const childProps = {
    ...props,
    cursor,
    fill,
    fillOpacity,
    strokeColor,
    strokeDasharray,
    justifyContent,
    alignItems,
    textAlign,
  };
  return <BaseShape {...childProps}></BaseShape>;
};

export default Rect;
