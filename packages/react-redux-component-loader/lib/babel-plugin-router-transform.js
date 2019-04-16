/**
 * Created by fed on 2017/11/10.
 */

const newReactRouterPath = 'rrc-loader-helper/router';

module.exports = function reducerEnhancePlugin() {
  return {
    visitor: {
      ImportDeclaration(path) {
        if (path.node.source.value.indexOf('react-router-dom') === 0) {
          path.node.source.value = newReactRouterPath;
        }
      },
    },
  };
};
