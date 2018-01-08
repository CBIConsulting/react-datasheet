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

  function HeaderCell(props) {
    _classCallCheck(this, HeaderCell);

    var _this = _possibleConstructorReturn(this, (HeaderCell.__proto__ || Object.getPrototypeOf(HeaderCell)).call(this, props));

    _this.clearTimeoutIdForSizesUpdater = null;
    return _this;
  }

  _createClass(HeaderCell, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.checkWidth();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      this.checkWidth();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      clearTimeout(this.timeout);

      if (this.clearTimeoutIdForSizesUpdater) {
        clearTimeout(this.clearTimeoutIdForSizesUpdater);
      }
    }
  }, {
    key: 'checkWidth',
    value: function checkWidth() {
      var _this2 = this;

      var onWidthChange = this.props.onWidthChange;


      if (onWidthChange && this.clearTimeoutIdForSizesUpdater === null) {
        this.clearTimeoutIdForSizesUpdater = setTimeout(function () {
          _this2.clearTimeoutIdForSizesUpdater = null;

          var _props = _this2.props,
              width = _props.width,
              row = _props.row,
              col = _props.col;

          var bcr = _this2.cellDomNode.getBoundingClientRect();

          if (width != bcr.width + 'px') {
            onWidthChange(row, col, bcr.width);
          }
        }, 5);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      var _props2 = this.props,
          row = _props2.row,
          col = _props2.col,
          rowSpan = _props2.rowSpan,
          colSpan = _props2.colSpan,
          width = _props2.width,
          overflow = _props2.overflow,
          className = _props2.className,
          value = _props2.value,
          component = _props2.component,
          attributes = _props2.attributes,
          fixed = _props2.fixed,
          left = _props2.left;

      var style = { width: width, left: left };
      var fullCN = [className, 'header-cell', 'cell', 'read-only', overflow, fixed && 'fixed-column'].filter(function (a) {
        return a;
      }).join(' ');

      return _react2.default.createElement(
        'th',
        _extends({
          ref: function ref(_ref) {
            return _this3.cellDomNode = _ref;
          },
          className: fullCN,
          colSpan: colSpan || 1,
          rowSpan: rowSpan || 1,
          style: style
        }, attributes),
        component ? component : _react2.default.createElement(
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
  left: _propTypes2.default.string,
  onWidthChange: _propTypes2.default.func
};

exports.default = HeaderCell;