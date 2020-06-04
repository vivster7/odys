import React from 'react';
import Box from 'math/box';

interface SelectBoxProps {
  box: Box;
  fillColor: string;
  strokeColor: string;
}

const SelectBox: React.FC<SelectBoxProps> = (props) => {
  const { box, fillColor, strokeColor } = props;
  const { x, y, width, height } = box;
  const borderWidth = 2;

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fillColor}
      fillOpacity="0.1"
      stroke={strokeColor}
      strokeWidth={borderWidth + 'px'}
    ></rect>
  );
};

export default SelectBox;
