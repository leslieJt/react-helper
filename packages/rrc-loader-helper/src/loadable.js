/**
 * Created by fed on 2017/8/31.
 */
import React, { Component, Fragment } from 'react';
import { polyfill } from 'react-lifecycles-compat';
import {
  call,
} from '@vve/redux-saga/effects';
import {
  sendPv, sendLeave, setLeaveStartTime, sendError
} from 'sheinq';

import { set as setPage, CurrentPageContext } from './current-page';
import { getStore } from './inj-dispatch';
import { updatePage, updateSaga } from './actions';
import { registerPage, getPage } from './page-list';
import {
  setCtx, connect,
} from './retain';

const historyList = [];
let firstScreen = true;

const STATE_LIST = {
  INIT: 0,
  RESOLVED: 1,
  ERROR: 2,
  PENDING: 3,
};

function setPageStore(url, state) {
  const store = getStore();
  const {
    retain, page, saga, sagaCache, route, mobxStyle,
  } = state;
  if (saga) {
    let realSaga = saga;
    if (retain && route) {
      if (!sagaCache.has(url)) {
        sagaCache.set(url, function* wrappedSaga() {
          yield setCtx({
            page,
            url,
          });
          yield call(saga);
        });
      }
      realSaga = sagaCache.get(url);
    }
    store.dispatch({
      type: updateSaga,
      ctx: setCtx({
        page,
        mobxStyle,
      }),
      saga: realSaga,
    });
  }

  // Component loaded, then dispatch.
  store.dispatch({
    type: updatePage,
    payload: {
      page,
      // location, what does it do?
      match: { url },
      // @TODO should refactor
      retain: retain && route,
    },
  });
}

// @TODO may be buggy
class Pager extends Component {
  constructor(props) {
    super(props);
    let { loader } = props;
    const {
      retain, page, route, mobxStyle,
    } = props;
    this.useTime = Date.now();
    setLeaveStartTime(this.useTime);
    setPage(page);
    this.active = true;
    this.state = {
      retain,
      page,
      route,
      mobxStyle,
      state: STATE_LIST.INIT,
      saga: null,
      sagaCache: new Map(),
      views: new Set(),
    };
    this.ctxCache = new Map();

    if (typeof loader === 'function') {
      loader = loader();
    }
    loader.then(([view, saga]) => {
      const { match: { url } } = props;

      if (this.active) {
        let PageComponent = view.default || view;
        if (!PageComponent.isConnectedComponent) {
          PageComponent = connect(state => state[page])(PageComponent);
        }
        const mutingState = {
          state: STATE_LIST.RESOLVED,
          PageComponent,
          saga,
          url,
        };
        const draftState = Object.assign({}, this.state, mutingState);
        if (retain && route) {
          // @TODO wrong !!
          this.state.views.add(url);
        }
        setPageStore(url, draftState);
        this.setState(mutingState);
      }
    })
      .catch((error) => {
        console.error(error);

        if (this.active) {
          this.setState({
            state: STATE_LIST.ERROR,
            errorMsg: `Page load failed with error: ${error}`,
          });
        }
      });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.state !== STATE_LIST.RESOLVED) return null;
    if (prevState.retain && prevState.route && prevState.url !== nextProps.match.url) {
      const { url } = nextProps.match;
      prevState.views.add(url);
      setPageStore(url, prevState);
      return {
        url,
      };
    }
    return null;
  }

  getCtx(obj) {
    const str = JSON.stringify(obj);
    if (!this.ctxCache.get(str)) {
      this.ctxCache.set(str, obj);
    }
    return this.ctxCache.get(str);
  }

  componentDidMount() {
    const { page } = this.props;
    const { state } = this.state;

    if (state === STATE_LIST.RESOLVED && !this.didSend) {
      this.didSend = true;
      const preHis = historyList.pop();
      setTimeout(() => {
        sendPv({
          ctu: Date.now() - this.useTime - 4,
          page,
          refer: preHis || '',
          firstScreen,
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
    const { page } = this.props;
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
      errorMsg: `An Unexpected Error Occurred, please visit again later. \n\n Error:\n ${error} \n\n Info: \n${info}`,
    });
  }

  renderPage(restProps) {
    const {
      url,
      retain,
      views,
      PageComponent,
      page,
      route,
    } = this.state;

    if (!retain || !route) {
      return (
        <CurrentPageContext.Provider
          value={{ page, retain: false, }}
        >
          <PageComponent {...restProps} rrcPageActive />
        </CurrentPageContext.Provider>
      );
    }
    return (
      <Fragment>
        {
          [...views].map(u => (
            <CurrentPageContext.Provider
              key={u}
              value={this.getCtx({ page, retain: retain && route, url: u, })}
            >
              <PageComponent {...restProps} rrcPageActive={u === url} />
            </CurrentPageContext.Provider>
          ))
        }
      </Fragment>
    );
  }

  render() {
    const {
      loading: Loading, page, loader, retain, route, ...restProps
    } = this.props;
    const { errorMsg, state } = this.state;

    switch (state) {
      case STATE_LIST.RESOLVED:
        return this.renderPage(restProps);
      case STATE_LIST.ERROR:
        return <pre>{errorMsg}</pre>;
      default:
        return <Loading {...restProps} />;
    }
  }
}

polyfill(Pager);


function loadableFactory(args) {
  if (!getPage(args.page)) {
    let wrapPager = null;
    if (!args.retain && args.route) {
      wrapPager = props => (
        <Pager key={props.match.url} {...props} {...args} />
      );
    } else {
      wrapPager = props => (
        <Pager {...props} {...args} />
      );
    }

    wrapPager.displayName = `Loadable(${args.page})`;
    registerPage(args.page, wrapPager);
  }
  return getPage(args.page);
}

export default loadableFactory;
