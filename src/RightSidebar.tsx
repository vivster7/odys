import React from 'react';
import Editor from '@monaco-editor/react';
import { monaco as Mo } from '@monaco-editor/react';

type ICodeEditor = monaco.editor.ICodeEditor;
type IModelContentChangedEvent = monaco.editor.IModelContentChangedEvent;

const RightSidebar: React.FC = () => {
  let M: any;
  async function initMonaco() {
    try {
      M = (await Mo.init()) as monaco.Position;
    } catch (err) {
      console.error('An error occurred during initialization of Monaco: ', err);
    }
  }
  initMonaco();

  function handleEditorDidMount(
    valueGetter: () => string,
    editor: ICodeEditor
  ) {
    editor.focus();
    listenEditorChagnes(editor);
    setCursor(editor, 2);
  }

  function listenEditorChagnes(editor: ICodeEditor) {
    editor.onDidChangeModelContent((e: IModelContentChangedEvent) => {
      console.log(editor.getValue());
    });
  }

  function setCursor(editor: ICodeEditor, lineNumber: number) {
    if (!M) {
      console.warn('Monaco instance not yet initialized');
      return;
    }

    const position = new M.Position(lineNumber, 0);
    editor.setPosition(position as monaco.Position);
  }

  return (
    <div className="flex-elem" style={{ cursor: 'text' }}>
      <Editor
        theme="dark"
        height="100vh"
        options={{ minimap: { enabled: false } }}
        value={'// Write Code; Draw Blocks\n'}
        editorDidMount={handleEditorDidMount}
        language="javascript"
      />
    </div>
  );
};

export default RightSidebar;
