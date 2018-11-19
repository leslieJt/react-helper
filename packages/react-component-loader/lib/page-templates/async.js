// @TODO Loading is hard code

function asyncPageCallback(resolve, page, jsonFilePath, fileName, store) {
  return require => {
    const { view, reducer, saga } = require(jsonFilePath);
    store.dispatch({ type: "@@INNER/UPDATE_SAGA", saga: saga });
    if (!reducers[page]) {
      reducers[page] = enhanceReducer(reducer, "b/a");
      store.replaceReducer(combineReducers(reducers));
    }
    resolve(view);
  };
}

module.exports = function fullAsyncPage(page) {
  const jsonFilePath = `./${page}/me.json`;
  const fileName = page.replace(/\//g, '_');

  return `
    Loadable({
      page: ${page},
      loading: Loading,
      loader: () => new Promise(resolve => require.ensure(["${jsonFilePath}"], fileName require => 
  `;
};