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
  useSelector((state: RootState) => state.draw.select?.isEditing);

  // This selector will refresh this component whenver the
  // selected drawing changes (e.g. resize). This should trigger
  // focus onto this hidden input.

  // Selecting on these fields only, rather than the whole drawing object, prevents re-rendering
  // as `onInputChange` updates `text` and triggers the input to re-render
  // TODO: trigger focus on keydown rather than checking on these fields
  const height = useSelector((state: RootState) =>
    id ? state.draw.shapes[id]?.height : null
  );
  const width = useSelector((state: RootState) =>
    id ? state.draw.shapes[id]?.width : null
  );
  const x = useSelector((state: RootState) =>
    id ? state.draw.shapes[id]?.x : null
  );
  const y = useSelector((state: RootState) =>
    id ? state.draw.shapes[id]?.y : null
  );

  const inputEl = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputEl && inputEl.current) {
      inputEl.current.focus();
      inputEl.current.value = '';
    }
  }, [id, height, width, x, y]);

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
