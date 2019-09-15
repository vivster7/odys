import React, { useReducer } from 'react';
import DrawingBoard from './DrawingBoard';
import RightSidebar from './RightSidebar';
import { GlobalStateContext, globalStateReducer } from './globals';

const App: React.FC = () => {
  const initialGlobalState = { shapes: [] };

  const [globalState, dispatch] = useReducer(
    globalStateReducer,
    initialGlobalState
  );

  return (
    <GlobalStateContext.Provider value={{ globalState, dispatch }}>
      <div
        style={{
          height: '100%',
          width: '100%'
        }}
        className="row"
      >
        <div className="flex-elem-6">
          <DrawingBoard></DrawingBoard>
        </div>
        <div className="col flex-elem-4">
          <RightSidebar></RightSidebar>
        </div>
      </div>
    </GlobalStateContext.Provider>
  );
};

export default App;
