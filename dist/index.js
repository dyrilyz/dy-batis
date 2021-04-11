"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mysql = _interopRequireDefault(require("mysql"));

var _tags = _interopRequireDefault(require("./tags"));

var _utils = require("./utils");

var _compileSql = _interopRequireDefault(require("./utils/compile-sql"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// 自定义sql对象
var sqlMapper = {};
var pool = null;
/**
 * 提交事物
 * 调用后提交事物
 * @returns {Promise}
 */

function commit() {
  var _this = this;

  return new Promise(function (resolve, reject) {
    _this.transactionConn.commit(function (err) {
      if (err) {
        _this.transactionConn.rollback(function () {
          reject(err);
        });
      }

      pool.releaseConnection(_this.transactionConn);
      _this.transactionConn = null;
      resolve();
    });
  });
}

function commonExecute(_x, _x2) {
  return _commonExecute.apply(this, arguments);
}

function _commonExecute() {
  _commonExecute = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(id, params) {
    var log, sqlObj;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            log = (0, _utils.getLog)(this["debugger"]);
            sqlObj = new _compileSql["default"](id, sqlMapper[id], params, sqlMapper, this.tags);
            log(sqlObj);
            _context6.next = 5;
            return this.execute(sqlObj.precompile, sqlObj.values);

          case 5:
            return _context6.abrupt("return", _context6.sent);

          case 6:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));
  return _commonExecute.apply(this, arguments);
}

var DyBatis = /*#__PURE__*/function () {
  /**
   * 标签解析器
   * @type {{}}
   */

  /**
   * 事物连接
   * 开启事物后，会为其赋值，结束事物后会置空
   * @type {null}
   */
  function DyBatis(dbConfig, mapper) {
    _classCallCheck(this, DyBatis);

    this.tags = {};
    this["debugger"] = false;
    this.transactionConn = null;
    this.installTags(_tags["default"]);

    if (_typeof(dbConfig) === 'object' && !(dbConfig instanceof Array)) {
      this.setDBConfig(dbConfig);
    }

    if (mapper instanceof Array || typeof mapper === 'string') {
      this.readMapper(mapper);
    }
  }

  _createClass(DyBatis, [{
    key: "setDBConfig",
    value: function setDBConfig() {
      var dbConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      pool = _mysql["default"].createPool(dbConfig);
      this["debugger"] = dbConfig["debugger"];
    }
  }, {
    key: "readMapper",
    value: function readMapper(mapper) {
      if (mapper) {
        if (typeof mapper === 'string') {
          (0, _utils.readMapper)(mapper, sqlMapper);
        } else if (mapper instanceof Array) {
          mapper.map(function (item) {
            return (0, _utils.readMapper)(item, sqlMapper);
          });
        }
      }
    } // 安装标签解析器

  }, {
    key: "installTags",
    value: function installTags(tagList) {
      var tags = {};
      tagList.forEach(function (Tag) {
        var tag = Tag.create();
        Object.assign(tags, _defineProperty({}, tag.name, tag));
      });
      Object.assign(this.tags, tags);
    }
  }, {
    key: "execute",
    value: function () {
      var _execute = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(sql) {
        var _this2 = this;

        var args,
            _args = arguments;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                args = _args.length > 1 && _args[1] !== undefined ? _args[1] : [];
                return _context.abrupt("return", new Promise(function (resolve, reject) {
                  if (_this2.transactionConn) {
                    _this2.transactionConn['query'](sql, args, function (err, result) {
                      if (err) {
                        _this2.transactionConn['rollback'](function () {
                          reject(err);
                        });
                      } else {
                        resolve(result);
                      }
                    });
                  } else {
                    pool.query(sql, args, function (err, result) {
                      if (err) {
                        reject(err);
                      } else {
                        resolve(result);
                      }
                    });
                  }
                }));

              case 2:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function execute(_x3) {
        return _execute.apply(this, arguments);
      }

      return execute;
    }()
  }, {
    key: "select",
    value: function () {
      var _select = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(id, params) {
        var result;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return commonExecute.call(this, id, params);

              case 2:
                result = _context2.sent;

                if (!result) {
                  _context2.next = 9;
                  break;
                }

                if (!(result.length === 1)) {
                  _context2.next = 8;
                  break;
                }

                return _context2.abrupt("return", result[0]);

              case 8:
                return _context2.abrupt("return", result);

              case 9:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function select(_x4, _x5) {
        return _select.apply(this, arguments);
      }

      return select;
    }()
  }, {
    key: "selectOne",
    value: function () {
      var _selectOne = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(id, params) {
        var result;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return commonExecute.call(this, id, params);

              case 2:
                result = _context3.sent;

                if (!result) {
                  _context3.next = 5;
                  break;
                }

                return _context3.abrupt("return", result[0]);

              case 5:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function selectOne(_x6, _x7) {
        return _selectOne.apply(this, arguments);
      }

      return selectOne;
    }()
  }, {
    key: "selectMany",
    value: function selectMany(id, params) {
      return commonExecute.call(this, id, params);
    }
  }, {
    key: "insertOne",
    value: function insertOne(id, params) {
      return commonExecute.call(this, id, params);
    } // todo 需要从sql语句层面优化。或将废弃，提供 for 标签解析器来构建语句

  }, {
    key: "insertMany",
    value: function () {
      var _insertMany = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(id, params) {
        var _iterator, _step, param, sqlObj;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _iterator = _createForOfIteratorHelper(params);
                _context4.prev = 1;

                _iterator.s();

              case 3:
                if ((_step = _iterator.n()).done) {
                  _context4.next = 10;
                  break;
                }

                param = _step.value;
                sqlObj = new _compileSql["default"](id, sqlMapper[id], param, sqlMapper, this.tags);
                _context4.next = 8;
                return this.execute(sqlObj.precompile, sqlObj.values);

              case 8:
                _context4.next = 3;
                break;

              case 10:
                _context4.next = 15;
                break;

              case 12:
                _context4.prev = 12;
                _context4.t0 = _context4["catch"](1);

                _iterator.e(_context4.t0);

              case 15:
                _context4.prev = 15;

                _iterator.f();

                return _context4.finish(15);

              case 18:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[1, 12, 15, 18]]);
      }));

      function insertMany(_x8, _x9) {
        return _insertMany.apply(this, arguments);
      }

      return insertMany;
    }()
  }, {
    key: "update",
    value: function update(id, params) {
      return commonExecute.call(this, id, params);
    }
  }, {
    key: "delete",
    value: function _delete(id, params) {
      return commonExecute.call(this, id, params);
    }
  }, {
    key: "transaction",
    value: function () {
      var _transaction = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        var _this3 = this;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                return _context5.abrupt("return", new Promise(function (resolve, reject) {
                  pool.getConnection(function (err, conn) {
                    if (err) reject(err);
                    _this3.transactionConn = conn;
                    conn.beginTransaction(function (err) {
                      if (err) reject(err);
                      resolve(commit.bind(_this3));
                    });
                  });
                }));

              case 1:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      function transaction() {
        return _transaction.apply(this, arguments);
      }

      return transaction;
    }()
  }, {
    key: "getPool",
    value: function getPool() {
      return Promise.resolve(pool);
    }
  }, {
    key: "getConn",
    value: function getConn() {
      return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, conn) {
          if (err) {
            reject(err);
          } else {
            resolve(conn);
          }
        });
      });
    }
  }]);

  return DyBatis;
}();

exports["default"] = DyBatis;