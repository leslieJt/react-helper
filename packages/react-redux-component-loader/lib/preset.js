module.exports = function reactHelperPreset() {
  return {
    presets: [],
    plugins: [
      require('./babel-plugin-reducer-enhance'),
      require('./babel-plugin-router-transform'),
      require('./babel-plugin-store-transform'),
    ],
  };
};
