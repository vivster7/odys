import React, { useContext, useEffect, useRef } from 'react';
import { GlobalStateContext } from '../globals';

export interface HiddenTextInputProps {
  name: string;
  value: string;
}

const HiddenTextInput: React.FC<HiddenTextInputProps> = props => {
  const { dispatch } = useContext(GlobalStateContext);
  const { name, value } = props;
  const inputEl = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputEl && inputEl.current) {
      inputEl.current.focus();
    }
  });

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'ODYS_SELECTED_SHAPE_INPUT_CHANGE_ACTION',
      id: name,
      text: event.target.value
    });
  };

  return (
    <>
      <input
        ref={inputEl}
        type="text"
        name={name}
        value={value}
        onChange={onInputChange}
      />
    </>
  );
};

export default HiddenTextInput;
