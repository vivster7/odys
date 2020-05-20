import React from 'react';
import { ShapeTypeProps } from '../Shape';
import BaseShape from './BaseShape';
import { COLORS } from 'modules/draw/mixins/colors/colors';
import { Shape } from '../shape.reducer';
import { zoomLeveltoScaleMap } from 'modules/canvas/zoom/zoom.reducer';
import {
  TEXT_LINE_HEIGHT,
  getTextBlocks,
} from 'modules/draw/mixins/editText/TextBlock';

export const RECT_WIDTH = 150;
export const RECT_HEIGHT = 75;

function computeTextYPosition(shape: Shape): number {
  const scaledLineHeight =
    TEXT_LINE_HEIGHT / zoomLeveltoScaleMap[shape.createdAtZoomLevel];
  const startPosition =
    (shape.height + shape.deltaHeight) / 2 - scaledLineHeight;
  const numLines = getTextBlocks(shape.text).length;

  const computedTextY = startPosition - (scaledLineHeight / 2) * (numLines - 1);
  return computedTextY < 0 ? 0 : computedTextY;
}

const Rect: React.FC<ShapeTypeProps> = (props) => {
  const cursor = props.isDragging ? 'grabbing' : 'grab';
  const fill = COLORS.rectBg;
  const fillOpacity = 1;
  const strokeColor = COLORS.rectDefault;
  const strokeDasharray = 0;
  const textX = (props.shape.width + props.shape.deltaWidth) / 2;
  const textY = computeTextYPosition(props.shape);
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
