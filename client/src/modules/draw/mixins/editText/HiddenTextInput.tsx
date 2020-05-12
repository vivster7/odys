import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editText, deleteDrawing } from '../../draw.reducer';
import { RootState, OdysDispatch } from '../../../../App';

// add delete key handler
function onKeyDownHandler(
  dispatch: OdysDispatch,
  id: string,
  isEditing: boolean
) {
  return (e: KeyboardEvent) => {
    if (e.code === 'Backspace' && isEditing === false) {
      dispatch(deleteDrawing(id));
    }
  };
}

const HiddenTextInput: React.FC = React.memo(() => {
  const dispatch = useDispatch();

  const select = useSelector((state: RootState) => state.draw.select);

  const id = select?.id;
  const isEditing = select?.isEditing;

  // This selector will refresh this component whenver the
  // selected drawing changes (e.g. resize). This should trigger
  // focus onto this hidden input.
  const drawing = useSelector(
    (state: RootState) => id && (state.draw.shapes[id] ?? state.draw.arrows[id])
  );

  useEffect(() => {
    if (id === undefined || isEditing === undefined) return;
    const handler = onKeyDownHandler(dispatch, id, isEditing);
    window.addEventListener('keydown', handler, { capture: true });
    return () => {
      window.removeEventListener('keydown', handler, { capture: true });
    };
  });

  const inputEl = useRef<HTMLInputElement>(null);
  const text = !!drawing ? drawing.text : '';
  const inputValue = !!isEditing && text ? text : '';
  useEffect(() => {
    if (inputEl && inputEl.current) {
      inputEl.current.focus();
    }
  });

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(editText(event.target.value));
  };

  if (!id) return <></>;
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
