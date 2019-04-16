import React from 'react';
import PropTypes from 'prop-types';
import warning from 'tiny-warning';

import RouterContext from './router-context';

/**
 * The public API for putting history on context.
 */
class Router extends React.Component {
  static computeRootMatch(pathname) {
    return {
      path: '/', url: '/', params: {}, isExact: pathname === '/'
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      location: props.history.location
    };

    // This is a bit of a hack. We have to start listening for location
    // changes here in the constructor in case there are any <Redirect>s
    // on the initial render. If there are, they will replace/push when
    // they mount and since cDM fires in children before parents, we may
    // get a new location before the <Router> is mounted.
    this.isMountedForRouter = false;
    this.pendingLocation = null;

    this.unlisten = props.history.listen((location) => {
      if (this.isMountedForRouter) {
        this.setState({ location });
      } else {
        this.pendingLocation = location;
      }
    });
  }

  componentDidMount() {
    this.isMountedForRouter = true;

    if (this.pendingLocation) {
      this.setState({ location: this.pendingLocation });
    }
  }

  componentWillUnmount() {
    if (this.unlisten) this.unlisten();
  }

  render() {
    const {
      history, children,
    } = this.props;
    const {
      location,
    } = this.state;
    return (
      <RouterContext.Provider
        value={{
          history,
          location,
          match: Router.computeRootMatch(location.pathname),

        }}
      >
        {children || null}
      </RouterContext.Provider>
    );
  }
}

if (process.env.NODE_ENV !== 'production') {
  Router.propTypes = {
    children: PropTypes.node,
    history: PropTypes.object.isRequired,
  };

  Router.prototype.componentDidUpdate = function (prevProps) {
    warning(
      prevProps.history === this.props.history,
      'You cannot change <Router history>'
    );
  };
}

export default Router;
