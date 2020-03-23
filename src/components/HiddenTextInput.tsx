import React, { useContext, useEffect, useRef } from 'react';
import { GlobalStateContext } from '../globals';
import { RectProps } from '../shapes/Rect';

const HiddenTextInput: React.FC = props => {
  const { globalState, dispatch } = useContext(GlobalStateContext);

  const inputEl = useRef<HTMLInputElement>(null);

  let selectedShape;
  if (globalState.select) {
    const selectedId = globalState.select.id;
    const idx = globalState.shapes.findIndex(s => s.id === selectedId);
    selectedShape = globalState.shapes[idx] as RectProps;
  }

  useEffect(() => {
    if (inputEl && inputEl.current) {
      inputEl.current.focus();
    }
  });

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'ODYS_SELECTED_SHAPE_INPUT_CHANGE_ACTION',
      text: event.target.value
    });
  };

  return (
    <>
      {selectedShape && (
        <input ref={inputEl} type="text" onChange={onInputChange} />
      )}
    </>
  );
};

export default HiddenTextInput;
