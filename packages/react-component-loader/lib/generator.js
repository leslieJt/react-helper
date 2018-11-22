/**
 * Created by fed on 16/8/5.
 */
const path = require('path');
const fs = require('fs');
const glob = require('glob').sync;

const ImportHelper = require('./import-helper');
const DefineHelper = require('./define-helper');

function traverseTree(tree, enter, leave) {
  Object.keys(tree).forEach((key) => {
    const hasChild = typeof tree[key] === 'object';
    enter(tree[key], key, hasChild);
    if (hasChild) {
      traverseTree(tree[key], enter, leave);
    }
    leave(tree[key], key, hasChild);
  });
}

const counter = 0;

function getMetaPath(currentPath, config) {
  return path.join(...[config.dir].concat(currentPath, 'me.json'));
}

function getMeta(currentPath, config) {
  const jsonPath = getMetaPath(currentPath, config);
  try {
    return JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  } catch (e) {
    return {};
  }
}


function shouldRoute(config, currentPath, name) {
  const fullPath = path.join(...[config.dir].concat(currentPath, name));
  try {
    fs.statSync(fullPath);
    return true;
  } catch (e) {
    return false;
  }
}

function isExists(ctx, name) {
  try {
    fs.accessSync(path.join(ctx.context, `${name}.js`));
    return true;
  } catch (e) {
    return false;
  }
}

exports.component = function (components, config, ctx) {
  const importHelper = new ImportHelper();

  importHelper.addDependencies('rrc-loader-helper/lib/fake-react');
  importHelper.addDependencies('redux', '{ combineReducers }');
  importHelper.addDependencies('rrc-loader-helper/lib/loadable', 'Loadable');
  importHelper.addDependencies('rrc-loader-helper/lib/page-loader/async', 'asyncPageCallback');

  let resultStr = '';
  const currentPath = ['.'];
  traverseTree(components, (value, key, hasChild) => {
    currentPath.push(key);
    if (config.externals.indexOf(currentPath.slice(1).join('/')) > -1) return;
    if (!hasChild) {
      const metaInfo = getMeta(currentPath, config);
      ctx.addDependency(getMetaPath(currentPath, config));
      const shouldBuild = shouldRoute(config, currentPath, 'me.json');
      if (!shouldBuild) {
        // public component
        glob('*.jsx', {
          cwd: path.join(...[config.dir].concat(currentPath)),
        }).forEach((item) => {
          importHelper.addDependencies(`${currentPath.join('/')}/${item}`);
        });
      } else {
        const compName = currentPath.slice(1).join('_');
        let component;
        const reducerKey = currentPath.slice(1).join('/');
        // me.json中retain配置优先
        const retain = Object.prototype.hasOwnProperty.call(metaInfo, 'retain') ? metaInfo.retain : config.retain;
        if (metaInfo.sync) {
          const comp = JSON.stringify(`${currentPath.join('/')}/view.jsx`);
          component = `Loadable({ retain: ${JSON.stringify(retain)}, page:${JSON.stringify(reducerKey)}, loading: Loading, loader: () =>`
            + ` new Promise(resolve => require.ensure([${comp}], require => resolve(require(${comp})),${JSON.stringify(compName)}))`
            + ' })';
        } else {
          const comp = JSON.stringify(`${currentPath.join('/')}/me.json`);
          component = `Loadable({ retain: ${JSON.stringify(retain)}, page:${JSON.stringify(reducerKey)},loading: Loading, loader: () => `
           + `new Promise(resolve => require.ensure([${comp}], require => resolve(require(${comp})),${JSON.stringify(compName)})).then(module => asyncPageCallback(module, "${reducerKey}", reducers))})`;
        }
        if (key === config.index) {
          resultStr += `<Route exact path="/${currentPath.slice(1, -1).join('/')}" component={${component}} /> \n`;
        }
        resultStr += `<Route path="/${currentPath.slice(1).join('/')}${metaInfo.route || ''}" `
          + `component={ ${component} }/>\n`;
      }
    }
  }, () => currentPath.pop());
  return [`${resultStr}\n`, importHelper.toImportList()];
};

exports.reducers = function (components, config, ctx) {
  const importHelper = new ImportHelper();
  let resultStr = '{ \n';
  importHelper.addDependencies('redux', '{ combineReducers }');
  const reducerDecoratorIdentifier = importHelper.addDependencies('rrc-loader-helper/lib/reducer-decorate', 'enhanceReducer');

  const currentPath = ['.'];
  traverseTree(components, (value, key, hasChild) => {
    currentPath.push(key);
    const metaInfo = getMeta(currentPath, config);
    ctx.addDependency(getMetaPath(currentPath, config));
    const shouldBuild = shouldRoute(config, currentPath, 'me.json');
    const forceSync = config.externals.indexOf(currentPath.slice(1).join('/')) > -1;
    if (!hasChild && (shouldBuild || forceSync)) {
      let identifier = '""';
      if (forceSync || metaInfo.sync) {
        if (metaInfo.mobx) {
          identifier = importHelper.addDependencies(`${currentPath.join('/')}/${config.reducerName}.js`);
        } else {
          identifier = importHelper.addDependencies(`${currentPath.join('/')}/${config.reducerName}.js`);
        }
      }
      const reducerKey = currentPath.slice(1).join('/');
      resultStr += `"${reducerKey}": ${
        (config.reducerDecorator && identifier !== '""') ? `${reducerDecoratorIdentifier}(${identifier}, ${JSON.stringify(reducerKey)})`
          : identifier},\n`;
    }
  }, () => {
    currentPath.pop();
  });
  return [`${resultStr}".retained": (s = {}) => s},\n`, importHelper.toImportList()];
};

exports.saga = function (components, config, ctx) {
  const importHelper = new ImportHelper();
  const resultList = [];
  const currentPath = ['.'];
  traverseTree(components, (value, key, hasChild) => {
    currentPath.push(key);
    const metaInfo = getMeta(currentPath, config);
    ctx.addDependency(getMetaPath(currentPath, config));
    const shouldBuild = shouldRoute(config, currentPath, 'me.json');
    const forceSync = config.externals.indexOf(currentPath.slice(1).join('/')) > -1;
    if (!hasChild && (shouldBuild || forceSync)) {
      if (!metaInfo.mobx && (forceSync || metaInfo.sync)) {
        const identifier = importHelper.addDependencies(`${currentPath.join('/')}/saga.js`);
        resultList.push(identifier);
      } else {
        resultList.push('""');
      }
    }
  }, () => {
    currentPath.pop();
  });
  return [`[${resultList.join(',')}]`, importHelper.toImportList()];
};

exports.bundle = function (reducerName, ctx) {
  const result = [];
  result.push('export { default as view } from "./view.jsx";');
  if (isExists(ctx, reducerName)) {
    result.push(`export { default as reducer } from "./${reducerName}";`);
  }
  if (isExists(ctx, 'saga')) {
    result.push('export { default as saga } from "./saga";');
  }
  return result.join('\n');
};
