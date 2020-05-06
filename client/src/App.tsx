import React, { Suspense } from 'react';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import DrawingPage from './pages/DrawingPage';
import Scratch from './pages/Scratch';

import shapesReducer from './reducers/shapes/shape';
import svgReducer from './reducers/svg';

import errorReducer from './reducers/errors';
import {
  RelayEnvironmentProvider,
  preloadQuery,
  usePreloadedQuery,
} from 'react-relay/hooks';
import RelayEnvironment from './RelayEnvironment';
import Users, { RepositoryNameQuery } from './components/Users';
import { UsersQuery } from './components/__generated__/UsersQuery.graphql';

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

const users = preloadQuery<UsersQuery>(
  RelayEnvironment,
  RepositoryNameQuery,
  null as any
);

const App: React.FC = () => {
  return (

    <RelayEnvironmentProvider environment={RelayEnvironment}>
      <Provider store={store}>
        <Suspense fallback={'Loading...'}>
          <Users users={users}></Users>
        </Suspense>
        <DrawingPage></DrawingPage>
        {/* <Scratch></Scratch> */}
      </Provider>
    </RelayEnvironmentProvider>
  );
};

export default App;
