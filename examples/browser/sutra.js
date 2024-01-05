(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.SUTRA = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Sutra", {
  enumerable: true,
  get: function get() {
    return _sutra["default"];
  }
});
exports.createSutra = createSutra;
var _sutra = _interopRequireDefault(require("./lib/sutra.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function createSutra() {
  return new _sutra["default"]();
}

},{"./lib/sutra.js":11}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = evaluateCompositeCondition;
function evaluateCompositeCondition(conditionObj, data, gameState) {
  var _this = this;
  var targetData;
  if (typeof data === 'function') {
    targetData = data(gameState);
  } else {
    targetData = data;
  }
  switch (conditionObj.op) {
    case 'and':
      return conditionObj.conditions.every(function (cond) {
        return _this.evaluateCondition(cond, targetData, gameState);
      });
    case 'or':
      return conditionObj.conditions.some(function (cond) {
        return _this.evaluateCondition(cond, targetData, gameState);
      });
    case 'not':
      // Assuming 'not' operator has a single condition
      return !this.evaluateCondition(conditionObj.conditions, targetData, gameState);
    default:
      return false;
  }
}

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = evaluateCondition;
function evaluateCondition(condition, data, gameState) {
  var sutra = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : this;
  var targetData;
  if (typeof data === 'function') {
    targetData = data(gameState);
  } else {
    targetData = data;
  }

  // Use the provided Sutra's conditions or default to the current Sutra's conditions
  var conditions = sutra.conditions;
  if (typeof condition === 'string') {
    var conditionEntry = sutra.conditions[condition];

    // If not found in the subtree, check in the main Sutra
    if (!conditionEntry) {
      conditionEntry = this.conditions[condition];
    }
    if (!conditionEntry) {
      // if not found, return false ( for now sub-tree issue )
      // return false;
    }
    if (conditionEntry) {
      if (Array.isArray(conditionEntry)) {
        return conditionEntry.every(function (cond) {
          return typeof cond.func === 'function' ? cond.func(targetData, gameState) : sutra.evaluateDSLCondition(cond.original, targetData, gameState);
        });
      } else if (['and', 'or', 'not'].includes(conditionEntry.op)) {
        // Handling composite conditions
        return sutra.evaluateCompositeCondition(conditionEntry, targetData, gameState);
      } else {
        return sutra.evaluateSingleCondition(conditionEntry, targetData, gameState);
      }
    } else {
      console.log('Warning: Condition not found: ' + condition + '. About to throw an error.\nPlease define the missing condition in your sutra script.');
      throw new Error("Condition \"".concat(condition, "\" not found"));
    }
  } else if (typeof condition === 'function') {
    return condition(targetData, gameState);
  } else if (Array.isArray(condition)) {
    return condition.every(function (cond) {
      return sutra.evaluateCondition(cond, targetData, gameState);
    });
  }
  return false;
}

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = evaluateDSLCondition;
function evaluateDSLCondition(conditionObj, data, gameState) {
  var _this = this;
  var operator = this.resolveOperator(conditionObj.op);
  var targetData;
  if (typeof data === 'function') {
    targetData = data(gameState);
  } else {
    targetData = data;
  }
  var targetValue;
  if (conditionObj.gamePropertyPath) {
    // Use getNestedValue for deeply nested properties in gameState
    targetValue = this.getNestedValue(gameState, conditionObj.gamePropertyPath);
  } else if (conditionObj.gameProperty) {
    // Use gameState for top-level properties
    targetValue = gameState[conditionObj.gameProperty];
  } else {
    // Use data for entity properties
    targetValue = targetData[conditionObj.property];
  }
  if (typeof targetValue === 'undefined') {
    targetValue = 0;
  }
  switch (operator) {
    case 'lessThan':
      return targetValue < conditionObj.value;
    case 'greaterThan':
      return targetValue > conditionObj.value;
    case 'equals':
      return targetValue === conditionObj.value;
    case 'notEquals':
      return targetValue !== conditionObj.value;
    case 'lessThanOrEqual':
      return targetValue <= conditionObj.value;
    case 'greaterThanOrEqual':
      return targetValue >= conditionObj.value;
    case 'and':
      return conditionObj.conditions.every(function (cond) {
        return _this.evaluateDSLCondition(cond, targetData, gameState);
      });
    case 'or':
      return conditionObj.conditions.some(function (cond) {
        return _this.evaluateDSLCondition(cond, targetData, gameState);
      });
    case 'not':
      return !this.evaluateDSLCondition(conditionObj.condition, targetData, gameState);
    default:
      return false;
  }
}

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = evaluateSingleCondition;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function evaluateSingleCondition(condition, data, gameState) {
  // logger('Evaluating condition', condition, data);

  var targetData;
  if (typeof data === 'function') {
    targetData = data(gameState);
  } else {
    targetData = data;
  }
  if (typeof condition === 'string') {
    var conditionEntry = this.conditions[condition];
    if (conditionEntry) {
      // Handle composite conditions
      if (['and', 'or', 'not'].includes(conditionEntry.op)) {
        return this.evaluateCompositeCondition(conditionEntry, targetData, gameState);
      }

      // Handle named function conditions
      if (typeof conditionEntry === 'function') {
        return conditionEntry(targetData, gameState); // Pass gameState here
      }

      // Handle DSL conditions
      if (_typeof(conditionEntry.original) === 'object') {
        return this.evaluateDSLCondition(conditionEntry.original, targetData, gameState); // Pass gameState here
      }
    }
  }

  // Handle direct function conditions
  if (typeof condition === 'function') {
    return condition(targetData, gameState); // Pass gameState here
  }

  // Handle if condition is array of conditions
  /* Remark: needs tests before we should add this, may be working already
  if (Array.isArray(condition)) {
    return condition.every(cond => this.evaluateCondition(cond, targetData, gameState)); // Pass gameState here
  }
  */

  // logger('Evaluating unrecognized condition');
  return false;
}

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exportToEnglish;
var _i18n = _interopRequireDefault(require("./i18n.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
// Custom function to format data in a readable manner
var formatData = function formatData(data, indent) {
  if (_typeof(data) !== 'object' || data === null) {
    return "".concat(indent).concat(data);
  }
  return Object.entries(data).map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      key = _ref2[0],
      value = _ref2[1];
    var stringValue = '';
    if (typeof value === 'function') {
      // Get function name from value
      stringValue = "".concat(value.name, "()");
    } else if (_typeof(value) === 'object' && value !== null) {
      // Format nested object
      var nestedIndent = indent + '  ';
      stringValue = "\n".concat(formatData(value, nestedIndent));
    } else {
      // Handle non-object values
      stringValue = value;
    }
    return "".concat(indent).concat(key, ": ").concat(stringValue);
  }).join('\n');
};
function exportToEnglish() {
  var _this = this;
  var indentLevel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var lang = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'en';
  var langKeywords = _i18n["default"][lang] || _i18n["default"].en; // Fallback to English if the language is not found
  var conditionDescriptions = '';
  var describeAction = function describeAction(node, indentLevel) {
    var currentIndent = ' '.repeat(indentLevel * 2);
    var nextIndent = ' '.repeat(indentLevel * 2);
    var withIndent = ' '.repeat(indentLevel * 2 + 2); // Indent for "with" label
    var dataIndent = ' '.repeat((indentLevel + 2) * 2); // Indent for data

    var output = '';
    if (node.action) {
      return "".concat(currentIndent).concat(node.action);
    } else if (node["if"]) {
      var ifString;
      if (Array.isArray(node["if"])) {
        ifString = node["if"].join(" ".concat(langKeywords.andKeyword, " "));
      } else {
        ifString = node["if"];
      }
      var description = "".concat(currentIndent).concat(langKeywords.ifKeyword, " ").concat(ifString);

      // Process 'then' block
      if (node.then) {
        var thenDescription = node.then.map(function (childNode) {
          var childDesc = describeAction(childNode, indentLevel + 1);
          if (childNode.data) {
            childDesc += "\n".concat(formatData(childNode.data, dataIndent));
          }
          return childDesc;
        }).join('\n');
        description += "\n".concat(thenDescription);
      }

      // Process 'else' block
      if (node["else"]) {
        var elseDescription = node["else"].map(function (childNode) {
          var childDesc = describeAction(childNode, indentLevel + 1);
          if (childNode.data) {
            childDesc += "\n".concat(formatData(childNode.data, dataIndent));
          }
          return childDesc;
        }).join('\n');
        description += "\n".concat(currentIndent).concat(langKeywords.elseKeyword, "\n").concat(elseDescription);
      }
      output += description;
    }
    if (node.subtree) {
      var subtree = _this.subtrees[node.subtree];
      if (subtree) {
        // Recursively call exportToEnglish for the subtree
        output += "".concat(currentIndent, " @").concat(node.subtree, "=>\n").concat(exportToEnglish.call(subtree, indentLevel + 1, lang));
      }
      // If the subtree is not found, return a placeholder message
      // output += `${currentIndent}${langKeywords.subtreeKeyword} ${node.subtree} (not found)`;
    }

    // Combine actions and conditions descriptions
    //let output = this.tree.map(node => describeAction(node, indentLevel, this)).join('\n');
    // Remark: this will expand *all conditions* inline, which is not ideal, but useful as a config setting
    /*
    for (let c in this.originalConditions) {
      let condition = this.originalConditions[c];
      output += `\n\n${c}:\n  ${describeCondition(condition)}`;
    }
    */

    // Add an extra newline for root nodes
    if (indentLevel === 0) {
      output += '\n';
    }
    return output;
  };
  var describeCondition = function describeCondition(condition) {
    // Handle condition if it's a function
    if (typeof condition === 'function') {
      return condition.toString();
    }

    // Handle condition if it's an array of conditions
    if (Array.isArray(condition)) {
      return condition.map(function (cond) {
        return describeCondition(cond);
      }).join(' and ');
    }

    // Handle condition if it's an object
    if (_typeof(condition) === 'object' && condition !== null) {
      switch (condition.op) {
        case 'eq':
          return "".concat(condition.property, " equals ").concat(condition.value);
        case 'lessThan':
          return "".concat(condition.property, " less than ").concat(condition.value);
        case 'greaterThan':
          return "".concat(condition.property, " greater than ").concat(condition.value);
        case 'and':
          return "all of (".concat(condition.conditions.map(function (cond) {
            return describeCondition(cond);
          }).join(', '), ") are true");
        case 'or':
          return "any of (".concat(condition.conditions.map(function (cond) {
            return describeCondition(cond);
          }).join(', '), ") is true");
        case 'not':
          return "not (".concat(describeCondition(condition.conditions), ")");
        // Add more cases as needed for other operators
        default:
          // console.log('calling default', condition)
          return JSON.stringify(condition);
      }
    }
    return JSON.stringify(condition);
  };

  // handle subtrees when this.tree is empty
  // TODO: add case for root + subtrees
  if (!this.tree || this.tree.length === 0 && this.subtrees) {
    var subtreeOutputs = Object.keys(this.subtrees).map(function (subtreeKey) {
      var subtree = _this.subtrees[subtreeKey];
      return "@".concat(subtreeKey, "=>\n").concat(exportToEnglish.call(subtree, indentLevel + 1, lang));
    });
    return subtreeOutputs.join('\n') + '\n' + conditionDescriptions;
  }

  // Existing logic for handling this.tree
  return this.tree.map(function (node) {
    return describeAction(node, indentLevel);
  }).join('\n').concat('') + '\n' + conditionDescriptions;
  //return this.tree.map(node => describeAction(node, indentLevel)).join('\n').concat('') + '\n' + conditionDescriptions;
}

},{"./i18n.js":7}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
// Example language configuration object
var languageConfig = {
  en: {
    // English
    ifKeyword: "if",
    thenKeyword: "then",
    elseKeyword: "else",
    andKeyword: "and",
    subtreeKeyword: "subtree"
    // Add more keywords or phrases as needed
  },

  zh: {
    // Mandarin
    ifKeyword: "如果",
    // Rúguǒ
    thenKeyword: "那么",
    // Nàme
    elseKeyword: "否则",
    // Fǒuzé
    andKeyword: "和",
    // Hé
    subtreeKeyword: "子树" // Zǐshù
  },

  ja: {
    // Japanese
    ifKeyword: "もし",
    // Moshi
    thenKeyword: "ならば",
    // Naraba
    elseKeyword: "それ以外",
    // Sore igai
    andKeyword: "と",
    // To
    subtreeKeyword: "サブツリー" // Sabutsurī
  }
  // You can add more languages here
};
var _default = exports["default"] = languageConfig;

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _default = exports["default"] = {
  eq: 'equals',
  '==': 'equals',
  neq: 'notEquals',
  '!=': 'notEquals',
  lt: 'lessThan',
  '<': 'lessThan',
  lte: 'lessThanOrEqual',
  '<=': 'lessThanOrEqual',
  gt: 'greaterThan',
  '>': 'greaterThan',
  gte: 'greaterThanOrEqual',
  '>=': 'greaterThanOrEqual',
  '&&': 'and',
  '||': 'or',
  '!': 'not'
};

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = parsePath;
function parsePath(path) {
  return path.split('.').reduce(function (acc, part) {
    var arrayMatch = part.match(/([^\[]+)(\[\d+\])?/);
    if (arrayMatch) {
      acc.push(arrayMatch[1]);
      if (arrayMatch[2]) {
        acc.push(parseInt(arrayMatch[2].replace(/[\[\]]/g, '')));
      }
    }
    return acc;
  }, []);
}

},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = serializeToJson;
var _excluded = ["parent"];
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function serializeToJson() {
  var serializedData = {
    tree: this.tree.map(function (node) {
      return serializeNode(node);
    }),
    conditions: {}
  };

  // Serialize the DSL part of conditions correctly
  for (var key in this.conditions) {
    if (typeof this.conditions[key] === 'function') {
      serializedData.conditions[key] = _typeof(this.conditions[key].original) === 'object' ? this.conditions[key].original : {
        type: 'customFunction'
      };
    }
  }
  return JSON.stringify(serializedData, null, 2);
}

