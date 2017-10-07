const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: './src/index.ejs',
  filename: 'index.html',
  inject: 'body',
});

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/,
      },
      {
        test: /\.csv$/,
        loader: 'csv-loader',
        options: {
          dynamicTyping: true,
          header: true,
          skipEmptyLines: true,
          delimiter: ',',
          newline: '\r',
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(['docs']),
    HtmlWebpackPluginConfig,
  ],
};


