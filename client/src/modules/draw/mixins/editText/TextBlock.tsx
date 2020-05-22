import React from 'react';
import { zoomLeveltoScaleMap } from 'modules/canvas/zoom/zoom.reducer';
import { COLORS } from 'global/colors';
import { isEmpty } from 'lodash';

export const TEXT_LINE_HEIGHT = 16;
const PLACEHOLDER_TEXT = 'Type to enter text';

export function getTextBlocks(text: string) {
  return text.split('\n');
}

interface TextBlockProps {
  x: number;
  y: number;
  fontSize: number;
  text: string;
  createdAtZoomLevel: number;
  isSelected: boolean;
}

const TextBlock: React.FC<TextBlockProps> = (props) => {
  const { x, y, fontSize, text, createdAtZoomLevel, isSelected } = props;

  const usePlaceholder = isSelected && isEmpty(text);
  const textBlocks = getTextBlocks(text);
  const scale = zoomLeveltoScaleMap[createdAtZoomLevel];
  const dy = TEXT_LINE_HEIGHT / scale;

  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      textRendering="optimizeSpeed"
      dominantBaseline="baseline"
      fontSize={fontSize + 'px'}
      fill={usePlaceholder ? COLORS.placeholderText : COLORS.text}
    >
      {usePlaceholder ? (
        <tspan key="placeholder" x={x} dy={dy + 'px'} dominantBaseline="middle">
          {PLACEHOLDER_TEXT}
        </tspan>
      ) : (
        textBlocks.map((text, idx) => {
          return (
            <tspan key={idx} x={x} dy={dy + 'px'} dominantBaseline="middle">
              {text}
            </tspan>
          );
        })
      )}
    </text>
  );
};

export default TextBlock;
