import React from 'react';
import { zoomLeveltoScaleMap } from 'modules/canvas/zoom/zoom.reducer';
import { COLORS } from 'modules/draw/mixins/colors/colors';

export const TEXT_LINE_HEIGHT = 16;

export function getTextBlocks(text: string) {
  return text.split('\n');
}

interface TextBlockProps {
  x: number;
  y: number;
  fontSize: number;
  text: string;
  createdAtZoomLevel: number;
}

const TextBlock: React.FC<TextBlockProps> = (props) => {
  const { x, y, fontSize, text, createdAtZoomLevel } = props;

  const textBlocks = getTextBlocks(text);
  const scale = zoomLeveltoScaleMap[createdAtZoomLevel];

  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      textRendering="optimizeSpeed"
      dominantBaseline="baseline"
      fontSize={fontSize + 'px'}
      fill={COLORS.text}
    >
      {textBlocks.map((text, idx) => {
        return (
          <tspan
            key={idx}
            x={x}
            dy={TEXT_LINE_HEIGHT / scale + 'px'}
            dominantBaseline="middle"
          >
            {text}
          </tspan>
        );
      })}
    </text>
  );
};

export default TextBlock;
