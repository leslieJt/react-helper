/**
 * Created by fed on 2017/8/24.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Router, Route, Switch } from 'rrc-loader-helper/router';
import injectStore from 'rrc-loader-helper/lib/inj-dispatch';

import Nav from './nav/view';
import Login from './login/view';

// alert!! for loader
import Loading from './common/loading.jsx';
import reducers from './index';

const NotFound = () => <h1>404 not found!</h1>;

const NavWrapper = ({ match }) => (
  <Nav>
    <Switch>
      __ROOT_ROUTE__
      <Route path="*" component={NotFound} />
    </Switch>
  </Nav>
);

const Routes = ({ history, store: innerStore }) => {
  injectStore(innerStore);
  return (
    <Router history={history}>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/" component={NavWrapper} />
      </Switch>
    </Router>
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
