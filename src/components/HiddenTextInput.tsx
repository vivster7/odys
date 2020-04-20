import React, { useEffect, useRef } from 'react';
import { RectProps } from '../shapes/Rect';
import { useDispatch, useSelector } from 'react-redux';
import { selectedShapeEditText } from '../reducers/shapes/shape';
import { RootState } from '../App';

export interface HiddenTextInputProps {
  selectedShape: RectProps;
}

const HiddenTextInput: React.FC<HiddenTextInputProps> = (props) => {
  const dispatch = useDispatch();
  const select = useSelector((state: RootState) => state.shapes.select);

  const inputEl = useRef<HTMLInputElement>(null);

  let inputValue = '';
  if (select && select.isEditing) {
    inputValue = props.selectedShape.text;
  }

  useEffect(() => {
    if (inputEl && inputEl.current) {
      inputEl.current.focus();
    }
  });

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(selectedShapeEditText(event.target.value));
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
