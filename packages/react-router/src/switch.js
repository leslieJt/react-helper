import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';

import RouterContext from './router-context';
import matchPath from './match-path';
import DeactivatableWrapper from './deactivatable-wrapper';

class Switch extends React.Component {
  constructor(props) {
    super(props);
    this.retainRoutes = new Map();
  }

  render() {
    const {
      location: givenLocation,
      children,
    } = this.props;
    return (
      <RouterContext.Consumer>
        {(context) => {
          invariant(context, 'You should not use <Switch> outside a <Router>');

          const location = givenLocation || context.location;

          let element;
          let match;

          // We use React.Children.forEach instead of React.Children.toArray().find()
          // here because toArray adds keys to all child elements and we do not want
          // to trigger an unmount/remount for two <Route>s that render the same
          // component at different URLs.
          React.Children.forEach(children, (child) => {
            if (match == null && React.isValidElement(child)) {
              element = child;

              // @TODO what does 'from' mean?
              const path = child.props.path || child.props.from;

              match = path
                ? matchPath(location.pathname, { ...child.props, path })
                : context.match;

              if (child.props.keepAlive) {
                this.retainRoutes.set(path, child);
              }
            }
          });

          return (
            <Fragment>
              {
                [...this.retainRoutes.values()]
                  .filter(x => x.props.path !== element.props.path)
                  .map(ele => (
                    <div style={{ display: 'none' }} key={ele.props.path}>
                      <DeactivatableWrapper active={false}>
                        {ele}
                      </DeactivatableWrapper>
                    </div>
                  )).concat([match
                    ? (
                      <div key={element.props.path}>
                        <DeactivatableWrapper active>
                          {React.cloneElement(element, { location, computedMatch: match })}
                        </DeactivatableWrapper>
                      </div>
                    )
                    : null])
              }
            </Fragment>
          );
        }}
      </RouterContext.Consumer>
    );
  }
}

if (process.env.NODE_ENV !== 'production') {
  Switch.propTypes = {
    children: PropTypes.node,
    location: PropTypes.object
  };

  Switch.prototype.componentDidUpdate = function (prevProps) {
    warning(
      !(this.props.location && !prevProps.location),
      '<Switch> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.'
    );

    warning(
      !(!this.props.location && prevProps.location),
      '<Switch> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.'
    );
  };
}

export default Switch;
