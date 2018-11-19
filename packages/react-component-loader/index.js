/**
 * Created by fed on 16/8/5.
 */
const assign = require('object-assign');
const path = require('path');
const loaderUtils = require('loader-utils');
const generators = require('./lib/generator');
const componentList = require('./lib/component-list');

const UPDATE_SAGA = '@@INNER/UPDATE_SAGA';
const { namespaceName } = require('./lib/babel-plugin-action-name-init');
const { namespaceName: reducerEnhanceName, enhanceName } = require('./lib/babel-plugin-reducer-enhance');
// @TODO how to improve the performance, may be by getter?
module.exports = function rrcLoader(request) {
  let resultRequest = request;
  const query = loaderUtils.getOptions(this) || {};
  const reducerName = query.reducerName || 'reducer';
  const componentDir = query.componentDir || 'components';
  const ctx = this;
  const namespace = path.dirname(path.relative(path.join(process.cwd(), 'src', componentDir), ctx.resourcePath));
  // console.log(query);
  // console.log(namespace);
  // console.log(reducerEnhanceName);
  if (query.types) {
    // process action in types.js
    console.log([`const ${namespaceName} = "/${namespace}/";`, request].join('\n'));
    return [`const ${namespaceName} = "/${namespace}/";`, request].join('\n');
  }
  if (ctx.resourcePath.endsWith(`/${reducerName}.js`)) {
    // process reducer in reducer.js
    let json;
    try {
      json = require(path.join(path.dirname(ctx.resourcePath), 'me.json'));
    } catch (e) {
      json = {};
    }
    if (json.mobx) {
      // process mobx
      return [
        `import ${enhanceName} from 'rrc-loader-helper/lib/mobx-adapter';`,
        `const ${reducerEnhanceName} = "${namespace}";`,
        request,
      ].join('\n');
    }
    // "route": "/:id?" ?
  }
  if (query.bundle) {
    return generators.bundle(reducerName, ctx);
  }
  const config = assign({
    externals: [],
    dir: path.join(process.cwd(), 'src', componentDir),
    index: 'list',
    reducers: '__ROOT_REDUCER__',
    saga: '__ROOT_SAGA__',
    component: '__ROOT_ROUTE__',
    UPDATE_SAGA,
    store: 'store',
    reducerInject: 'reducers',
    reducerName,
    reducerDecorator: '',
    retain: false,
  }, query);
  const items = ['reducers', 'saga', 'component'].filter(value => request.indexOf(config[value]) > -1);
  if (items.length > 0) {
    const components = componentList(config);
    console.log('components', components);
    this.addContextDependency(config.dir);
    items.forEach((value) => {
      const [componentVarList, componentImportList] = generators[value](components, config, ctx);
      resultRequest = componentImportList + resultRequest;
      resultRequest = resultRequest.replace(config[value], componentVarList);
    });
  }
  this.cacheable();
  return resultRequest;
};

exports.UPDATE_SAGA = UPDATE_SAGA;
