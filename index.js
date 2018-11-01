'use strict';

var postcss = require('postcss')
var path = require('path')
var fs = require('fs')

var valueRegExp = /(dpr|rem|url)\((.+?)(px)?\)/
var dprRegExp = /dpr\((\d+(?:\.\d+)?)px\)/

module.exports = postcss.plugin('postcss-flexible', function (options) {
  if (!options) {
    options = {}
  }

  return function (root, result) {
    var desktop = !!options.desktop
    var baseDpr = options.baseDpr || 2
    var remUnit = options.remUnit || 75
    var remPrecision = options.remPrecision || 6
    var enableFontSetting = options.enableFontSetting || false
    var fontGear = Object.prototype.toString.call(options.fontGear) === '[object Array]' ? options.fontGear : [-1, 0, 1, 2, 3, 4]
    var addPrefixToSelector = options.addPrefixToSelector || function (selector, prefix) {
      if (/^html/.test(selector)) {
        return selector.replace(/^html/, 'html' + prefix)
      }
      return prefix + ' ' + selector
    }
    var addFontSizeToSelector = function (originFontSize, gear, baseDpr) {
      if (!gear) {
        gear = 0
      }
      if (!enableFontSetting) {
        return originFontSize
      }
      if (options.addFontSizeToSelector) {
        return options.addFontSizeToSelector(originFontSize, gear, baseDpr)
      }
      return +originFontSize + gear*baseDpr
    }
    var outputCSSFile = options.outputCSSFile || function (gear, clonedRoot) {}
    var dprList = (options.dprList || [3, 2, 1]).sort().reverse()
    fontGear = fontGear.sort().reverse()
    var urlRegExp = new RegExp('url\\([\'"]?\\S+?@(' + dprList.join('|') + ')x\\S+?[\'"]?\\)')

    // get calculated value of px or rem
    function getCalcValue (value, dpr, gear) {
      var valueGlobalRegExp = new RegExp(valueRegExp.source, 'g')

      function getValue(val, type) {
        val = parseFloat(val.toFixed(remPrecision)) // control decimal precision of the calculated value
        return val == 0 ? val : val + type
      }
      return value.replace(valueGlobalRegExp, function ($0, $1, $2) {
        if ($1 === 'url') {
          if (dpr) {
            return 'url(' + $2.replace(new RegExp('@(' + dprList.join('|') + ')x', 'g'), '@' + dpr + 'x') + ')'
          }
        } else if ($1 === 'dpr') {
          if (dpr) {
            return getValue(addFontSizeToSelector($2, gear, baseDpr) * dpr / baseDpr, 'px')
          }
        } else if ($1 === 'rem') {
          return getValue($2 / remUnit, 'rem')
        }
        return $0
      })
    }

    function handleDesktop (rule) {
      rule.walkDecls(function (decl) {
        if (valueRegExp.test(decl.value)) {
          if (decl.value === '0px') {
            decl.value = '0'
          } else {
            if (dprRegExp.test(decl.value) || urlRegExp.test(decl.value)) {
              decl.value = getCalcValue(decl.value, baseDpr)
            } else {
              // only has rem()
              decl.value = getCalcValue(decl.value)
            }
          }
        }
      })
    }

    function handleMobile (rule, gear) {
      if (rule.selector.indexOf('[data-dpr="') !== -1) {
        return
      }
      var newRules = []
      var hasDecls = false

      for (var i = 0; i < dprList.length; i++) {
        var prefix = gear !== undefined ? '[data-dpr="' + dprList[i] + '"][data-fontgear="' + gear + '"]' :'[data-dpr="' + dprList[i] + '"]'
        var newRule = postcss.rule({
          selectors: rule.selectors.map(function (sel) {
            return addPrefixToSelector(sel, prefix)
          }),
          type: rule.type,
          customGear: gear
        })
        newRules.push(newRule)
      }

      rule.walkDecls(function (decl) {
        if (valueRegExp.test(decl.value)) {
          if (decl.value === '0px') {
            decl.value = '0'
          } else {
            if (dprRegExp.test(decl.value) || urlRegExp.test(decl.value)) {
              // generate 3 new decls and put them in the new rules which has [data-dpr]
              newRules.forEach(function (newRule, index) {
                var newDecl = postcss.decl({
                  prop: decl.prop,
                  value: getCalcValue(decl.value, dprList[index % dprList.length], newRule.customGear)
                })
                 // filter out background prop when walking the clonedRoot
                if (!/background/g.test(decl.prop) || (gear === undefined)) {
                  newRule.append(newDecl)
                }
              })
              hasDecls = true
              decl.remove() // delete this rule
            } else {
              // only has rem()
              decl.value = getCalcValue(decl.value)
            }
          }
        }
      })

      // if the updated rule is not empty, insert it into its parent Node
      if (hasDecls && newRule.nodes.length) {
        newRules.forEach(function (newRule) {
          rule.parent.insertAfter(rule, newRule)
        })
      }

      // if the origin rule has no declarations, delete it
      // delete the origin rules when walking the clonedRoot
      if (!rule.nodes.length || gear !== undefined) {
        rule.remove()
      }
    }
    if (enableFontSetting) {
      for (var j = 0; j < fontGear.length; j++) {
        var gear = fontGear[j]
        // clone the root element so that the operation blow won't distructe the origin root element
        var clonedRoot = root.clone()
        clonedRoot.walkRules(function (rule) {
          desktop ? handleDesktop(rule) : handleMobile(rule, gear)
        })
        clonedRoot.walkAtRules(function(atRule) {
          if (!atRule.nodes.length) {
            atRule.remove()
          }
        })
        // output the css file with different fontGear
        outputCSSFile(gear, clonedRoot)
      }
    }
    root.walkRules(function (rule) {
      desktop ? handleDesktop(rule) : handleMobile(rule)
    })
  }
})
