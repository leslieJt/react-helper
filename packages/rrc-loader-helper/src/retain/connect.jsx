import React from 'react';
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
                    setTimeout(() => this.setState({}), 1);
                    return false;
                  }
                  return nextProps.rrcPageActive;
                }

                render() {
                  const { dispatch, otherParentProps: oProps, ...otherProps } = this.props;
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
                  <div style={{ display: active ? 'block' : 'none' }}>
                    <ConnectedComponent
                      otherParentProps={otherParentProps}
                      rrcPageActive={active}
                    />
                </div>
                );
              }
              return <ConnectedComponent {...otherParentProps} />;
            }
          }
        </CurrentPageContext.Consumer>
      );
    }
    ResComponent.propTypes = {
      rrcPageActive: PropTypes.bool.isRequired,
    };
    ResComponent.isConnectedComponent = true;
    ResComponent.displayName = `NamespacePageComponent(${PageComponent.displayName || PageComponent.name})`;
    return ResComponent;
  };
}
