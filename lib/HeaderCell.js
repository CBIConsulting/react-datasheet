'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HeaderCell = function (_PureComponent) {
  _inherits(HeaderCell, _PureComponent);

  function HeaderCell() {
    _classCallCheck(this, HeaderCell);

    return _possibleConstructorReturn(this, (HeaderCell.__proto__ || Object.getPrototypeOf(HeaderCell)).apply(this, arguments));
  }

  _createClass(HeaderCell, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          rowSpan = _props.rowSpan,
          colSpan = _props.colSpan,
          width = _props.width,
          component = _props.component,
          overflow = _props.overflow,
          className = _props.className,
          value = _props.value,
          attributes = _props.attributes,
          fixed = _props.fixed,
          left = _props.left;

      var style = { width: width, left: left };
      var fullCN = [className, 'header-cell cell read-only', overflow, fixed && 'fixed-column'].filter(function (a) {
        return a;
      }).join(' ');

      return _react2.default.createElement(
        'th',
        _extends({
          className: fullCN,
          colSpan: colSpan || 1,
          rowSpan: rowSpan || 1,
          style: style
        }, attributes),
        component || _react2.default.createElement(
          'span',
          { style: { display: 'block' } },
          value
        )
      );
    }
  }]);

  return HeaderCell;
}(_react.PureComponent);

HeaderCell.propTypes = {
  row: _propTypes2.default.number.isRequired,
  col: _propTypes2.default.number.isRequired,
  colSpan: _propTypes2.default.number,
  rowSpan: _propTypes2.default.number,
  width: _propTypes2.default.string,
  overflow: _propTypes2.default.oneOf(['wrap', 'nowrap', 'clip']),
  className: _propTypes2.default.string,
  component: _propTypes2.default.element,
  attributes: _propTypes2.default.object,
  fixed: _propTypes2.default.bool,
  left: _propTypes2.default.string
};

exports.default = HeaderCell;