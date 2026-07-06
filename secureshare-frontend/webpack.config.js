const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/main.jsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'static/js/[name].[contenthash].js' : 'static/js/[name].js',
      clean: true,
      publicPath: '/',
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    resolve: {
      extensions: ['.js', '.jsx'],
      alias: { '@': path.resolve(__dirname, 'src') },
    },
    module: {
      rules: [
        { test: /\.(js|jsx)$/, exclude: /node_modules/, use: 'babel-loader' },
        { test: /\.css$/, use: ['style-loader', 'css-loader', 'postcss-loader'] },
        { test: /\.(png|jpg|jpeg|gif|svg)$/i, type: 'asset/resource', generator: { filename: 'static/media/[name].[hash][ext]' } },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({ template: './public/index.html', favicon: false }),
      new Dotenv({ systemvars: true, safe: false }),
    ],
    devServer: { port: 3000, historyApiFallback: true, hot: true, open: true, client: { overlay: true } },
    optimization: { splitChunks: { chunks: 'all' } },
  };
};
