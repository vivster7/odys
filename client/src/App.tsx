import React from 'react';
import { Route, Redirect, BrowserRouter, Switch } from 'react-router-dom';

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { v4 } from 'uuid';

import Room from './modules/room/Room';

import drawReducer from './modules/draw/draw.reducer';
import svgReducer from './modules/svg/svg.reducer';

import errorReducer from './modules/errors/errors.reducer';
import socket from './socket/socket';

const rootReducer = combineReducers({
  draw: drawReducer,
  svg: svgReducer,
  errors: errorReducer,
});
export type RootState = ReturnType<typeof rootReducer>;

const store = configureStore({
  reducer: rootReducer,
});

export type OdysDispatch = typeof store.dispatch;

const App: React.FC = () => {
  socket.emit('client connected');

  socket.on('other client connect', (data: any) => {
    console.log(`welcome friend: ${data.id}`);
  });

  return (
    <Provider store={store}>
      <BrowserRouter>
        <Switch>
          <Route path="/:id">
            <Room></Room>
          </Route>
          {/* Catchall route */}
          <Route>
            <Redirect to={`/${v4()}`} />
          </Route>
        </Switch>
      </BrowserRouter>
      {/* <Scratch></Scratch> */}
    </Provider>
  );
};

export default App;
