import React from 'react';
import { useDispatch } from 'react-redux';
import { COLORS } from 'global/colors';

import { startEditText } from 'modules/draw/draw.reducer';

interface TextBlockProps {
  id: string;
  width: number;
  height: number;
  text: string;
  isSelected: boolean;
  isEditing: boolean;
  alignText: string;
}

const TextBlock: React.FC<TextBlockProps> = (props) => {
  const dispatch = useDispatch();

  const { id, width, height, text, alignText, isSelected, isEditing } = props;

  function onClick(e: React.MouseEvent) {
    dispatch(startEditText(id));
  }

  return (
    <foreignObject
      visibility={isEditing ? 'hidden' : 'visible'}
      width={width}
      height={height}
      pointerEvents="none"
    >
      <div
        style={{
          display: 'flex',
          height: 'calc(100% - 20px)',
          position: 'relative',
          alignItems: alignText,
          justifyContent: 'center',
          padding: '10px 20px',
        }}
      >
        <div
          onClick={(e) => onClick(e)}
          style={{
            pointerEvents: 'all',
            color: COLORS.text,
            fontSize: '14px',
            textAlign: 'center',
            lineHeight: '1.25em',
            whiteSpace: 'pre-line',
            wordBreak: 'break-word',
            height: 'max-content',
            width: 'max-content',
            minWidth: '5px',
            maxWidth: '100%',
            maxHeight: '100%',
            overflowY: 'hidden',
            overflowX: 'hidden',
            position: 'relative',
            cursor: isSelected ? 'text' : 'pointer',
          }}
        >
          {text}
        </div>
      </div>
    </foreignObject>
  );
};

export default TextBlock;
