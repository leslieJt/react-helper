/**
 * Created by fed on 2017/8/24.
 */
const path = require('path');



module.exports = {
  entry: {
    app: ['babel-polyfill', './src/entry.jsx'],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js',
    chunkFilename: '[name].[chunkhash].chunk.js',
    publicPath: 'dist/',
  },
  watch: true,
  devtool: 'inline-sourcemap',
  resolve: {
    alias: {
      react: path.join(__dirname, 'node_modules', 'react'),
      sheinq: path.join(__dirname, 'node_modules', 'sheinq'),
    },
    extensions: ['.', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: ['babel-loader', {
          loader: 'react-redux-component-loader',
          options: {
            externals: ['nav', 'login'],
            lazy: true,
            loading: 'Loading',
            reducerDecorator: 'reducerDecorator',
          },
        }],
        exclude: /node_modules/,
      },
      {
        test: /types\.js$/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [['@babel/env', {
              modules: false,
            }]],
            plugins: [require('react-redux-component-loader/lib/babel-plugin-action-name-init')],
          },
        }, {
          loader: 'react-redux-component-loader',
          options: {
            types: true,
            root: path.join(__dirname, 'src'),
          },
        }],
      },
      {
        test: /\/me\.json$/,
        type: 'javascript/auto',
        use: ['babel-loader', {
          loader: 'react-redux-component-loader',
          options: {
            bundle: true,
          },
        }],
        exclude: /node_modules/,
      },
    ],
  },
};
