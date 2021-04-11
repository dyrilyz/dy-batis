"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _index = require("./index");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CompileSql = function CompileSql(id, xmlObj, params, sqlMapper, tags) {
  _classCallCheck(this, CompileSql);

  this.precompile = '';
  this.sql = '';
  this.assert = '';
  this.values = [];

  if (!xmlObj) {
    throw Error("\u627E\u4E0D\u5230id:".concat(id));
  } // 如果是预编译语句，则不做任何处理


  if (xmlObj.attributes['precompile'] === 'true') {
    this.precompile = xmlObj.elements[0].text;
    this.values = params;
  } else {
    // sql的参数名数组
    var args = [];
    var values = [];
    var sql, precompile, assert;
    precompile = assert = sql = (0, _index.translateXmlJsToSQL)(xmlObj, params, sqlMapper, tags); // 匹配出带$的模板参数名

    var $args = sql.match(/\${(\d|[a-z]|\$|_|\.|\[|]|'|")+}/ig); // 通过模板参数获得排列后的参数值

    if ($args) {
      args = $args ? $args.map(function (__name) {
        return __name.replace(/(^\${)|(}$)/g, '');
      }) : [];
      values = args.map(function (key) {
        return params[key];
      });
    }

    for (var i in values) {
      // 判断数组是可以使 IN 操作更加便捷
      if (values[i] instanceof Array) {
        precompile = precompile.replace("${".concat(args[i], "}"), values[i].map(function () {
          return '?';
        }).join(', '));
        assert = assert.replace("${".concat(args[i], "}"), values[i].join(', '));
      } else {
        precompile = precompile.replace("${".concat(args[i], "}"), '?');
        assert = assert.replace("${".concat(args[i], "}"), values[i]);
      }
    } // 当出现 IN 操作时，预编译的传入值（数组）需要展开


    (0, _index.expandArray)(values);
    this.precompile = precompile;
    this.sql = sql;
    this.assert = assert;
    this.values = values;
  }
};

exports["default"] = CompileSql;