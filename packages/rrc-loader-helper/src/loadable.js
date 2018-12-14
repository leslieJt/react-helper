/**
 * Created by fed on 2017/8/31.
 */
import React, { Component } from 'react';
import {
  sendPv, sendLeave, setLeaveStartTime, sendError
} from 'sheinq';

import { set as setPage } from './current-page';
import { getStore } from './inj-dispatch';
import { updatePage } from './actions';

const historyList = [];
let firstScreen = true;

const STATE_LIST = {
  INIT: 0,
  RESOLVED: 1,
  ERROR: 2,
  PENDING: 3,
};

class Pager extends Component {
  constructor(props) {
    super(props);

    // eslint-disable-next-line prefer-const
    let { props: { location, match }, args: { page, loader, retain } } = props;
    this.useTime = Date.now();
    setLeaveStartTime(this.useTime);
    setPage(page);
    this.active = true;
    this.state = {
      state: STATE_LIST.INIT
    };

    if (typeof loader === 'function') {
      loader = loader();
    }
    loader.then((view) => {
      const store = getStore();
      // Component loaded, then dispatch.
      store.dispatch({
        type: updatePage,
        payload: {
          page, location, match, retain
        }
      });

      if (this.active) {
        this.setState({
          state: STATE_LIST.RESOLVED,
          Result: view.default || view
        });
      }
      return view;
    }).catch((error) => {
      console.error(error);

      if (this.active) {
        this.setState({
          state: STATE_LIST.ERROR,
          errorMsg: `Page load failed with error: ${error}`
        });
      }
    });
  }

  componentDidMount() {
    const { args: { page } } = this.props;
    const { state } = this.state;

    if (state === STATE_LIST.RESOLVED && !this.didSend) {
      this.didSend = true;
      const preHis = historyList.pop();
      setTimeout(() => {
        sendPv({
          ctu: Date.now() - this.useTime - 4,
          page,
          refer: preHis || '',
          firstScreen
        });
        if (firstScreen) firstScreen = !firstScreen;
      }, 4);
    }
    // @TODO change to configurable
    // only reserve 10 pages in history
    const l = historyList.length;
    if (!l) {
      historyList.push(page);
    } else if (historyList[l - 1] !== page) {
      if (l >= 10) historyList.shift();
      historyList.push(page);
    }
  }

  componentDidUpdate() {
    const { args: { page } } = this.props;
    const { state } = this.state;

    if (!this.didSend && state === STATE_LIST.RESOLVED) {
      this.didSend = true;
      setTimeout(() => {
        sendPv({
          ctu: Date.now() - this.useTime - 4,
          page,
          refer: historyList.length > 1 ? historyList[historyList.length - 2] : '',
          firstScreen
        });
        if (firstScreen) firstScreen = !firstScreen;
      }, 4);
    }
  }

  // @TODO unmount重置state
  componentWillUnmount() {
    this.active = false;
    sendLeave({
      eventCategory: 'view',
      eventAction: 'leave',
      eventLabel: 'stayTime',
      eventValue: Date.now() - this.useTime
    });
  }

  // react >= 16.6.0
  // eslint-disable-next-line no-unused-vars
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return {
      state: STATE_LIST.ERROR,
      errorMsg: 'An Unexpected Error Occurred, please visit again later.'
    };
  }

  // eslint-disable-next-line no-unused-vars
  componentDidCatch(error, info) {
    // https://reactjs.org/blog/2018/10/23/react-v-16-6.html#static-getderivedstatefromerror
    sendError(error);

    this.setState({
      state: STATE_LIST.ERROR,
      errorMsg: 'An Unexpected Error Occurred, please visit again later.'
    });
  }

  render() {
    const { args: { loading: Loading }, props } = this.props;
    const { Result, errorMsg, state } = this.state;

    switch (state) {
      case STATE_LIST.RESOLVED:
        return <Result {...props} />;
      case STATE_LIST.ERROR:
        return <div>{errorMsg}</div>;
      default:
        return <Loading {...props} />;
    }
  }
}

function Loadable(args) {
  const wrapPager = props => <Pager props={props} args={args} />;

  wrapPager.displayName = `Loadable(${args.page})`;

  return wrapPager;
}

export default Loadable;
