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

  it('should output right css text with enableFontSetting', function() {
    var srcPath = path.join(__dirname, 'source.css')
    var srcText = fs.readFileSync(srcPath, {
      encoding: 'utf8'
    })
    const fontGear = [-1, 0, 1, 2, 3, 4]

    postcss().use(flexible({ enableFontSetting: true, fontGear: fontGear })).process(srcText).css
    // console.log(outputText)
    for (let i = -1, len = fontGear.length - 1; i < len; i++) {
      var outputText = fs.readFileSync(path.join(__dirname, 'fontGear/fontGear_' + i +'.css'), {
        encoding: 'utf8'
      })
      var expectedText = fs.readFileSync(path.join(__dirname, 'fontGearSource/fontGear_' + i +'.css'), {
        encoding: 'utf8'
      })
     assert.equal(outputText.trim(), expectedText.trim())
    }
  })
  it('should output right css text with enableFontSetting and addFontSizeToSelector', function() {
    var srcPath = path.join(__dirname, 'source.css')
    var srcText = fs.readFileSync(srcPath, {
      encoding: 'utf8'
    })
    const fontGear = [-1, 0, 1, 2, 3, 4]
    const addFontSizeToSelector = function (originFontSize, gear, baseDpr = 2) {
      return +originFontSize + gear*baseDpr*2
    }
    const output = postcss().use(flexible({ enableFontSetting: true, fontGear: fontGear, addFontSizeToSelector: addFontSizeToSelector })).process(srcText).css
    var expectedText = fs.readFileSync(path.join(__dirname, 'output.css'), {
      encoding: 'utf8'
    })
    assert.equal(output.trim(), expectedText.trim())
    for (let i = -1, len = fontGear.length - 1; i < len; i++) {
      var outputText = fs.readFileSync(path.join(__dirname, 'fontGear/fontGear_' + i +'.css'), {
        encoding: 'utf8'
      })
      var expectedText = fs.readFileSync(path.join(__dirname, 'fontGearCustom/fontGear_' + i +'.css'), {
        encoding: 'utf8'
      })
     assert.equal(outputText.trim(), expectedText.trim())
    }
  })
  it('should output right css text with enableFontSetting and custom output', function() {
    var srcPath = path.join(__dirname, 'source.css')
    var srcText = fs.readFileSync(srcPath, {
      encoding: 'utf8'
    })
    const fontGear = [-1, 0, 1, 2, 3, 4]
    var outputCSSFile = function(gear, clonedRoot) {
      gear !== undefined && fs.writeFileSync(path.join(__dirname, 'customFile/fontGear_' + gear +'.css'), clonedRoot, {
        encoding: 'utf8'
      })
    }
    postcss().use(flexible({ enableFontSetting: true, fontGear: fontGear, outputCSSFile: outputCSSFile })).process(srcText).css
    // console.log(outputText)
    for (let i = -1, len = fontGear.length - 1; i < len; i++) {
      var outputText = fs.readFileSync(path.join(__dirname, 'customFile/fontGear_' + i +'.css'), {
        encoding: 'utf8'
      })
      var expectedText = fs.readFileSync(path.join(__dirname, 'fontGearSource/fontGear_' + i +'.css'), {
        encoding: 'utf8'
      })
     assert.equal(outputText.trim(), expectedText.trim())
    }
  })
})
