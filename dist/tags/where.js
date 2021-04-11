"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _element = _interopRequireDefault(require("./element"));

var _Item = _interopRequireDefault(require("./Item"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Where = /*#__PURE__*/function (_Element) {
  _inherits(Where, _Element);

  var _super = _createSuper(Where);

  function Where(props) {
    var _this;

    _classCallCheck(this, Where);

    _this = _super.call(this, props);
    _this.name = 'where';

    _this.installTags([_Item["default"]]);

    return _this;
  }

  _createClass(Where, [{
    key: "resolveXmlJs",
    value: function resolveXmlJs(xmlObj, params, sqlMapper) {
      var result = this.resolveItem(xmlObj.elements, params, sqlMapper);

      if (result.length) {
        result.unshift({
          type: 'text',
          text: 'where'
        });
      }

      return result;
    }
  }, {
    key: "resolveItem",
    value: function resolveItem(elements, params, sqlMapper) {
      var _this2 = this;

      var inner = [];
      var result = [];
      elements.forEach(function (el) {
        if (_this2.tags[el.name]) {
          var item = _this2.tags[el.name].resolveXmlJs(el, params, sqlMapper);

          if (item) {
            inner.push(item);
          }
        } else {
          inner.push(el);
        }
      });

      while (inner.length) {
        var el = inner.shift();

        if (el.name === 'item') {
          if (el.attributes.connector && result.length > 0) {
            result.push({
              type: 'text',
              text: el.attributes.connector
            });
          }

          el.elements.forEach(function (item) {
            return result.push(item);
          });
        } else {
          result.push(el);
        }
      }

      return result;
    }
  }]);

  return Where;
}(_element["default"]);

exports["default"] = Where;