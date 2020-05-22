import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, OdysDispatch } from 'App';
import debounce from 'lodash.debounce';
import { editText, startEditText } from 'modules/draw/draw.reducer';
import { endEditText } from 'modules/draw/mixins/editText/editText.reducer';

const debouncedEndEditText = debounce((dispatch: OdysDispatch, id: string) => {
  dispatch(endEditText(id));
}, 300);

const HiddenTextInput: React.FC = React.memo(() => {
  const dispatch = useDispatch();

  // Same as below -- need to keep re-rendering this object on select.
  const select = useSelector((state: RootState) => state.draw.select);

  // This selector will refresh this component whenver the resize
  // object changes. This will focus the hidden input.
  // Without this selector, clicking the selection circles causes
  // the hidden input to lose focus and typing won't edit the selected rect.
  useSelector((state: RootState) => state.draw.resize);

  const inputEl = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (inputEl && inputEl.current) {
      inputEl.current.focus();
      inputEl.current.value = '';
    }
  });

  useEffect(() => {
    if (select) dispatch(startEditText());
  }, [select, dispatch]);

  const onInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(editText(event.target.value));
    if (select) debouncedEndEditText(dispatch, select.id);
  };

  if (!select) return <></>;
  return (
    <>
      <textarea
        onPaste={(e) => e.preventDefault()}
        style={{ height: '0px', padding: '0px', border: '0px', opacity: 0 }}
        ref={inputEl}
        onChange={onInputChange}
      />
    </>
  );
});

export default HiddenTextInput;
