import React, { useRef } from 'react';
import { Editor, EditorState } from 'draft-js';
import 'draft-js/dist/Draft.css';

const RightSidebar: React.FC = () => {
  const [editorState, setEditorState] = React.useState(
    EditorState.createEmpty()
  );

  const editorRef = useRef<Editor>(null);

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
      style={{ cursor: 'text' }}
      onClick={() => focusEditor()}
    >
      <Editor
        editorState={editorState}
        onChange={setEditorState}
        placeholder="Enter some text..."
        ref={editorRef}
      />
    </div>
  );
};

export default RightSidebar;
