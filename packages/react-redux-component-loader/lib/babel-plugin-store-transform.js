const fs = require('fs');
const nodePath = require('path');

const currentPageContextName = 'RrcLoaderCurrentPageContext';
const rawStoreVariable = 'temp_store_var__';
const packageName = 'rrc-loader-helper';
const meDotJsonReg = /me\.json$/;

function shouldGenSpace(selfPath, filePath) {
  const dirName = nodePath.dirname(filePath);
  if (selfPath.indexOf(dirName)) return false;
  const jsonFileName = nodePath.join(dirName, 'me.json');
  if (!fs.existsSync(jsonFileName)) return false;
  return require(jsonFileName).retain;
}

// @TODO 高阶函数处理仍然不正确
module.exports = function BabelPluginStoreTransform(babel) {
  const { types: t, template: temp } = babel;
  const consumerFnTemp = temp(`(currentPage) => { const store = ${rawStoreVariable}['.__inner__'].setCurrentPage(currentPage);}\n`);
  const storeVarTemp = temp(`const store = ${rawStoreVariable}['.__inner__'].setCurrentPage(this.ThePageContext);\n`);
  const cacheFnPartial = temp(`function cacheFnPartial_(fn, arg) {
  fn.cacheMap = fn.cacheMap || new Map();
  const key = JSON.stringify(arg);
  if (!fn.cacheMap.has(key)) {
    fn.cacheMap.set(key, (...args) => fn(...args, arg));
  }
  return fn.cacheMap.get(key);
}\n`);
  return {
    name: 'babel-plugin-store-transform',
    visitor: {
      Program(programPath, state) {
        if (meDotJsonReg.test(state.file.opts.filename)) return;
        const storeName = state.opts.storeName || 'reducer';
        let shouldGen = false;
        const doneState = { doneClassBody: new Set(), doneFunction: new Set() };

        programPath.traverse({
          ImportDeclaration(path) {
            if (path.node.source.value.endsWith(storeName)) {
              const shouldSep = shouldGenSpace(state.file.opts.filename, nodePath.resolve(nodePath.dirname(state.file.opts.filename), path.node.source.value));

              if (shouldSep) {
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
              }
              shouldGen = shouldGen || shouldSep;
            }
          },

          JSXElement(path, myState) {
            if (!shouldGen) return;

            if (!(
              t.isJSXMemberExpression(path.node.openingElement.name)
              && path.node.openingElement.name.object.name === currentPageContextName)
            ) {
              const fn = path.getFunctionParent();
              if (!fn.getFunctionParent() && !fn.isClassMethod()) {
                let oldBody = fn.node.body;
                if (t.isBlockStatement(oldBody)) {
                  oldBody = oldBody.body;
                } else {
                  oldBody = [t.returnStatement(oldBody)];
                }
                const consumerFn = consumerFnTemp();

                consumerFn.expression.body.body = [...consumerFn.expression.body.body, ...oldBody];

                const newReturn = t.jsxElement(
                  t.jSXOpeningElement(t.jsxMemberExpression(t.jsxIdentifier(currentPageContextName), t.jsxIdentifier('Consumer')), []),
                  t.jSXClosingElement(t.jsxMemberExpression(t.jsxIdentifier(currentPageContextName), t.jsxIdentifier('Consumer'))),
                  [t.jSXExpressionContainer(consumerFn.expression)],
                  false,
                );
                fn.get('body')
                  .replaceWith(t.blockStatement([t.returnStatement(newReturn)]));
              }

              if (fn.isClassMethod()) {
                const classNode = fn.findParent(p => p.isClassBody());

                if (!myState.doneClassBody.has(classNode)) {
                  classNode.traverse({
                    ClassMethod(p1) {
                      if (p1.node.kind === 'constructor') {
                        // @TODO constructor???
                      } else {
                        p1.get('body')
                          .unshiftContainer('body', storeVarTemp());
                      }
                    },
                  });
                  fn.findParent(p => p.isClassDeclaration())
                    .get('superClass')
                    .replaceWith(t.MemberExpression(t.Identifier('React'), t.Identifier('WithPageComponent')));
                }
                myState.doneClassBody.add(classNode);

                doneState.doneFunction.add(fn.node);
              }
            }
            path.skip();
          },
        }, doneState);

        if (!shouldGen) return;
        programPath.node.body.unshift(cacheFnPartial({
          JSON: t.Identifier('JSON'),
        }));
        programPath.scope.getBinding('store').referencePaths.forEach((pt) => {
          if (!pt.findParent(p => doneState.doneFunction.has(p.node))) {
            const fnParent = pt.getFunctionParent();
            if (fnParent.getFunctionParent()) {
              // @TODO better error info
              throw new Error('sorry, you write unsupported store.xxx');
            }
            fnParent.node.params.push(t.Identifier('store'));
            let fnID = fnParent.node.id;
            if (!fnID) {
              fnID = fnParent.container.id;
            }
            const fnName = fnID.name;
            programPath.scope.getBinding(fnName)
              .referencePaths
              .forEach(pt1 => pt1.replaceWith(
                t.CallExpression(t.Identifier('cacheFnPartial_'),
                  [t.Identifier(fnName), t.Identifier('store')]),
              ));
          }
        });
      },
    },
  };
};
