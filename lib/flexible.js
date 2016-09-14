'use strict';

// from: https://github.com/songsiqi/px2rem

var css = require('css');
var extend = require('extend');

var defaultConfig = {
  baseDpr: 2,             // base device pixel ratio (default: 2)
  remUnit: 75,            // rem unit value (default: 75)
  remPrecision: 6         // rem value precision (default: 6)
};

var pxRegExp = /\b(\d+(\.\d+)?)px\b/;
var propRegExp = /^font(-size)?/;

// generate rem version stylesheet
module.exports = function (cssText, options) {
  var config = extend({}, defaultConfig, options);
  var astObj = css.parse(cssText);

  // get calculated value of px or rem
  function getCalcValue (type, value, dpr) {
    var pxGlobalRegExp = new RegExp(pxRegExp.source, 'g');

    function getValue(val) {
      val = parseFloat(val.toFixed(config.remPrecision)); // control decimal precision of the calculated value
      return val == 0 ? val : val + type;
    }

    return value.replace(pxGlobalRegExp, function ($0, $1) {
      return type === 'px' ? getValue($1 * dpr / config.baseDpr) : getValue($1 / config.remUnit);
    });
  };

  function processRules(rules, noDealPx) { // FIXME: keyframes do not support `force px` comment
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      if (rule.type === 'media') {
        processRules(rule.rules); // recursive invocation while dealing with media queries
        continue;
      } else if (rule.type === 'keyframes') {
        processRules(rule.keyframes, true); // recursive invocation while dealing with keyframes
        continue;
      } else if (rule.type !== 'rule' && rule.type !== 'keyframe') {
        continue;
      }

      if (!noDealPx) {
        // generate 3 new rules which has [data-dpr]
        var newRules = [];
        for (var dpr = 1; dpr <= 3; dpr++) {
          var newRule = {};
          newRule.type = rule.type;
          newRule.selectors = rule.selectors.map(function (sel) {
            return '[data-dpr="' + dpr + '"] ' + sel;
          });
          newRule.declarations = [];
          newRules.push(newRule);
        }
      }

      var declarations = rule.declarations;
      for (var j = 0; j < declarations.length; j++) {
        var declaration = declarations[j];
        // need transform: declaration && has 'px'
        if (declaration.type === 'declaration' &&
            propRegExp.test(declaration.property) &&
            pxRegExp.test(declaration.value)) {
          if (declaration.value === '0px') {
            declaration.value = '0';
            continue;
          }
          if (!noDealPx) {
            // generate 3 new declarations and put them in the new rules which has [data-dpr]
            for (var dpr = 1; dpr <= 3; dpr++) {
              var newDeclaration = {};
              extend(true, newDeclaration, declaration);
              newDeclaration.value = getCalcValue('px', newDeclaration.value, dpr);
              newRules[dpr - 1].declarations.push(newDeclaration);
            }
            declarations.splice(j, 1); // delete this rule
            j--;
          }
        }
      }

      // if the origin rule has no declarations, delete it
      if (!rules[i].declarations.length) {
        rules.splice(i, 1);
        i--;
      }

      if (!noDealPx) {
        // add the new rules which contain declarations that are forced to use px
        if (newRules[0].declarations.length) {
          rules.splice(i + 1, 0, newRules[0], newRules[1], newRules[2]);
          i += 3; // skip the added new rules
        }
      }
    }
  }

  processRules(astObj.stylesheet.rules);

  return css.stringify(astObj);
};
