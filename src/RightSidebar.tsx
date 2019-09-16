import React, { useRef } from 'react';
import {
  Editor,
  EditorState,
  ContentBlock,
  ContentState,
  DraftBlockType
} from 'draft-js';
import 'draft-js/dist/Draft.css';
import './RightSidebar.css';

// const EditorLine: React.FC<DraftBlockType>

const RightSidebar: React.FC = () => {
  const [editorState, setEditorState] = React.useState(
    EditorState.moveFocusToEnd(
      EditorState.createWithContent(
        ContentState.createFromText('## Write Code; Draw Blocks\n\n')
      )
    )
  );

  const editorRef = useRef<Editor>(null);

  function myBlockStyleFn(contentBlock: ContentBlock): string {
    const type = contentBlock.getType();
    switch (type) {
      case 'unstyled':
        return 'unstyled-code-text';
      default:
        return 'unstyled-code-text';
    }
  }

  function focusEditor() {
    if (editorRef && editorRef.current) {
      editorRef.current.focus();
    }
  }

  React.useEffect(() => {
    focusEditor();
  }, []);

  return (
    <div
      className="flex-elem"
      style={{ cursor: 'text', background: 'var(--odys-code-background)' }}
      onClick={() => focusEditor()}
    >
      <Editor
        editorState={editorState}
        onChange={setEditorState}
        blockStyleFn={myBlockStyleFn}
        ref={editorRef}
      />
    </div>
  );
};

export default RightSidebar;
