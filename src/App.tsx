import React, { useReducer } from 'react';
import { GlobalStateContext, globalStateReducer } from './globals';
import DrawingPage from './pages/DrawingPage';
import Scratch from './pages/Scratch';

const App: React.FC = () => {
  const initialGlobalState = { shapes: [], dragId: null };

  const [globalState, dispatch] = useReducer(
    globalStateReducer,
    initialGlobalState
  );

  return (
    <GlobalStateContext.Provider value={{ globalState, dispatch }}>
      <DrawingPage></DrawingPage>
      {/* <Scratch></Scratch> */}
    </GlobalStateContext.Provider>
  );
};

export default App;
