import React, { useEffect, useRef, useContext } from 'react';
import Editor from '@monaco-editor/react';
import { monaco as Mo } from '@monaco-editor/react';
import tokensProvider from '../ulys/TokensProvider';
import debounce from 'lodash.debounce';
import { GlobalStateContext } from '../globals';

type ITextModel = monaco.editor.ITextModel;
type ICodeEditor = monaco.editor.ICodeEditor;
type IModelContentChangedEvent = monaco.editor.IModelContentChangedEvent;

const ULYS_LANGUAGE_ID = 'ulys';
const DEBOUNCE_TIME_MS = 300;

const OdysEditor: React.FC = () => {
  const { dispatch } = useContext(GlobalStateContext);
  let M = useRef<any>(null);

  useEffect(() => {
    function setupMonaco(monaco: any) {
      M.current = monaco;

      if (process.env.NODE_ENV === 'development') {
        (window as any).M = monaco;
      }
      monaco.languages.register({ id: ULYS_LANGUAGE_ID });
      monaco.languages.setMonarchTokensProvider(
        ULYS_LANGUAGE_ID,
        tokensProvider
      );
      monaco.editor.onDidCreateModel((model: ITextModel) => {
        monaco.editor.setModelLanguage(model, ULYS_LANGUAGE_ID);
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
    const debouncedSaveCode = debounce(saveCode, DEBOUNCE_TIME_MS);

    editor.onDidChangeModelContent((e: IModelContentChangedEvent) => {
      if (!M.current) {
        return;
      }

      debouncedSaveCode(editor.getValue());
    });
  }

  function saveCode(code: string) {
    return dispatch({ type: 'ODYS_UPDATE_CODE', code: code });
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
