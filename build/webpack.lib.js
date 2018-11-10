/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */
var path = require('path')
var webpack = require('webpack')
var ProgressBarPlugin = require('progress-bar-webpack-plugin')
var nodeExternals = require('webpack-node-externals')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}
module.exports = {
  mode: 'production',
  entry: {app: './src/index.js'},
  output: {
    path: path.resolve(process.cwd(), './lib'),
    publicPath: '/fansion-base/lib/',
    filename: 'fansion-base.js',
    chunkFilename: '[id].js',
    libraryTarget: 'umd',
    library: 'FansionBase',
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '~': resolve('src'),
      '@': resolve('src'),
      '@static': resolve('static')
    },
    modules: ['node_modules']
  },
  externals: [
    {
      vue: 'Vue',
      'vue-router': 'VueRouter',
    }, nodeExternals()
  ],
  module: {
    rules: [
      {
        test: /\.(jsx?|babel|es6)$/,
        include: path.resolve(process.cwd(), './src'),
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new ProgressBarPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ]
}
