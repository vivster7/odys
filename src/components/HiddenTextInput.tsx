import React, { useEffect, useRef } from 'react';
import { RectProps } from '../shapes/Rect';
import { useDispatch, useSelector } from 'react-redux';
import { selectedShapeEditText, deleteShape } from '../reducers/shapes/shape';
import { RootState } from '../App';

const HiddenTextInput: React.FC = React.memo(() => {
  const dispatch = useDispatch();

  const selectedId = useSelector(
    (state: RootState) => state.shapes.select?.id || ''
  );
  const selectedIsEditing = useSelector(
    (state: RootState) => state.shapes.select?.isEditing
  );
  const selectedShapeText = useSelector(
    (state: RootState) =>
      (state.shapes.data[selectedId] as RectProps | null)?.text
  );

  // add delete key handler
  function onKeyDownHandler(e: KeyboardEvent) {
    if (e.code === 'Backspace' && selectedIsEditing === false) {
      dispatch(deleteShape(selectedId));
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', onKeyDownHandler);
    return () => {
      window.removeEventListener('keydown', onKeyDownHandler);
    };
  });

  const inputEl = useRef<HTMLInputElement>(null);
  const inputValue = selectedShapeText || '';

  useEffect(() => {
    if (inputEl && inputEl.current) {
      inputEl.current.focus();
    }
  });

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(selectedShapeEditText(event.target.value));
  };

  if (!selectedId) return <></>;
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
});

export default HiddenTextInput;
