/*
 * Copyright(c) Oflane Software 2017. All Rights Reserved.
 */

require('./check-versions')()

process.env.NODE_ENV = 'production'
var ora = require('ora')
var rm = require('rimraf')
var chalk = require('chalk')
var webpack = require('webpack')
var webpackConfig = require('./webpack.lib')

var spinner = ora('building all lib for production...')
spinner.start()
rm('../lib', err => {
  if (err) throw err
  webpack(webpackConfig, function (err, stats) {
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n\n')
    console.log(chalk.cyan('  Build complete.\n'))
  })
})

