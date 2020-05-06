import React from 'react';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { ApolloProvider } from '@apollo/react-hooks';
import ApolloClient from 'apollo-boost';

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

const client = new ApolloClient();

export type OdysDispatch = typeof store.dispatch;

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <Users></Users>
        <DrawingPage></DrawingPage>
        {/* <Scratch></Scratch> */}
      </Provider>
    </ApolloProvider>
  );
};

export default App;
