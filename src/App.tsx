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
          display: 'flex',
          flexDirection: 'row',
          height: '100%',
          width: '100%'
        }}
      >
        <div style={{ flex: '75' }}>
          <DrawingBoard></DrawingBoard>
        </div>
        <div style={{ flex: '25' }}>
          <RightSidebar></RightSidebar>
        </div>
      </div>
    </GlobalStateContext.Provider>
  );
};

export default App;
