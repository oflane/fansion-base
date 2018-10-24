/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */

var path = require('path');
var nodeExternals = require('webpack-node-externals');

function resolve (dir){
  return path.join(__dirname, '..', dir)
}

exports.externals = [{
  vue: 'vue'
}, nodeExternals()];

exports.alias = {
  'fansion-base': resolve('../'),
  '~': resolve('src'),
  '@': resolve('src'),
  '@static': resolve('static'),
};

exports.vue = {
  root: 'Vue',
  commonjs: 'vue',
  commonjs2: 'vue',
  amd: 'vue',
};
exports.jsexclude = /node_modules/;
