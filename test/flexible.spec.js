'use strict';

var assert = require('assert')
var path = require('path')
var fs = require('fs')
var postcss = require('postcss')
var flexible = require('../index.js')

describe('postcss-flexible', function() {

  it('should output right css text', function() {
    var srcPath = path.join(__dirname, 'source.css')
    var srcText = fs.readFileSync(srcPath, {
      encoding: 'utf8'
    })
    var outputText = postcss().use(flexible()).process(srcText).css
    var expectedText = fs.readFileSync(path.join(__dirname, 'output.css'), {
      encoding: 'utf8'
    })
    assert.equal(outputText.trim(), expectedText.trim())
  })

  it('should output right css text for desktop', function() {
    var srcPath = path.join(__dirname, 'source.css')
    var srcText = fs.readFileSync(srcPath, {
      encoding: 'utf8'
    })
    var outputText = postcss().use(flexible({ desktop: true })).process(srcText).css
    var expectedText = fs.readFileSync(path.join(__dirname, 'output-desktop.css'), {
      encoding: 'utf8'
    })
    assert.equal(outputText.trim(), expectedText.trim())
  })

  it('should output right css text with addPrefixToSelector', function() {
    var srcPath = path.join(__dirname, 'source.css')
    var srcText = fs.readFileSync(srcPath, {
      encoding: 'utf8'
    })
    var outputText = postcss().use(flexible({ addPrefixToSelector: function(selector, prefix) {
      return prefix + ' > ' + selector
    } })).process(srcText).css
    var expectedText = fs.readFileSync(path.join(__dirname, 'output-custom.css'), {
      encoding: 'utf8'
    })
    assert.equal(outputText.trim(), expectedText.trim())
  })

  it('should output right css text with dprList', function() {
    var srcPath = path.join(__dirname, 'source.css')
    var srcText = fs.readFileSync(srcPath, {
      encoding: 'utf8'
    })
    var outputText = postcss().use(flexible({ dprList: [4, 2] })).process(srcText).css
    var expectedText = fs.readFileSync(path.join(__dirname, 'output-custom-2.css'), {
      encoding: 'utf8'
    })
    assert.equal(outputText.trim(), expectedText.trim())
  })

})
