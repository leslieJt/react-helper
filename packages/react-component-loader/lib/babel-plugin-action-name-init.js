/**
 * Created by fed on 2017/11/10.
 */
const namespaceName = '__REACT_COMPONENT_LOADER_NAMESPACE';

module.exports = function actionNameAutoPlugin({ types: t }) {
  return {
    visitor: {
      ExportNamedDeclaration(p) {
        p.traverse({
          VariableDeclarator(path) {
            const rawVal = path.node.init;
            const prefix = path.scope.getBinding(namespaceName).path.get('value').parent.init.value;
            let val;
            if (rawVal) {
              if (String(rawVal.value).indexOf(':global:') === 0) return;
              val = prefix + rawVal.value;
            } else {
              val = prefix
                    + path.node.id.name;
            }
            path.node.init = t.StringLiteral(val);
          },
        });
      },
      Program: {
        exit(path) {
          path.scope.getBinding(namespaceName).path.remove();
        },
      },
    },
  };
};

module.exports.namespaceName = namespaceName;
