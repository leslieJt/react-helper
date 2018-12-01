/**
 * Created by fed on 2017/8/24.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { ConnectedRouter } from 'react-router-redux';
import { Route, Switch } from 'react-router-dom';
import injectStore from 'rrc-loader-helper/lib/inj-dispatch';

import Nav from './nav/view.jsx';
import Login from './login/view.jsx';

// alert!! for loader
import Loading from './common/loading.jsx';
import reducers from './index';


const NavWrapper = ({ match }) => (
  <Nav>
    <Switch>
      __ROOT_ROUTE__
    </Switch>
  </Nav>
);

const Routes = ({ history, store: innerStore }) => {
  injectStore(innerStore);
  return (
    <ConnectedRouter history={history}>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/" component={NavWrapper} />
      </Switch>
    </ConnectedRouter>
  );
};

Routes.propTypes = {
  history: PropTypes.shape().isRequired,
  store: PropTypes.shape({
    getState: PropTypes.func,
    dispatch: PropTypes.func,
    replaceState: PropTypes.func,
  }).isRequired,
};

export default Routes;
