import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  connect,
} from 'react-redux';

import {
  CurrentPageContext,
} from '../current-page';
import {
  enhanceAction,
} from './action';

export default function connect2(mapStateToProps, ...others) {
  return (PageComponent) => {
    PageComponent.caches = PageComponent.caches || new Map();
    function ResComponent({ rrcPageActive: active, ...otherParentProps }) {
      return (
        <CurrentPageContext.Consumer>
          {
            ({ retain, url, page }) => {
              class muteDispatch extends React.Component {
                shouldComponentUpdate(nextProps) {
                  if (!this.props.rrcPageActive && nextProps.rrcPageActive) {
                    // 处理不可见->可见时，部分组件获取高度的问题
                    setTimeout(() => this.setState({}), 1);
                    return false;
                  }
                  return nextProps.rrcPageActive;
                }

                render() {
                  const {
                    dispatch, rrcPageActive, otherParentProps: oProps, ...otherProps
                  } = this.props;
                  return (
                    <PageComponent
                      dispatch={action => dispatch(enhanceAction(action, {
                        url,
                        page,
                      }))}
                      {...oProps}
                      {...otherProps}
                    />
                  );
                }
              }
              muteDispatch.displayName = `muteDispatch(${url}})`;
              if (!PageComponent.caches.has(url)) {
                if (!retain) {
                  PageComponent.caches.set(url, connect(mapStateToProps, ...others)(PageComponent));
                } else {
                  PageComponent.caches.set(url,
                    connect((state) => {
                      let finalState = state;
                      if (retain) {
                        finalState = Object.assign({}, state, {
                          [page]: state['.retain'][url],
                        });
                      }
                      return mapStateToProps(finalState, ...others);
                    })(muteDispatch));
                }
              }

              const ConnectedComponent = PageComponent.caches.get(url);

              if (retain) {
                return (
                  <Fragment>
                    {!active && <br style={{ display: 'none' }} data-lcd-keep-alive="hide-start" />}
                    <ConnectedComponent
                      otherParentProps={otherParentProps}
                      rrcPageActive={active}
                    />
                    {!active && <br style={{ display: 'none' }} data-lcd-keep-alive="hide-end" />}
                  </Fragment>
                );
              }
              return <ConnectedComponent {...otherParentProps} />;
            }
          }
        </CurrentPageContext.Consumer>
      );
    }
    ResComponent.propTypes = {
      rrcPageActive: PropTypes.bool,
    };
    ResComponent.defaultProps = {
      rrcPageActive: true,
    };
    ResComponent.isConnectedComponent = true;
    ResComponent.displayName = `NamespacePageComponent(${PageComponent.displayName || PageComponent.name})`;
    return ResComponent;
  };
}
