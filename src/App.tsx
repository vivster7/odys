import React, { useReducer } from 'react';
import { GlobalStateContext, globalStateReducer, GlobalState } from './globals';
import DrawingPage from './pages/DrawingPage';
import Scratch from './pages/Scratch';
import { EmptyAppState } from './data/EmptyAppState';

const App: React.FC = () => {
  const initialGlobalState = EmptyAppState as GlobalState;

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
