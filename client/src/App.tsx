import React, { useEffect } from 'react';
import io from 'socket.io-client';

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import DrawingPage from './pages/DrawingPage';
import Scratch from './pages/Scratch';

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

const ENDPOINT = 'http://localhost:3000';

const App: React.FC = () => {
  useEffect(() => {
    const socket = io.connect(ENDPOINT);
    // const socket = io({
    //   transports: ['websocket'],
    // });
    socket.on('connect', () => {
      console.log('connected to server');
    });
    socket.on('message', (data: any) => {
      console.log('from api', data);
    });
  }, []);

  return (
    <Provider store={store}>
      <DrawingPage></DrawingPage>
      {/* <Scratch></Scratch> */}
    </Provider>
  );
};

export default App;
