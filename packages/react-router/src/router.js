import React from 'react';
import PropTypes from 'prop-types';

import RouterContext from './router-context';

function processKeepAlive() {
  const dataName = 'data-lcd-keep-alive';
  const start = 'hide-start';
  const end = 'hide-end';
  const markData = 'data-lcd-keep-alive-hide';
  document.querySelectorAll(`[${markData}]`)
    .forEach(it => it.removeAttribute(markData));
  document.querySelectorAll(`[${dataName}=${start}]`)
    .forEach((startNode) => {
      let node = startNode.nextSibling;
      let shouldConsumeEnd = 1;
      while (shouldConsumeEnd) {
        if (node.getAttribute(dataName) === start) {
          shouldConsumeEnd += 1;
        }
        if (node.getAttribute(dataName) === end) {
          shouldConsumeEnd -= 1;
        }
        node.setAttribute(markData, '');
        node = node.nextSibling;
      }
    });
}

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

  componentDidUpdate() {
    processKeepAlive();
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

Router.propTypes = {
  children: PropTypes.element.isRequired,
  history: PropTypes.shape({
    location: PropTypes.shape({}),
    listen: PropTypes.func.isRequired,
  }).isRequired,
};

export default Router;
