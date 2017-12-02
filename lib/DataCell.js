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

var DataCell = function (_PureComponent) {
  _inherits(DataCell, _PureComponent);

  function DataCell(props) {
    _classCallCheck(this, DataCell);

    var _this = _possibleConstructorReturn(this, (DataCell.__proto__ || Object.getPrototypeOf(DataCell)).call(this, props));

    _this.state = { updated: false };
    _this.clearTimeoutIdForSizesUpdater = null;
    return _this;
  }

  _createClass(DataCell, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.checkWidth();
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate(nextProps) {
      var _this2 = this;

      if (nextProps.value !== this.props.value) {
        this.setState({ updated: true });
        this.timeout = setTimeout(function () {
          return _this2.setState({ updated: false });
        }, 700);
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      this.checkWidth();

      if (prevProps.editing === true && this.props.editing === false && this.props.reverting === false) {
        this.onChange(this._input.value);
      }

      if (prevProps.editing === false && this.props.editing === true) {
        if (this.props.clear) {
          this._input.value = '';
        } else {
          this._input.value = this.props.data === null ? this.props.value : this.props.data;
        }
        this._input.focus();
      }
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
      var _this3 = this;

      var onWidthChange = this.props.onWidthChange;


      if (onWidthChange && this.clearTimeoutIdForSizesUpdater === null) {
        this.clearTimeoutIdForSizesUpdater = setTimeout(function () {
          _this3.clearTimeoutIdForSizesUpdater = null;

          var _props = _this3.props,
              width = _props.width,
              row = _props.row,
              col = _props.col;

          var bcr = _this3.cellDomNode.getBoundingClientRect();

          if (width != bcr.width + 'px') {
            onWidthChange(row, col, bcr.width);
          }
        }, 5);
      }
    }
  }, {
    key: 'onChange',
    value: function onChange(value) {
      var initialData = this.props.data === null ? this.props.value : this.props.data;
      (value === '' || initialData !== value) && this.props.onChange(this.props.row, this.props.col, value);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      var _props2 = this.props,
          row = _props2.row,
          col = _props2.col,
          rowSpan = _props2.rowSpan,
          readOnly = _props2.readOnly,
          colSpan = _props2.colSpan,
          width = _props2.width,
          overflow = _props2.overflow,
          value = _props2.value,
          className = _props2.className,
          editing = _props2.editing,
          selected = _props2.selected,
          _onMouseDown = _props2.onMouseDown,
          _onMouseOver = _props2.onMouseOver,
          _onDoubleClick = _props2.onDoubleClick,
          _onContextMenu = _props2.onContextMenu,
          attributes = _props2.attributes;

      var style = { width: width };

      return _react2.default.createElement(
        'td',
        _extends({
          ref: function ref(_ref) {
            return _this4.cellDomNode = _ref;
          },
          className: [className, 'cell', overflow, selected && 'selected', editing && 'editing', readOnly && 'read-only', this.state.updated && 'updated'].filter(function (a) {
            return a;
          }).join(' '),
          onMouseDown: function onMouseDown() {
            return _onMouseDown(row, col);
          },
          onDoubleClick: function onDoubleClick() {
            return _onDoubleClick(row, col);
          },
          onMouseOver: function onMouseOver() {
            return _onMouseOver(row, col);
          },
          onContextMenu: function onContextMenu(e) {
            return _onContextMenu(e, row, col);
          },
          colSpan: colSpan || 1,
          rowSpan: rowSpan || 1,
          style: style
        }, attributes),
        _react2.default.createElement(
          'span',
          { style: { display: editing && selected ? 'none' : 'block' } },
          value
        ),
        _react2.default.createElement('input', { style: { display: editing && selected ? 'block' : 'none' }, ref: function ref(input) {
            return _this4._input = input;
          } })
      );
    }
  }]);

  return DataCell;
}(_react.PureComponent);

exports.default = DataCell;


DataCell.propTypes = {
  row: _propTypes2.default.number.isRequired,
  col: _propTypes2.default.number.isRequired,
  colSpan: _propTypes2.default.number,
  rowSpan: _propTypes2.default.number,
  width: _propTypes2.default.string,
  overflow: _propTypes2.default.oneOf(['wrap', 'nowrap', 'clip']),
  selected: _propTypes2.default.bool.isRequired,
  editing: _propTypes2.default.bool.isRequired,
  onMouseDown: _propTypes2.default.func.isRequired,
  onDoubleClick: _propTypes2.default.func.isRequired,
  onMouseOver: _propTypes2.default.func.isRequired,
  onContextMenu: _propTypes2.default.func.isRequired,
  updated: _propTypes2.default.bool,
  attributes: _propTypes2.default.object,
  onWidthChange: _propTypes2.default.func
};