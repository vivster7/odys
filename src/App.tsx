import React, { useReducer } from 'react';
import { GlobalStateContext, globalStateReducer } from './globals';
import DrawingPage from './pages/DrawingPage';
import Scratch from './pages/Scratch';

const App: React.FC = () => {
  const initialGlobalState = {
    shapes: [],
    drag: null,
    pan: null,
    resize: null,
    select: null,
    newRectByClick: null,
    newRectByDrag: null,
    svg: {
      topLeftX: 0,
      topLeftY: 0,
      translateX: 0,
      translateY: 0,
      scale: 1,
      zoomLevel: 5
    },
    mouse: {
      x: 0,
      y: 0
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
