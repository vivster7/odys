import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, OdysDispatch } from 'App';
import debounce from 'lodash.debounce';
import { editText } from 'modules/draw/draw.reducer';
import { endEditText } from 'modules/draw/mixins/editText/editText.reducer';

const debouncedSave = debounce((dispatch: OdysDispatch, id: string) => {
  dispatch(endEditText(id));
}, 300);

const HiddenTextInput: React.FC = React.memo(() => {
  const dispatch = useDispatch();
  const id = useSelector((state: RootState) => state.draw.select?.id);

  // This selector will refresh this component whenver the resize
  // object changes. This will focus the hidden input.
  // Without this selector, clicking the selection circles causes
  // the hidden input to lose focus and typing won't edit the selected rect.
  useSelector((state: RootState) => state.draw.resize);

  const inputEl = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputEl && inputEl.current) {
      inputEl.current.focus();
      inputEl.current.value = '';
    }
  });

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(editText(event.target.value));
    if (id) debouncedSave(dispatch, id);
  };

  if (!id) return <></>;
  return (
    <>
      <input
        style={{ height: '0px', padding: '0px', border: '0px', opacity: 0 }}
        ref={inputEl}
        type="text"
        onChange={onInputChange}
      />
    </>
  );
});

export default HiddenTextInput;
