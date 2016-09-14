'use strict';

var postcss = require('postcss')
var dpr = require('./dpr')

module.exports = postcss.plugin('postcss-dpr', function (options) {
  return function (css, result) {
    result.root = postcss.parse(dpr(css.toString(), options))
  }
})
