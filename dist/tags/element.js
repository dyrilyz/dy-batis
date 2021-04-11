"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// 标签解析类
var Element = /*#__PURE__*/function () {
  function Element() {
    _classCallCheck(this, Element);

    this.tags = {};
  }

  _createClass(Element, [{
    key: "resolveXmlJs",
    value: function resolveXmlJs(xmlObj, params, sqlMapper) {}
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
  }], [{
    key: "create",
    value: function create() {
      for (var _len = arguments.length, props = new Array(_len), _key = 0; _key < _len; _key++) {
        props[_key] = arguments[_key];
      }

      return Reflect.construct(this, props);
    }
  }]);

  return Element;
}();

exports["default"] = Element;