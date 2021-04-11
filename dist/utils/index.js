"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readMapper = readMapper;
exports.translateXmlJsToSQL = translateXmlJsToSQL;
exports.expandArray = expandArray;
exports.getLog = getLog;

var _fs = _interopRequireDefault(require("fs"));

var _xmlJs = _interopRequireDefault(require("xml-js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// xml-js 配置
var xmlJsConf = {
  compact: false,
  trim: true,
  instructionHasAttributes: true,
  alwaysArray: true,
  ignoreComment: true,
  ignoreCdata: true,
  ignoreDoctype: true
};
/**
 * xml解析为js
 * @param filepath
 * @param sqlMapper
 */

function readMapper(filepath, sqlMapper) {
  var _root$elements, _root$elements$map;

  var xml = _fs["default"].readFileSync(filepath);

  var obj = _xmlJs["default"].xml2js(xml.toString(), xmlJsConf);

  var root = obj['elements'][0];
  var moduleName = root.attributes.module;
  (_root$elements = root.elements) === null || _root$elements === void 0 ? void 0 : (_root$elements$map = _root$elements.map) === null || _root$elements$map === void 0 ? void 0 : _root$elements$map.call(_root$elements, function (el) {
    var mapperKey = moduleName ? "".concat(moduleName, ".").concat(el.attributes.id) : el.attributes.id;
    Object.assign(sqlMapper, _defineProperty({}, mapperKey, el));
  });
}
/**
 * xml-js对象解析为sql语句
 * @param xmlObj
 * @param params
 * @param sqlMapper
 * @returns {string}
 */


function translateXmlJsToSQL(xmlObj, params, sqlMapper, tags) {
  var result = [];
  var elList = xmlObj.elements;

  function iteratorCallback(el) {
    if (el.type === 'element' && tags[el.name]) {
      var list = tags[el.name].resolveXmlJs(el, params, sqlMapper);
      list === null || list === void 0 ? void 0 : list.forEach(iteratorCallback);
    } else {
      result.push(el);
    }
  }

  elList.forEach(iteratorCallback);
  var resultEls = result.filter(function (item) {
    return item.type === 'element';
  });

  if (resultEls.length) {
    throw Error("".concat(resultEls[0].name, "\u6807\u7B7E\u672A\u5B9A\u4E49"));
  }

  return result.map(function (item) {
    return item.text;
  }).join(' ');
}
/**
 * 展开values数组
 * @param arr
 */


function expandArray(arr) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] instanceof Array) {
      arr.splice.apply(arr, [i, 1].concat(_toConsumableArray(arr[i])));
      expandArray(arr);
      break;
    }
  }
}

function getLog(debug) {
  return debug ? console.log : function () {
    return null;
  };
}