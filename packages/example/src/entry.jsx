import React from 'react';
import {
  createStore, applyMiddleware, combineReducers, compose,
} from 'redux';
import createSagaMiddleware from 'redux-saga';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import { routerMiddleware } from 'react-router-redux';

import reducers, { rootSaga } from './components/index';
import RootView from './components/root';

import history from './lib/history';

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  combineReducers(reducers),
  compose(
    applyMiddleware(sagaMiddleware),
    applyMiddleware(routerMiddleware(history)),
    window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f,
  ),
);

sagaMiddleware.run(rootSaga);

render(
  <Provider store={store}>
    <RootView history={history} store={store} />
  </Provider>,
  document.getElementById('container'),
);
