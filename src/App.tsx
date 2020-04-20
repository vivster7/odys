import React from 'react';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import DrawingPage from './pages/DrawingPage';
import Scratch from './pages/Scratch';

import shapesReducer from './reducers/shapes/shape';

const rootReducer = combineReducers({
  shapes: shapesReducer,
});
export type RootState = ReturnType<typeof rootReducer>;

const store = configureStore({
  reducer: rootReducer,
});

export type OdysDispatch = typeof store.dispatch;

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <DrawingPage></DrawingPage>
      {/* <Scratch></Scratch> */}
    </Provider>
  );
};

export default App;
