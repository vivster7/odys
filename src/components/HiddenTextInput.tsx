import React, { useContext, useEffect, useRef } from 'react';
import { GlobalStateContext } from '../globals';
import { RectProps } from '../shapes/Rect';

export interface HiddenTextInputProps {
  selectedShape: RectProps;
}

const HiddenTextInput: React.FC<HiddenTextInputProps> = props => {
  const { globalState, dispatch } = useContext(GlobalStateContext);

  const inputEl = useRef<HTMLInputElement>(null);

  let inputValue = '';
  if (globalState.select && globalState.select.isEditing) {
    inputValue = props.selectedShape.text;
  }

  useEffect(() => {
    if (inputEl && inputEl.current) {
      inputEl.current.focus();
    }
  });

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'ODYS_SELECTED_SHAPE_EDIT_TEXT_ACTION',
      text: event.target.value
    });
  };

  return (
    <>
      <input
        style={{ height: '0px', padding: '0px', border: '0px', opacity: 0 }}
        ref={inputEl}
        type="text"
        onChange={onInputChange}
        value={inputValue}
      />
    </>
  );
};

export default HiddenTextInput;
