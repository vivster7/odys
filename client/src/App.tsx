import React from 'react';
import { Route, Redirect, BrowserRouter, Switch } from 'react-router-dom';

import {
  configureStore,
  combineReducers,
  StoreEnhancer,
  createAction,
} from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import * as uuid from 'uuid';
import * as jdp from 'jsondiffpatch';

import Room from './modules/room/Room';

import drawReducer from './modules/draw/draw.reducer';
import canvasReducer from './modules/canvas/canvas.reducer';

import errorReducer from './modules/errors/errors.reducer';
import keyboardReducer from './modules/keyboard/keyboard.reducer';
import roomReducer from './modules/room/room.reducer';
import boardReducer from './modules/board/board.reducer';
import playersReducer from './modules/players/players.reducer';
import { emitEvent, SocketEvent } from 'socket/socket';

const rootReducer = combineReducers({
  draw: drawReducer,
  canvas: canvasReducer,
  errors: errorReducer,
  keyboard: keyboardReducer,
  room: roomReducer,
  board: boardReducer,
  players: playersReducer,
});
export type RootState = ReturnType<typeof rootReducer>;

// These bits of state won't be emitted on the socket.
const syncBlacklist = new Set([
  'canvas',
  'errors',
  'room',
  'board',
  // draw
  'editText',
  'drag',
  'resize',
  'newRect',
  'timetravel',
  'copyPaste',
  'players',
  'self',
  // deletes are synced by removing / adding objects
  // ignore this field across clients.
  'isDeleted',
]);

const diffPatch = jdp.create({
  objectHash: (o: any) => o.id,
  propertyFilter: (name: string) => !syncBlacklist.has(name),
});

const syncEnhancer: StoreEnhancer = (createStore) => (
  reducer,
  initialState
) => {
  const syncedRootReducer = (state: any, action: any) => {
    const newState = reducer(state, action) as any;

    if (action.type.startsWith('draw/')) {
      const diff = diffPatch.diff(state, newState);
      if (diff && newState.draw.loaded === 'success') {
        setTimeout(() => emitEvent('updatedState', diff), 0);
      }
    }

    return newState;
  };

  return createStore(syncedRootReducer, initialState);
};

export const syncState = createAction<SocketEvent>('global/syncState');

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
