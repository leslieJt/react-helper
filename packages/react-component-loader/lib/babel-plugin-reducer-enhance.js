/**
 * Created by fed on 2017/11/10.
 */
const namespaceName = '__REACT_COMPONENT_LOADER_NAMESPACE_FOR_ENHANCE';
const enhanceName = '__REACT_COMPONENT_LOADER_FUNCTION_FOR_ENHANCE';

module.exports = function reducerEnhancePlugin({ types: t }) {
  return {
    visitor: {
      ExportDefaultDeclaration(path) {
        if (!path.scope.getBinding(namespaceName)) {
          return;
        }
        const prefix = path.scope.getBinding(namespaceName).path.get('value').parent.init.value;
        const fnNode = t.CallExpression(t.Identifier(enhanceName), [path.node.declaration, t.StringLiteral(prefix)]);
        path.node.declaration = fnNode;
      },
      Program: {
        exit(path) {
          if (path.scope.getBinding(namespaceName)) {
            path.scope.getBinding(namespaceName).path.remove();
          }
        },
      },
    },
  };
};

module.exports.namespaceName = namespaceName;
module.exports.enhanceName = enhanceName;
