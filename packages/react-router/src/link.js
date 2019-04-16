import React from 'react';
import { createLocation } from 'history';
import PropTypes from 'prop-types';

import RouterContext from './router-context';

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

/**
 * The public API for rendering a history-aware <a>.
 */
class Link extends React.Component {
  handleClick(event, history) {
    const {
      onClick,
      target,
      replace,
      to,
    } = this.props;
    if (onClick) {
      onClick(event);
    }

    if (
      !event.defaultPrevented // onClick prevented default
      && event.button === 0 // ignore everything but left clicks
      && (!target || target === '_self') // let browser handle "target=_blank" etc.
      && !isModifiedEvent(event) // ignore clicks with modifier keys
    ) {
      event.preventDefault();

      const method = replace ? history.replace : history.push;

      method(to);
    }
  }

  render() {
    const {
      innerRef, replace, to, children, ...rest
    } = this.props;

    return (
      <RouterContext.Consumer>
        {(context) => {
          if (!context) {
            throw new Error('You should not use <Link> outside a <Router>');
          }

          const location = typeof to === 'string'
            ? createLocation(to, null, null, context.location)
            : to;
          const href = location ? context.history.createHref(location) : '';

          return (
            <a
              {...rest}
              onClick={event => this.handleClick(event, context.history)}
              href={href}
              ref={innerRef}
            >
              {children}
            </a>
          );
        }}
      </RouterContext.Consumer>
    );
  }
}

const toType = PropTypes.oneOfType([PropTypes.string, PropTypes.object]);
const innerRefType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.func,
  PropTypes.shape({ current: PropTypes.any })
]);
Link.propTypes = {
  innerRef: innerRefType,
  onClick: PropTypes.func,
  replace: PropTypes.bool,
  target: PropTypes.string,
  to: toType.isRequired
};

export default Link;
