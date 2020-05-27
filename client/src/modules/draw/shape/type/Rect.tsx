import React from 'react';
import { ShapeTypeProps } from '../Shape';
import BaseShape from './BaseShape';
import { COLORS } from 'global/colors';
import { Shape } from '../shape.reducer';
import {
  TEXT_LINE_HEIGHT,
  getTextBlocks,
} from 'modules/draw/mixins/editText/TextBlock';

export const RECT_WIDTH = 150;
export const RECT_HEIGHT = 75;

function computeTextYPosition(shape: Shape): number {
  const scaledLineHeight = TEXT_LINE_HEIGHT;
  const startPosition =
    (shape.height + shape.deltaHeight) / 2 - scaledLineHeight;
  const numLines = getTextBlocks(shape.text).length;

  const computedTextY = startPosition - (scaledLineHeight / 2) * (numLines - 1);
  return computedTextY < 0 ? 0 : computedTextY;
}

const Rect: React.FC<ShapeTypeProps> = (props) => {
  const { isSelected, isDragging, shape } = props;
  const cursor = isSelected ? (isDragging ? 'grabbing' : 'grab') : 'pointer';
  const fill = COLORS.rectBg;
  const fillOpacity = 1;
  const strokeColor = COLORS.rectDefault;
  const strokeDasharray = 0;
  const textX = (shape.width + shape.deltaWidth) / 2;
  const textY = computeTextYPosition(shape);
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
