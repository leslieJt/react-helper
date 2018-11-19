/**
 * Created by fed on 2017/8/24.
 */
const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    app: ['babel-polyfill', './src/entry.jsx'],
    vendors: ['react', 'react-dom', 'redux', 'redux-saga',
      'react-redux', 'react-router-redux', 'react-router'],
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
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: ['babel-loader', {
          loader: path.join(__dirname, '..'),
          options: {
            externals: ['nav', 'login'],
            lazy: true,
            loading: 'Loading',
            reducerDecorator: 'reducerDecorator',
          }
        }],
        exclude: /node_modules/,
      },
      {
        test: /types\.js$/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [['es2015', {
              modules: false
            }]],
            plugins: [require('../lib/babel-plugin-action-name-init')]
          }
        }, {
          loader: path.join(__dirname, '..'),
          options: {
            types: true,
            root: path.join(__dirname, 'src')
          },
        }]
      },
      {
        test: /\/me\.json$/,
        use: ['babel-loader', {
          loader: path.join(__dirname, '..'),
          options: {
            bundle: true,
          }
        }],
        exclude: /node_modules/,
      },
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin(['vendors', 'manifest']),
  ],
};
