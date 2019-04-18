import 'babel-polyfill';
import React from 'react';
import {
  createStore, applyMiddleware, compose,
} from 'redux';
import {
  combineReducers2,
} from 'rrc-loader-helper';
import createSagaMiddleware from 'rrc-loader-helper/saga';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import { routerMiddleware } from 'react-router-redux';
import 'shineout/dist/theme.default.css';

import reducers, { rootSaga } from './components/index';
import RootView from './components/root';

import history from './lib/history';


const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  combineReducers2(reducers),
  compose(
    applyMiddleware(sagaMiddleware),
    applyMiddleware(routerMiddleware(history)),
    // redux devtools requires
    // eslint-disable-next-line
    window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__({
      actionsBlacklist: ['@@INNER'],
    }) : f => f,
  ),
);

sagaMiddleware.run(rootSaga);

render(
  <Provider store={store}>
    <RootView history={history} store={store} />
  </Provider>,
  document.getElementById('container'),
);
