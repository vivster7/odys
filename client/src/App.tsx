import React from 'react';
import { Route, Redirect, BrowserRouter, Switch } from 'react-router-dom';

import {
  configureStore,
  combineReducers,
  StoreEnhancer,
  StoreEnhancerStoreCreator,
  AnyAction,
  createAction,
  Action,
} from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import * as uuid from 'uuid';

import Room from './modules/room/Room';

import drawReducer from './modules/draw/draw.reducer';
import canvasReducer from './modules/canvas/canvas.reducer';

import errorReducer from './modules/errors/errors.reducer';
import roomReducer from './modules/room/room.reducer';
import boardReducer from './modules/board/board.reducer';
import playersReducer from './modules/players/players.reducer';
import { emitEvent } from 'socket/socket';

const rootReducer = combineReducers({
  draw: drawReducer,
  canvas: canvasReducer,
  errors: errorReducer,
  room: roomReducer,
  board: boardReducer,
  players: playersReducer,
});
export type RootState = ReturnType<typeof rootReducer>;

const syncEnhancer: StoreEnhancer = (createStore) => (
  reducer,
  initialState
) => {
  const syncedRootReducer = (state: any, action: any) => {
    const newState = reducer(state, action);
    if (action.type !== 'global/syncState' && newState != state) {
      emitEvent('updatedState', newState);
    }
    return newState;
  };

  return createStore(syncedRootReducer, initialState);
};

export const syncState = createAction<RootState>('global/syncState');

const store = configureStore({
  reducer: rootReducer,
  enhancers: [syncEnhancer],
});

export type OdysDispatch = typeof store.dispatch;

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Switch>
          <Route path="/:id">
            <Room></Room>
          </Route>
          {/* Catchall route */}
          <Route>
            <Redirect to={`/${uuid.v4()}`} />
          </Route>
        </Switch>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
