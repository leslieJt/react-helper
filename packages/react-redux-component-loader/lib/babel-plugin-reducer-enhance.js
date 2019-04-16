/**
 * Created by fed on 2017/11/10.
 */
const namespaceName = '__REACT_COMPONENT_LOADER_NAMESPACE_FOR_ENHANCE';
const enhanceName = '__REACT_COMPONENT_LOADER_FUNCTION_FOR_ENHANCE';

const newSagaModulePathBase = 'rrc-loader-helper/lib/sagas/';
const newConnectPathBase = 'rrc-loader-helper/lib/reducers/';

module.exports = function reducerEnhancePlugin({ types: t }) {
  return {
    visitor: {
      ExportDefaultDeclaration(path) {
        if (!path.scope.getBinding(namespaceName)) {
          return;
        }
        const prefix = path.scope.getBinding(namespaceName)
          .path
          .get('value').parent.init.value;
        path.node.declaration = t.CallExpression(t.Identifier(enhanceName), [path.node.declaration, t.StringLiteral(prefix)]);
      },
      Program: {
        exit(path) {
          if (path.scope.getBinding(namespaceName)) {
            path.scope.getBinding(namespaceName)
              .path
              .remove();
          }
        },
      },
      ImportDeclaration(path) {
        if (path.node.source.value.indexOf('redux-saga') === 0) {
          path.node.source.value = newSagaModulePathBase +  path.node.source.value;
        }
        if (path.node.source.value.indexOf('react-redux') === 0) {
          path.node.source.value = newConnectPathBase +  path.node.source.value;
        }
      },
    },
  };
};

module.exports.namespaceName = namespaceName;
module.exports.enhanceName = enhanceName;
