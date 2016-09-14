'use strict';

var postcss = require('postcss')
var flexible = require('./flexible')

module.exports = postcss.plugin('postcss-flexible', function (options) {
  return function (css, result) {
    result.root = postcss.parse(flexible(css.toString(), options))
  }
})
