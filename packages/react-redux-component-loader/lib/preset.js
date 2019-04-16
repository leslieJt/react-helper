module.exports = function reactHelperPreset(api, options) {
  return {
    presets: [],
    plugins: [
      require('./babel-plugin-reducer-enhance'),
      require('./babel-plugin-router-transform'),
      [require('./babel-plugin-store-transform'), {
        storeName: options.storeName,
      }],
    ],
  };
};
