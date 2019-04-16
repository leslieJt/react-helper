import React from 'react';
import isPromise from '../util/is-promise';

const suspensibleStateName = ']is-suspensed[';
const mountCalled = ']mount-called[';

const suspensibleStates = {
  ok: 0,
  loading: 1,
  error: 2,
};

// @TODO error api design?
class SuspensibleComponent extends React.Component {
  // @TODO check placeholder type
  constructor(props) {
    super(props);
    this[suspensibleStateName] = suspensibleStateName.ok;
    this[mountCalled] = false;

    this.render = function render(...args) {
      if (!this.constructor) {
        throw new Error('Sorry, you met a problem of SuspensibleComponent, usually it\'s caused by rrc-loader-helper.');
      }
      const {
        placeholder = <div>loading...</div>,
        prototype: { render: renderMethod }
      } = this.constructor;
      if (!this.checkSuspensibleState()) {
        return placeholder;
      }
      try {
        return renderMethod.call(this, ...args);
      } catch (error) {
        if (!isPromise(error)) {
          throw error;
        }
        error.then(() => {
          this[suspensibleStateName] = suspensibleStates.ok;
          this.setState({});
        }).catch(() => {
          this[suspensibleStateName] = suspensibleStates.error;
          this.setState({});
        });

        this[suspensibleStateName] = suspensibleStates.loading;
        return placeholder;
      }
    };

    this.componentDidMount = function componentDidMount() {
      if (this.checkSuspensibleState()) {
        this[mountCalled] = true;
        this.callChildMethod('componentDidMount');
      }
    };

    this.componentDidUpdate = function componentDidUpdate() {
      if (this.checkSuspensibleState() && !this[mountCalled]) {
        this[mountCalled] = true;
        this.callChildMethod('componentDidMount');
      } else {
        this.callChildMethod('componentDidUpdate');
      }
    };
  }

  checkSuspensibleState() {
    return !this[[suspensibleStateName]];
  }


  callChildMethod(name, ...args) {
    if (Object.hasOwnProperty.call(this.constructor.prototype, name)) {
      this.constructor.prototype[name].call(this, ...args);
    }
  }

  // its parents should be able to catch
  componentDidCatch(error) {

  }
}

export default SuspensibleComponent;
