const currentPageContextName = 'RRC_LOADER_CURRENT_PAGE_CONTEXT';
const consumerName = `${currentPageContextName}.Consumer`;
const rawStoreVariable = 'temp_store_var__';
const packageName = 'rrc-loader-helper';
const meDotJsonReg = /me\.json$/;

module.exports = function BabelPluginStoreTransform(babel) {
  const { types: t, template: temp } = babel;
  const consumerFnTemp = temp(`(currentPage) => { const store = ${rawStoreVariable}['.__inner__'].setCurrentPage(currentPage);}`);
  const storeVarTemp = temp(`const store = ${rawStoreVariable}['.__inner__'].setCurrentPage(this.ThePageContext);`);

  return {
    name: 'babel-plugin-store-transform',
    visitor: {
      Program(programPath, state) {
        if (meDotJsonReg.test(state.file.opts.filename)) return;
        const storeName = state.opts.storeName || 'store';
        let shouldGen = false;

        programPath.traverse({
          ImportDeclaration(path) {
            if (path.node.source.value === `./${storeName}`) {
              path.node.specifiers.forEach((spec) => {
                if (spec.type === 'ImportDefaultSpecifier') {
                  spec.local.name = rawStoreVariable;
                }
              });
              path.container.unshift(
                t.importDeclaration(
                  [t.ImportSpecifier(t.Identifier(currentPageContextName), t.Identifier('CurrentPageContext'))],
                  t.StringLiteral(packageName),
                ),
              );
              shouldGen = true;
            }
          },

          JSXElement(path) {
            if (!shouldGen) return;

            if (
              !path.findParent(p => p.isJSXElement())
              && path.node.openingElement.name.name !== consumerName
            ) {
              const fn = path.getFunctionParent();
              if (!fn.getFunctionParent() && !fn.isClassMethod()) {
                const oldBody = fn.node.body.body;
                const consumerFn = consumerFnTemp();

                consumerFn.expression.body.body = [...consumerFn.expression.body.body, ...oldBody];

                const newReturn = t.jsxElement(
                  t.jSXOpeningElement(t.jsxIdentifier(consumerName), []),
                  t.jSXClosingElement(t.jsxIdentifier(consumerName)),
                  [t.jSXExpressionContainer(consumerFn.expression)],
                  false,
                );
                fn.get('body')
                  .replaceWith(t.blockStatement([t.returnStatement(newReturn)]));
              }

              if (fn.isClassMethod()) {
                fn.findParent(p => p.isClassBody()).traverse({
                  ClassMethod(p1) {
                    if (p1.node.kind === 'constructor') {
                      // @TODO constructor???
                    } else {
                      p1.get('body').unshiftContainer('body', storeVarTemp());
                    }
                  },
                });
                fn.findParent(p => p.isClassDeclaration())
                  .get('superClass')
                  .replaceWith(t.MemberExpression(t.Identifier('React'), t.Identifier('WithPageComponent')));
              }
            }
          },
        });
      },
    },
  };
};
