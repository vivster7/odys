import React, { useReducer } from 'react';
import { GlobalStateContext, globalStateReducer } from './globals';
import DrawingPage from './pages/DrawingPage';
import Scratch from './pages/Scratch';

const App: React.FC = () => {
  const initialGlobalState = {
    shapes: [],
    dragId: null,
    mouseDown: null,
    svg: {
      topLeftX: 0,
      topLeftY: 0,
      translateX: 0,
      translateY: 0,
      scale: 1
    }
  };

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
