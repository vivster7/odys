import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { monaco as Mo } from '@monaco-editor/react';
import tokensProvider from '../box-lang';

type ITextModel = monaco.editor.ITextModel;
type ICodeEditor = monaco.editor.ICodeEditor;
type IModelContentChangedEvent = monaco.editor.IModelContentChangedEvent;

const BOX_LANGUAGE_ID = 'box';

const OdysEditor: React.FC = () => {
  let M = useRef<any>(null);

  useEffect(() => {
    function setupMonaco(monaco: any) {
      M.current = monaco;

      if (process.env.NODE_ENV === 'development') {
        (window as any).M = monaco;
      }
      monaco.languages.register({ id: BOX_LANGUAGE_ID });
      monaco.languages.setMonarchTokensProvider(
        BOX_LANGUAGE_ID,
        tokensProvider
      );
      monaco.editor.onDidCreateModel((model: ITextModel) => {
        monaco.editor.setModelLanguage(model, BOX_LANGUAGE_ID);
      });
    }

    Mo.init()
      .then(m => setupMonaco(m))
      .catch(err =>
        console.error(
          'An error occurred during initialization of Monaco: ',
          err
        )
      );
  }, []);

  function handleEditorDidMount(
    _valueGetter: () => string,
    editor: ICodeEditor
  ) {
    editor.focus();
    listenEditorChanges(editor);
    setCursor(editor, 2);
  }

  function listenEditorChanges(editor: ICodeEditor) {
    editor.onDidChangeModelContent((e: IModelContentChangedEvent) => {
      if (!M.current) {
        return
      }

      const tokens = M.current.editor.tokenize(editor.getValue(), BOX_LANGUAGE_ID);
      console.log(tokens);
    });
  }

  function setCursor(editor: ICodeEditor, lineNumber: number) {
    if (!M.current) {
      console.warn('Monaco instance not yet initialized');
      return;
    }

    const position = new M.current.Position(lineNumber, 0);
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

export default OdysEditor;
