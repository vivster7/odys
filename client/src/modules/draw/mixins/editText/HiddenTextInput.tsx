import React, { useState, useLayoutEffect, useEffect } from 'react';
import { useSelector } from 'global/redux';
import { COLORS } from 'global/colors';
import { OdysDispatch } from 'App';
import { editText, endEditText } from './editText.reducer';
import debounce from 'lodash.debounce';
import { useDispatch } from 'react-redux';

import { Editor, EditorState, ContentState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { setCursorOver } from 'modules/canvas/canvas.reducer';

interface HiddenTextInputProps {
  topLeftX: number;
  topLeftY: number;
  scale: number;
}

const save = (dispatch: OdysDispatch, id: string, text: string) => {
  dispatch(editText({ id, text }));
};

const debouncedSave = debounce(save, 150, { leading: true });

const HiddenTextInput: React.FC<HiddenTextInputProps> = React.memo((props) => {
  const id = useSelector((s) => s.draw.editText?.id);
  const shape = useSelector((s) => id && s.draw.shapes[id]);
  const { topLeftX, topLeftY, scale } = props;

  if (!id || !shape) return <></>;

  const justifyContent = shape.type === 'text' ? 'start' : 'center';
  const alignItems = shape.type === 'rect' ? 'center' : 'start';

  const screenX = (shape?.x + shape?.translateX) * scale + topLeftX;
  const screenY = (shape?.y + shape?.translateY) * scale + topLeftY;
  const screenWidth = shape?.width * scale;
  const screenHeight = shape?.height * scale;
  const screenFontSize = 14 * scale;
  const screenPaddingHeight = 10 * scale;
  const screenPaddingWidth = 20 * scale;

  return (
    <div
      style={{
        position: 'absolute',
        transform: `translate(${screenX}px, ${screenY}px)`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          position: 'relative',
          width: `${screenWidth - screenPaddingWidth * 2}px`,
          height: `${screenHeight - screenPaddingHeight * 2}px`,
          fontSize: `${screenFontSize}px`,
          alignItems: `${alignItems}`,
          justifyContent: `${justifyContent}`,
          padding: `${screenPaddingHeight}px ${screenPaddingWidth}px`,
        }}
      >
        <OdysEditor
          id={id}
          type={shape.type}
          initialText={shape.text}
        ></OdysEditor>
      </div>
    </div>
  );
});

interface OdysEditorProps {
  id: string;
  type: string;
  initialText: string;
}

// React.memo ensure's component only renders when `id` changes (ignores initialText)
const OdysEditor: React.FC<OdysEditorProps> = React.memo(
  (props) => {
    const dispatch = useDispatch();
    const { id, type, initialText } = props;

    const textAlignment = type === 'text' ? 'left' : 'center';

    const [editorState, setEditorState] = useState(
      EditorState.set(EditorState.createEmpty(), { allowUndo: false })
    );
    const [isInitialized, setIsInitizalied] = useState(false);

    const editor = React.useRef<Editor | null>(null);

    function focusEditor() {
      if (editor.current) editor.current.focus();
    }

    useLayoutEffect(() => {
      focusEditor();
      setEditorState((s) =>
        EditorState.set(s, {
          currentContent: ContentState.createFromText(initialText),
        })
      );
      setEditorState((s) => EditorState.moveFocusToEnd(s));
      setIsInitizalied(true);
      // cleanup fires when component unmounts or re-renders with new id.
      return () => {
        debouncedSave.flush();
        dispatch(endEditText(id));
      };
    }, [dispatch, id, initialText]);

    useEffect(() => {
      dispatch(setCursorOver({ type: type as any, id }));
    }, [dispatch, id, type]);

    function onChange(state: EditorState) {
      if (!isInitialized) return;
      setEditorState(state);
      debouncedSave(dispatch, id, state.getCurrentContent().getPlainText());
    }

    return (
      <div
        style={{
          pointerEvents: 'all',
          position: 'relative',
          height: 'max-content',
          width: 'max-content',
          minWidth: '5px',
          maxWidth: '100%',
          maxHeight: '100%',
          overflowY: 'hidden',
          overflowX: 'hidden',
          color: COLORS.text,
          lineHeight: '1.25em',
        }}
      >
        <Editor
          ref={editor}
          editorState={editorState}
          textAlignment={textAlignment}
          onChange={(editorState) => onChange(editorState)}
        />
      </div>
    );
  },
  (prev, next) => prev.id === next.id
);

export default HiddenTextInput;
