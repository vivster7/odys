import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { COLORS } from 'global/colors';
import { isEmpty } from 'lodash';
import { useSelector } from 'global/redux';

import { startEditText, cancelSelect } from 'modules/draw/draw.reducer';
import { endEditText } from 'modules/draw/mixins/editText/editText.reducer';

const DEFAULT_PLACEHOLDER_TEXT = 'Click to edit text';

interface TextBlockProps {
  id: string;
  // x: number;
  // y: number;
  width: number;
  height: number;
  text: string;
  createdAtZoomLevel: number;
  isSelected: boolean;
  alignText: string;
  placeholderText?: string;
}

const TextBlock: React.FC<TextBlockProps> = (props) => {
  const dispatch = useDispatch();
  const { isEditing } = useSelector((s) => s.draw.editText);

  const {
    id,
    width,
    height,
    text,
    placeholderText = DEFAULT_PLACEHOLDER_TEXT,
    alignText,
    isSelected,
  } = props;

  const usePlaceholder = isSelected && isEmpty(text) && !isEditing;

  /**
    lifecycle:
    - click on contenteditable div
    - `handleClick()` dispatches `startEditText` action, setting `isEditing` to true
    - this hook focuses the div element
    - `onFocus()` then runs and executes a `selectAll` command for the contentEditable div
  */
  const inputEl = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (inputEl?.current && isEditing && isSelected) {
      inputEl.current.focus();
    }
  }, [isEditing, isSelected]);

  const prevSelected = useRef(isSelected);
  useEffect(() => {
    /**
      end text editing if selection changed from this drawing to another
    */
    if (prevSelected.current && !isSelected && isEditing) {
      if (inputEl?.current) {
        dispatch(
          endEditText({
            id,
            text: inputEl.current.innerText,
          })
        );
      }
    }
    prevSelected.current = isSelected;
  }, [dispatch, id, isEditing, isSelected, prevSelected]);

  /**
    add global click listener only if current text block is selected and in edit mode.
    this listens for click events from resize / drag actions on this object.
  */
  useEffect(() => {
    if (!isEditing || !isSelected) return;

    const clickHandler = () => {
      if (inputEl?.current) {
        dispatch(
          endEditText({
            id,
            text: inputEl.current.innerText,
          })
        );
      }
    };

    window.addEventListener('click', clickHandler);
    return () => {
      window.removeEventListener('click', clickHandler);
    };
  }, [dispatch, id, isEditing, isSelected]);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isSelected && isEditing) {
      if (inputEl?.current) {
        dispatch(
          endEditText({
            id,
            text: inputEl.current.innerText,
          })
        );
      }
      dispatch(cancelSelect());
    }
  };

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isEditing) {
      dispatch(startEditText());
    }
  };

  const onFocus = () => {
    if (isEditing && !isEmpty(text)) {
      document.execCommand('selectAll', false);
    }
  };

  return (
    <foreignObject width={width} height={height}>
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
          contentEditable={isSelected && isEditing}
          suppressContentEditableWarning
          style={{
            color: usePlaceholder ? COLORS.placeholderText : COLORS.text,
            fontSize: usePlaceholder ? '12px' : '14px',
            textAlign: 'center',
            lineHeight: '1.25rem',
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
          ref={inputEl}
          onKeyDown={handleKeyPress}
          onClick={handleClick}
          onFocus={onFocus}
        >
          {usePlaceholder ? placeholderText : text}
        </div>
      </div>
    </foreignObject>
  );
};

export default TextBlock;
