import React, { useReducer } from 'react';
import { GlobalStateContext, globalStateReducer } from './globals';
import DrawingPage from './pages/DrawingPage';

const App: React.FC = () => {
  const initialGlobalState = { shapes: [] };

  const [globalState, dispatch] = useReducer(
    globalStateReducer,
    initialGlobalState
  );

  return (
    <GlobalStateContext.Provider value={{ globalState, dispatch }}>
      <DrawingPage></DrawingPage>
    </GlobalStateContext.Provider>
  );
};

export default App;
