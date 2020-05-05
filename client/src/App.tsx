import React from 'react';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import DrawingPage from './pages/DrawingPage';
import Scratch from './pages/Scratch';

import Users from './components/Users';

import shapesReducer from './reducers/shapes/shape';
import svgReducer from './reducers/svg';

import errorReducer from './reducers/errors';

const rootReducer = combineReducers({
  shapes: shapesReducer,
  svg: svgReducer,
  errors: errorReducer,
});
export type RootState = ReturnType<typeof rootReducer>;

const store = configureStore({
  reducer: rootReducer,
});

export type OdysDispatch = typeof store.dispatch;

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Users></Users>
      <DrawingPage></DrawingPage>
      {/* <Scratch></Scratch> */}
    </Provider>
  );
};

export default App;