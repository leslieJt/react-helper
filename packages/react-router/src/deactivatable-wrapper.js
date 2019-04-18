import React from 'react';
import PropTypes from 'prop-types';

export default class Deactivatable extends React.Component {
  shouldComponentUpdate(nextProps) {
    return this.props.active || nextProps.active;
  }

  render() {
    const { children } = this.props;
    return children;
  }
}

Deactivatable.propTypes = {
  active: PropTypes.bool.isRequired,
  children: PropTypes.element.isRequired,
};
