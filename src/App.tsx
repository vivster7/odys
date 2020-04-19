import React, { useReducer } from 'react';
import { GlobalStateContext, globalStateReducer, GlobalState } from './globals';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import DrawingPage from './pages/DrawingPage';
import Scratch from './pages/Scratch';

import { EmptyAppState } from './data/EmptyAppState';
import shapesReducer from './reducers/shape';

const rootReducer = combineReducers({
  shapes: shapesReducer,
});
export type RootState = ReturnType<typeof rootReducer>;

const store = configureStore({
  reducer: rootReducer,
});

export type OdysDispatch = typeof store.dispatch;

const App: React.FC = () => {
  const initialGlobalState = EmptyAppState as GlobalState;

  const [globalState, dispatch] = useReducer(
    globalStateReducer,
    initialGlobalState
  );

  return (
    <Provider store={store}>
      <GlobalStateContext.Provider value={{ globalState, dispatch }}>
        <DrawingPage></DrawingPage>
        {/* <Scratch></Scratch> */}
      </GlobalStateContext.Provider>
    </Provider>
  );
};

export default App;
