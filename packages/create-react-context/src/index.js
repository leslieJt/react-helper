import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gud from 'gud';
import warning from 'tiny-warning';

const MAX_SIGNED_31_BIT_INT = 1073741823;

// Inlined Object.is polyfill.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
function objectIs(x, y) {
  if (x === y) {
    return x !== 0 || 1 / x === 1 / y;
  }
  return x !== x && y !== y;
}


function createEventEmitter(value) {
  let handlers = [];
  return {
    on(handler) {
      handlers.push(handler);
    },

    off(handler) {
      handlers = handlers.filter(h => h !== handler);
    },

    get() {
      return value;
    },

    set(newValue, changedBits) {
      value = newValue;
      handlers.forEach(handler => handler(value, changedBits));
    }
  };
}

function onlyChild(children) {
  return Array.isArray(children) ? children[0] : children;
}

export default function createReactContext(defaultValue, calculateChangedBits) {
  const contextProp = '__create-react-context-' + gud() + '__';

  class Provider extends Component {
    constructor(props) {
      super(props);
      this.emitter = createEventEmitter(this.props.value);
    }

    getChildContext() {
      return {
        [contextProp]: this.emitter
      };
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.value !== nextProps.value) {
        const oldValue = this.props.value;
        const newValue = nextProps.value;
        let changedBits = 0;

        if (objectIs(oldValue, newValue)) {
          changedBits = 0; // No change
        } else {
          changedBits = typeof calculateChangedBits === 'function'
            ? calculateChangedBits(oldValue, newValue)
            : MAX_SIGNED_31_BIT_INT;
          if (process.env.NODE_ENV !== 'production') {
            warning(
              (changedBits & MAX_SIGNED_31_BIT_INT) === changedBits,
              'calculateChangedBits: Expected the return value to be a '
              + '31-bit integer. Instead received: ' + changedBits,
            );
          }

          changedBits |= 0;

          if (changedBits !== 0) {
            this.emitter.set(nextProps.value, changedBits);
          }
        }
      }
    }

    render() {
      return this.props.children;
    }
  }

  Provider.childContextTypes = {
    [contextProp]: PropTypes.object.isRequired
  };

  class Consumer extends Component {
    constructor(props) {
      super(props);
      this.state = {
        value: this.getValue()
      };
      this.observedBits = 0;
      this.onUpdate = (newValue, changedBits) => {
        const observedBits = this.observedBits | 0;
        if ((observedBits & changedBits) !== 0) {
          this.setState({ value: this.getValue() });
        }
      };
    }


    componentDidMount() {
      if (this.context[contextProp]) {
        this.context[contextProp].on(this.onUpdate);
      }
      const { observedBits } = this.props;
      this.observedBits = observedBits === undefined || observedBits === null
        ? MAX_SIGNED_31_BIT_INT // Subscribe to all changes by default
        : observedBits;
    }


    componentWillReceiveProps(nextProps) {
      const { observedBits } = nextProps;
      this.observedBits = observedBits === undefined || observedBits === null
        ? MAX_SIGNED_31_BIT_INT // Subscribe to all changes by default
        : observedBits;
    }

    componentWillUnmount() {
      if (this.context[contextProp]) {
        this.context[contextProp].off(this.onUpdate);
      }
    }

    getValue() {
      if (this.context[contextProp]) {
        return this.context[contextProp].get();
      }
      return defaultValue;
    }

    render() {
      return onlyChild(this.props.children)(this.state.value);
    }
  }

  Consumer.contextTypes = {
    [contextProp]: PropTypes.object
  };

  return {
    Provider,
    Consumer
  };
}