// Helper function to serialize a single node
function serializeNode(node) {
  var parent = node.parent,
    serializedNode = _objectWithoutProperties(node, _excluded); // Exclude the parent property

  // Recursively serialize 'then' and 'else' branches
  if (serializedNode.then && Array.isArray(serializedNode.then)) {
    serializedNode.then = serializedNode.then.map(function (childNode) {
      return serializeNode(childNode);
    });
  }
  if (serializedNode["else"] && Array.isArray(serializedNode["else"])) {
    serializedNode["else"] = serializedNode["else"].map(function (childNode) {
      return serializeNode(childNode);
    });
  }
  return serializedNode;
}

},{}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _exportToEnglish = _interopRequireDefault(require("./exportToEnglish.js"));
var _serializeToJson = _interopRequireDefault(require("./serializeToJson.js"));
var _evaluateCondition = _interopRequireDefault(require("./evaluateCondition.js"));
var _evaluateSingleCondition = _interopRequireDefault(require("./evaluateSingleCondition.js"));
var _evaluateDSLCondition = _interopRequireDefault(require("./evaluateDSLCondition.js"));
var _evaluateCompositeCondition = _interopRequireDefault(require("./evaluateCompositeCondition.js"));
var _parsePath = _interopRequireDefault(require("./parsePath.js"));
var _operatorAliases = _interopRequireDefault(require("./operatorAliases.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var logger = function logger() {};
// logger = console.log.bind(console);
var Sutra = /*#__PURE__*/function () {
  function Sutra() {
    _classCallCheck(this, Sutra);
    this.tree = [];
    this.conditions = {};
    this.listeners = {};
    this.maps = {};
    this.operators = ['equals', 'notEquals', 'greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual', 'and', 'or', 'not'];
    this.operatorAliases = _operatorAliases["default"];
    this.exportToEnglish = _exportToEnglish["default"];
    this.serializeToJson = _serializeToJson["default"];
    this.toJSON = _serializeToJson["default"];
    this.toEnglish = _exportToEnglish["default"];
    this.evaluateCondition = _evaluateCondition["default"];
    this.evaluateSingleCondition = _evaluateSingleCondition["default"];
    this.evaluateDSLCondition = _evaluateDSLCondition["default"];
    this.evaluateCompositeCondition = _evaluateCompositeCondition["default"];
    this.parsePath = _parsePath["default"];
    this.nodeIdCounter = 0; // New property to keep track of node IDs
  }
  _createClass(Sutra, [{
    key: "use",
    value: function use(subSutra, name) {
      var _this = this;
      var insertAt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.tree.length;
      var shareListeners = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      // Store a reference to the subSutra for subtree-specific logic
      this.subtrees = this.subtrees || {};
      subSutra.isSubtree = true;
      subSutra.parent = this;
      this.subtrees[name] = subSutra;
      if (shareListeners) {
        this.sharedListeners = true;

        // Merge subtree's listeners into the main tree's listeners
        this.listeners = _objectSpread(_objectSpread({}, this.listeners), subSutra.listeners);
        this.anyListeners = [].concat(_toConsumableArray(this.anyListeners || []), _toConsumableArray(subSutra.anyListeners || []));

        // Optionally, update the subtree's listeners to reflect this change
        // This ensures that both the subtree and main tree have the same set of listeners
        subSutra.listeners = this.listeners;
        subSutra.anyListeners = this.anyListeners;
      }

      // Integrate conditions from the subSutra
      Object.entries(subSutra.conditions).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          conditionName = _ref2[0],
          condition = _ref2[1];
        if (_this.conditions[conditionName]) {
          console.warn("Condition '".concat(conditionName, "' from subtree '").concat(name, "' will overwrite an existing condition in the main Sutra."));
        }
        _this.addCondition(conditionName, condition);
      });

      // always combine conditions from subtrees
      subSutra.conditions = _objectSpread(_objectSpread({}, this.conditions), subSutra.conditions);
    }
  }, {
    key: "on",
    value: function on(event, listener) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(listener);
    }
  }, {
    key: "emit",
    value: function emit(event) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      // Emit to the current instance's listeners
      this.emitLocal.apply(this, [event].concat(args));

      // If this instance is a subtree and sharedListeners is true, propagate to the parent tree
      if (this.isSubtree && this.sharedListeners && this.parent) {
        var _this$parent;
        (_this$parent = this.parent).emitShared.apply(_this$parent, [event].concat(args));
      }
    }
  }, {
    key: "emitLocal",
    value: function emitLocal(event) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }
      // Trigger all listeners for this specific event
      if (this.listeners[event]) {
        this.listeners[event].forEach(function (listener) {
          return listener.apply(void 0, args);
        });
      }
      // Trigger all 'any' listeners, regardless of the event type
      if (this.anyListeners) {
        this.anyListeners.forEach(function (listener) {
          return listener.apply(void 0, [event].concat(args));
        });
      }
    }
  }, {
    key: "emitShared",
    value: function emitShared(event) {
      for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }
      // Emit to main tree's listeners
      if (this.listeners[event]) {
        this.listeners[event].forEach(function (listener) {
          return listener.apply(void 0, args);
        });
      }
      if (this.anyListeners) {
        this.anyListeners.forEach(function (listener) {
          return listener.apply(void 0, [event].concat(args));
        });
      }
      // Additionally, emit to each subtree's listeners
      Object.values(this.subtrees).forEach(function (subtree) {
        if (subtree.listeners[event]) {
          subtree.listeners[event].forEach(function (listener) {
            return listener.apply(void 0, args);
          });
        }
        if (subtree.anyListeners) {
          subtree.anyListeners.forEach(function (listener) {
            return listener.apply(void 0, [event].concat(args));
          });
        }
      });
    }
  }, {
    key: "onAny",
    value: function onAny(listener) {
      // Initialize the anyListeners array if it doesn't exist
      this.anyListeners = this.anyListeners || [];
      this.anyListeners.push(listener);
    }
  }, {
    key: "if",
    value: function _if() {
      var conditions = Array.from(arguments); // Convert arguments to an array
      var lastNode = this.tree.length > 0 ? this.tree[this.tree.length - 1] : null;
      if (lastNode && !lastNode.then) {
        // If the last node exists and doesn't have a 'then', add conditions to it
        if (!Array.isArray(lastNode["if"])) {
          lastNode["if"] = [lastNode["if"]];
        }
        lastNode["if"] = lastNode["if"].concat(conditions);
      } else {
        // Create a new node
        var node = {
          "if": conditions.length > 1 ? conditions : conditions[0]
        };
        this.addAction(node);
      }
      return this; // Return this for chaining
    }
  }, {
    key: "then",
    value: function then(actionOrFunction) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var lastNode = this.tree[this.tree.length - 1];
      if (!lastNode.then) {
        lastNode.then = [];
      }
      if (typeof actionOrFunction === 'function') {
        // Create a scoped context
        var scopedContext = {
          "if": function _if(condition) {
            var node = {
              "if": condition,
              then: []
            };
            node.sutraPath = "".concat(lastNode.sutraPath, ".then[").concat(lastNode.then.length, "]");
            lastNode.then.push(node);
            return scopedContext; // Allow chaining within the scoped context
          },

          then: function then(action) {
            var node = lastNode.then[lastNode.then.length - 1];
            if (!node.then) {
              node.then = [];
            }
            var actionNode = {
              action: action
            };
            actionNode.sutraPath = "".concat(node.sutraPath, ".then[").concat(node.then.length, "]");
            node.then.push(actionNode);
            return scopedContext;
          },
          "else": function _else(action) {
            var node = lastNode.then[lastNode.then.length - 1];
            if (!node["else"]) {
              node["else"] = [];
            }
            var actionNode = {
              action: action
            };
            actionNode.sutraPath = "".concat(node.sutraPath, ".else[").concat(node["else"].length, "]");
            node["else"].push(actionNode);
            return scopedContext;
          },
          map: function map(name) {
            // Add the map node to the last 'then' node
            var mapNode = {
              map: name
            };
            lastNode.then.push(mapNode);
            return scopedContext; // Allow chaining within the scoped context
          }
        };

        // Execute the function in the scoped context
        actionOrFunction(scopedContext);
      } else {
        // check see if string matches name of known subtree
        var subSutra;
        if (this.subtrees) {
          subSutra = this.subtrees[actionOrFunction];
        }
        var actionNode = {};
        if (data) {
          actionNode.data = data;
        }
        if (subSutra) {
          // If it's a subtree, add a subtree node
          lastNode.subtree = actionOrFunction;
          delete lastNode.then;
        } else {
          // Otherwise, add an action node
          actionNode.action = actionOrFunction;
          actionNode.sutraPath = "".concat(lastNode.sutraPath, ".then[").concat(lastNode.then.length, "]");
          lastNode.then.push(actionNode);
        }
      }
      return this; // Return this for chaining
    }
  }, {
    key: "else",
    value: function _else(actionOrFunction) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var lastNode = this.tree[this.tree.length - 1];
      if (!lastNode["else"]) {
        lastNode["else"] = [];
      }
      if (typeof actionOrFunction === 'function') {
        // Create a scoped context for else
        var scopedContext = {
          "if": function _if(condition) {
            var node = {
              "if": condition,
              then: [],
              "else": []
            };
            lastNode["else"].push(node);
            return scopedContext; // Allow chaining within the scoped context
          },

          then: function then(action) {
            var node = lastNode["else"][lastNode["else"].length - 1];
            if (!node.then) {
              node.then = [];
            }
            node.then.push({
              action: action,
              data: data
            });
            return scopedContext;
          },
          "else": function _else(action) {
            var node = lastNode["else"][lastNode["else"].length - 1];
            if (!node["else"]) {
              node["else"] = [];
            }
            node["else"].push({
              action: action,
              data: data
            });
            return scopedContext;
          }
        };
        // Execute the function in the scoped context
        actionOrFunction(scopedContext);
      } else {
        lastNode["else"].push({
          action: actionOrFunction,
          data: data
        });
      }
      return this; // Return this for chaining
    }
  }, {
    key: "addMap",
    value: function addMap(name, mapFunction) {
      var mapNode = {
        map: name,
        func: mapFunction
      };
      this.maps[name] = mapNode;
      this.generateSutraPath(mapNode, 'tree', this.tree.length - 1, null);
    }

    // Method to execute a map node
  }, {
    key: "executeMap",
    value: function executeMap(mapNode, data, gameState) {
      if (typeof mapNode.func === 'function') {
        // Execute the map function and update data and gameState accordingly
        var result = mapNode.func(data, gameState);
        if (result !== undefined) {
          // Update data and gameState if result is returned
          return result;
        }
      }
      return data; // Return original data if no transformation occurred
    }

    // Fluent API for map
  }, {
    key: "map",
    value: function map(name) {
      var lastNode = this.tree[this.tree.length - 1];

      // If there's no last 'then' node or it's a placeholder, create a new node
      if (!lastNode) {
        lastNode = {
          then: []
        };
        // lastNode.then.push(lastThenNode);
      }

      if (!lastNode.then) {
        lastNode.then = [];
      }

      // Add the map node to the last 'then' node
      var mapNode = {
        map: name
      };
      lastNode.then.push(mapNode);
      return this; // Allow chaining within the scoped context
    }
  }, {
    key: "addAction",
    value: function addAction(node) {
      this.tree.push(node);
      this.generateSutraPath(node, 'tree', this.tree.length - 1, null);
    }
  }, {
    key: "addCondition",
    value: function addCondition(name, conditionObj) {
      var _this2 = this;
      this.originalConditions = this.originalConditions || {};
      if (Array.isArray(conditionObj)) {
        this.conditions[name] = conditionObj.map(function (cond) {
          if (typeof cond === 'function') {
            _this2.originalConditions[name] = _this2.originalConditions[name] || [];
            _this2.originalConditions[name].push({
              type: 'function',
              func: cond
            });
            return {
              func: function func(data, gameState) {
                return cond(data, gameState);
              },
              original: null
            };
          } else {
            _this2.originalConditions[name] = _this2.originalConditions[name] || [];
            _this2.originalConditions[name].push(cond);
            var conditionFunc = function conditionFunc(data, gameState) {
              return _this2.evaluateDSLCondition(cond, data, gameState);
            };
            return {
              func: conditionFunc,
              original: cond
            };
          }
        });
      } else {
        this.storeSingleCondition(name, conditionObj);
      }
    }
  }, {
    key: "removeCondition",
    value: function removeCondition(name) {
      if (this.conditions[name]) {
        delete this.conditions[name];
        if (this.originalConditions && this.originalConditions[name]) {
          delete this.originalConditions[name];
        }
        return true;
      }
      return false; // Condition name not found
    }
  }, {
    key: "updateCondition",
    value: function updateCondition(name, newConditionObj) {
      var _this3 = this;
      if (!this.conditions[name]) {
        return false;
      }
      // If the new condition is a function, update directly
      if (typeof newConditionObj === 'function') {
        this.conditions[name] = newConditionObj;
      } else if (_typeof(newConditionObj) === 'object') {
        // Handle if newConditionObj is an array
        if (Array.isArray(newConditionObj)) {
          // Update each condition in the array
          newConditionObj.forEach(function (condition) {
            if (condition.op === 'and' || condition.op === 'or' || condition.op === 'not') {
              // Composite condition for each element in the array
              var conditionFunc = function conditionFunc(data, gameState) {
                return _this3.evaluateDSLCondition(condition, data, gameState);
              };
              conditionFunc.original = condition;
              _this3.conditions[name] = conditionFunc;
            } else {
              // DSL condition for each element in the array
              var _conditionFunc = function _conditionFunc(data, gameState) {
                return _this3.evaluateDSLCondition(condition, data, gameState);
              };
              _conditionFunc.original = condition;
              _this3.conditions[name] = _conditionFunc;
            }
          });
        } else if (newConditionObj.op === 'and' || newConditionObj.op === 'or' || newConditionObj.op === 'not') {
          // Composite condition
          var conditionFunc = function conditionFunc(data, gameState) {
            return _this3.evaluateDSLCondition(newConditionObj, data, gameState);
          };
          conditionFunc.original = newConditionObj;
          this.conditions[name] = conditionFunc;
        } else {
          // DSL condition
          var _conditionFunc2 = function _conditionFunc2(data, gameState) {
            return _this3.evaluateDSLCondition(newConditionObj, data, gameState);
          };
          _conditionFunc2.original = newConditionObj;
          this.conditions[name] = _conditionFunc2;
        }
      } else {
        return false;
      }
      // Update original conditions for GUI use
      this.originalConditions[name] = newConditionObj;
      return true;
    }
  }, {
    key: "storeSingleCondition",
    value: function storeSingleCondition(name, conditionObj) {
      var _this4 = this;
      // Store the original condition object separately for GUI use
      if (!(typeof conditionObj === 'function' && conditionObj.original)) {
        this.originalConditions = this.originalConditions || {};
        this.originalConditions[name] = conditionObj;
      }
      if (conditionObj.op === 'and' || conditionObj.op === 'or' || conditionObj.op === 'not') {
        // Store composite conditions directly
        this.conditions[name] = conditionObj;
        this.originalConditions[name] = conditionObj;
      } else if (typeof conditionObj === 'function') {
        // Wrap custom function conditions to include gameState
        this.conditions[name] = function (data, gameState) {
          var val = false;
          try {
            val = conditionObj(data, gameState);
          } catch (err) {
            // console.log('warning: error in condition function', err)
          }
          return val;
        };
      } else {
        // For DSL conditions, pass gameState to the evaluateDSLCondition function
        var conditionFunc = function conditionFunc(data, gameState) {
          return _this4.evaluateDSLCondition(conditionObj, data, gameState);
        };
        conditionFunc.original = conditionObj;
        this.conditions[name] = conditionFunc;
      }
    }
  }, {
    key: "resolveOperator",
    value: function resolveOperator(operator) {
      return this.operatorAliases[operator] || operator;
    }

    // Method to set or update aliases
  }, {
    key: "setOperatorAlias",
    value: function setOperatorAlias(alias, operator) {
      this.operatorAliases[alias] = operator;
    }
  }, {
    key: "getConditionFunction",
    value: function getConditionFunction(name) {
      return this.conditions[name];
    }
  }, {
    key: "getCondition",
    value: function getCondition(name) {
      return this.originalConditions ? this.originalConditions[name] : undefined;
    }
  }, {
    key: "getOperators",
    value: function getOperators() {
      return Object.keys(this.operatorAliases);
    }
  }, {
    key: "traverseNode",
    value: function traverseNode(node, data, gameState) {
      var mappedData = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      if (node.subtree) {
        var subSutra = this.subtrees[node.subtree];
        if (subSutra) {
          var _conditionMet = node["if"] ? this.evaluateCondition(node["if"], data, gameState, subSutra) : true;
          if (_conditionMet) {
            subSutra.tick(data, gameState);
          }
        } else {
          console.warn("Subtree '".concat(node.subtree, "' not found."));
        }
        return;
      }

      // Use mappedData if available, otherwise use the original data
      var currentData = mappedData || data;

      // Process the map node if present
      if (node.map) {
        var map = this.maps[node.map];
        if (!map) {
          throw new Error("Map \"".concat(node.map, "\" not found"));
        }
        var newMappedData = this.executeMap(map, currentData, gameState);
        if (newMappedData !== undefined) {
          mappedData = newMappedData;
        }
      }

      // Execute action if present
      if (node.action) {
        this.executeAction(node.action, mappedData || currentData, node, gameState);
        return;
      }
      var conditionMet = node["if"] ? this.evaluateCondition(node["if"], mappedData || currentData, gameState) : true;
      if (conditionMet) {
        this.processBranch(node.then, mappedData || currentData, gameState, mappedData);
      } else {
        this.processBranch(node["else"], mappedData || currentData, gameState, mappedData);
      }
    }
  }, {
    key: "processBranch",
    value: function processBranch(branch, data, gameState) {
      var _this5 = this;
      var mappedData = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      if (Array.isArray(branch)) {
        branch.forEach(function (childNode) {
          return _this5.traverseNode(childNode, data, gameState, mappedData);
        });
      }
    }
  }, {
    key: "executeAction",
    value: function executeAction(action, data, node, gameState) {
      var object = {};
      if (!node.data) {
        node.data = {};
      }
      var entityData = data;
      Object.entries(entityData).forEach(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
          key = _ref4[0],
          value = _ref4[1];
        // check data to see if any of the keys at the first level are functions
        // if so, execute them and replace the value with the result
        // this is to allow for dynamic data to be passed to the action
        if (typeof value === 'function') {
          object[key] = value(entityData, gameState, node);
        } else {
          object[key] = value;
        }
      });
      Object.entries(node.data).forEach(function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
          key = _ref6[0],
          value = _ref6[1];
        if (typeof value === 'function') {
          object[key] = value(entityData, gameState, node);
        } else {
          object[key] = value;
        }
      });
      var mergedData = object;
      this.emit(action, mergedData, node, gameState);
    }
  }, {
    key: "updateEntity",
    value: function updateEntity(entity, updateData, gameState) {
      Object.entries(updateData).forEach(function (_ref7) {
        var _ref8 = _slicedToArray(_ref7, 2),
          key = _ref8[0],
          value = _ref8[1];
        if (typeof value === 'function') {
          entity[key] = value();
        } else {
          entity[key] = value;
        }
      });
    }
  }, {
    key: "generateSutraPath",
    value: function generateSutraPath(node, parentPath, index, parent) {
      var _this6 = this;
      var path = index === -1 ? parentPath : "".concat(parentPath, "[").concat(index, "]");
      node.sutraPath = path;
      node.parent = parent; // Set the parent reference

      if (node.then && Array.isArray(node.then)) {
        node.then.forEach(function (child, idx) {
          return _this6.generateSutraPath(child, "".concat(path, ".then"), idx, node);
        });
      }
      if (node["else"] && Array.isArray(node["else"])) {
        node["else"].forEach(function (child, idx) {
          return _this6.generateSutraPath(child, "".concat(path, ".else"), idx, node);
        });
      }
    }
  }, {
    key: "getNestedValue",
    value: function getNestedValue(obj, path) {
      var pathArray = this.parsePath(path);
      return pathArray.reduce(function (current, part) {
        return current && current[part] !== undefined ? current[part] : undefined;
      }, obj);
    }
  }, {
    key: "findNode",
    value: function findNode(path) {
      // Remark: findNode is intentionally not recursive / doesn't use visitor pattern
      //         This choice is based on performance considerations
      //         Feel free to create a benchmark to compare the performance of this
      var obj = this;
      var pathArray = this.parsePath(path);
      var current = obj;
      var _iterator = _createForOfIteratorHelper(pathArray),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var part = _step.value;
          if (current[part] === undefined) {
            return undefined;
          }
          current = current[part];
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return current;
    }
  }, {
    key: "removeNode",
    value: function removeNode(path) {
      // Split the path into segments and find the parent node and the index of the node to be removed
      var pathArray = this.parsePath(path);
      var current = this;
      for (var i = 0; i < pathArray.length - 1; i++) {
        var part = pathArray[i];
        if (current[part] === undefined) {
          return; // Node doesn't exist, nothing to remove
        }

        current = current[part];
      }
      var nodeToRemoveIndex = pathArray[pathArray.length - 1];
      if (Array.isArray(current) && typeof nodeToRemoveIndex === 'number') {
        // If current is an array and nodeToRemoveIndex is an index, use splice
        if (current.length > nodeToRemoveIndex) {
          current.splice(nodeToRemoveIndex, 1);

          // Reconstruct the parentPath
          var parentPath = pathArray.slice(0, -1).reduce(function (acc, curr, idx) {
            // Append array indices with brackets and property names with dots
            return idx === 0 ? curr : !isNaN(curr) ? "".concat(acc, "[").concat(curr, "]") : "".concat(acc, ".").concat(curr);
          }, '');

          // Update sutraPath for subsequent nodes in the same array
          this.updateSutraPaths(current, nodeToRemoveIndex, parentPath);
        }
      } else if (current[nodeToRemoveIndex] !== undefined) {
        // If it's a regular object property
        delete current[nodeToRemoveIndex];
      }
    }
  }, {
    key: "updateSutraPaths",
    value: function updateSutraPaths(nodes, startIndex, parentPath) {
      for (var i = startIndex; i < nodes.length; i++) {
        // Convert dot notation to bracket notation for indices in the parentPath
        var adjustedParentPath = parentPath.replace(/\.(\d+)(?=\[|$)/g, '[$1]');
        this.generateSutraPath(nodes[i], adjustedParentPath, i, nodes[i].parent);
      }
    }
  }, {
    key: "updateNode",
    value: function updateNode(path, newNodeData) {
      var node = this.findNode(path);
      if (node) {
        Object.assign(node, newNodeData);
        return true;
      }
      return false;
    }
  }, {
    key: "tick",
    value: function tick(data) {
      var _this7 = this;
      var gameState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var subtreeEvaluated = false;
      // Iterate over the main tree's nodes
      this.tree.forEach(function (node) {
        if (node.subtree) {
          subtreeEvaluated = true;
          _this7.traverseNode(node, data, gameState);
        } else {
          _this7.traverseNode(node, data, gameState);
        }
      });

      // If no subtrees were directly evaluated in the main tree, then evaluate all subtrees
      if (this.subtrees && !subtreeEvaluated) {
        Object.values(this.subtrees).forEach(function (subSutra) {
          subSutra.tick(data, gameState);
        });
      }
    }
  }, {
    key: "getSubtree",
    value: function getSubtree(subtreeName) {
      return this.subtrees[subtreeName];
    }
  }, {
    key: "getReadableSutraPath",
    value: function getReadableSutraPath(sutraPath) {
      var node = this.findNode(sutraPath);
      if (!node) return 'Invalid path';

      // Recursive function to build the readable path
      var buildPath = function buildPath(node) {
        var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        if (!node.parent) return path;
        var parent = node.parent;
        var part = parent["if"] ? "".concat(parent["if"]) : parent.action ? "".concat(parent.action) : 'unknown';
        var newPath = part + (path ? ' and ' + path : '');
        return buildPath(parent, newPath);
      };
      return buildPath(node);
    }
  }]);
  return Sutra;
}();
var _default = exports["default"] = Sutra;

},{"./evaluateCompositeCondition.js":2,"./evaluateCondition.js":3,"./evaluateDSLCondition.js":4,"./evaluateSingleCondition.js":5,"./exportToEnglish.js":6,"./operatorAliases.js":8,"./parsePath.js":9,"./serializeToJson.js":10}]},{},[1])(1)
});
