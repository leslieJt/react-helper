import React from 'react';
import PropTypes from 'prop-types';

import {
  getPage,
} from './page-list';
import {
  CurrentPageContext,
} from './current-page';
import {
  getReducers,
} from './imp';
import {
  getStore,
} from './inj-dispatch';

const EmbedCacheMap = new Map();


function embedPageFactory(story, defaultOut) {
  const WrapPager = getPage(story);
  if (!WrapPager) {
    console.error(`The story (${story}) you pass is not existed!`);
    return () => (
      <div>
        The story
        {' '}
        {story}
        {' '}
        you pass is not existed!
      </div>
    );
  }
  class EmbedPage extends React.PureComponent {
    render() {
      const { args } = this.props;
      return (
        <WrapPager
          key={JSON.stringify(args)}
          storyArg={args}
        />
      );
    }
  }
  EmbedPage.displayName = 'EmbedPage';
  EmbedPage.propTypes = {
    args: PropTypes.shape(),
  };

  EmbedPage.defaultProps = {
    args: {},
  };

  return [
    EmbedPage,
    function out() {
      const store = getStore();
      if (!store) return null;
      if (!store.getState()[story]) return defaultOut;
      const reducer = getReducers();
      if (store && reducer && Object.hasOwnProperty.call(reducer, story) && Object.hasOwnProperty.call(reducer[story], '.__inner__')) {
        const inner = reducer[story]['.__inner__'];
        if (!Object.hasOwnProperty.call(inner, 'originalObject')) {
          console.error('The .__inner__ is not correct, it may be caused by rrc-loader-helper it self!');
        } else {
          const { originalObject } = inner;
          if (Object.hasOwnProperty.call(originalObject, '$out') && typeof originalObject.$out === 'function') {
            return originalObject.$out(store.getState()[story]);
          }
        }
      }
      return store.getState()[story];
    },
  ];
}

// key 由外部控制
export default function getEmbedPage(story, defaultOut) {
  if (!EmbedCacheMap.get(story)) {
    EmbedCacheMap.set(story, embedPageFactory(story, defaultOut));
  }
  return EmbedCacheMap.get(story);
}
