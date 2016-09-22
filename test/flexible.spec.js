'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var postcss = require('postcss');
var flexible = require('../index.js');

describe('postcss-flexible', function() {

  it('[default] should output right rem file', function() {
    var srcPath = path.join(__dirname, 'source.css');
    var srcText = fs.readFileSync(srcPath, {
      encoding: 'utf8'
    });
    var outputText = postcss().use(flexible({
      remUnit: 75
    })).process(srcText).css;
    var expectedText = fs.readFileSync(path.join(__dirname, 'output.css'), {
      encoding: 'utf8'
    });
    assert.equal(outputText.trim(), expectedText.trim());
  });

});
