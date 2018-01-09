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

var _DataCell = require('./DataCell');

var _DataCell2 = _interopRequireDefault(_DataCell);

var _ComponentCell = require('./ComponentCell');

var _ComponentCell2 = _interopRequireDefault(_ComponentCell);

var _constanct = require('./utils/constanct');

var _dataSheet = require('./utils/dataSheet');

var _utils = require('./utils/utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Utils


var DataSheet = function (_PureComponent) {
  _inherits(DataSheet, _PureComponent);

  function DataSheet(props) {
    _classCallCheck(this, DataSheet);

    var _this = _possibleConstructorReturn(this, (DataSheet.__proto__ || Object.getPrototypeOf(DataSheet)).call(this, props));

    _this.onMouseDown = _this.onMouseDown.bind(_this);
    _this.onMouseUp = _this.onMouseUp.bind(_this);
    _this.onMouseOver = _this.onMouseOver.bind(_this);
    _this.onDoubleClick = _this.onDoubleClick.bind(_this);
    _this.onContextMenu = _this.onContextMenu.bind(_this);
    _this.handleKey = _this.handleKey.bind(_this);
    _this.handleCopy = _this.handleCopy.bind(_this);
    _this.handlePaste = _this.handlePaste.bind(_this);
    _this.pageClick = _this.pageClick.bind(_this);
    _this.onChange = _this.onChange.bind(_this);

    _this.defaultState = {
      start: {},
      end: {},
      selecting: false,
      forceEdit: false,
      editing: {},
      reverting: {},
      clear: {}
    };
    _this.state = _this.defaultState;

    _this.removeAllListeners = _this.removeAllListeners.bind(_this);
    return _this;
  }

  _createClass(DataSheet, [{
    key: 'removeAllListeners',
    value: function removeAllListeners() {
      document.removeEventListener('keydown', this.handleKey);
      document.removeEventListener('mousedown', this.pageClick);
      document.removeEventListener('mouseup', this.onMouseUp);
      document.removeEventListener('copy', this.handleCopy);
      document.removeEventListener('paste', this.handlePaste);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.removeAllListeners();
    }
  }, {
    key: 'pageClick',
    value: function pageClick(e) {
      if (!this.dgDom.contains(e.target)) {
        this.setState(this.defaultState);
        this.removeAllListeners();
      }
    }
  }, {
    key: 'handleCopy',
    value: function handleCopy(e) {
      if ((0, _utils.isEmptyObj)(this.state.editing)) {
        e.clipboardData.setData('text/plain', (0, _dataSheet.handleCopyLogic)(e, this.props, this.state));
      }
    }
  }, {
    key: 'handlePaste',
    value: function handlePaste(e) {
      if ((0, _utils.isEmptyObj)(this.state.editing)) {
        var _props = this.props,
            onChange = _props.onChange,
            onPaste = _props.onPaste;

        var _handlePasteLogic = (0, _dataSheet.handlePasteLogic)(e, this.props, this.state),
            pastedData = _handlePasteLogic.pastedData,
            end = _handlePasteLogic.end,
            changedCells = _handlePasteLogic.changedCells;

        if (onPaste) {
          onPaste(pastedData);
          this.setState({ end: end });
        } else {
          this.setState({ end: end, editing: {} }, function () {
            changedCells.forEach(function (c) {
              return onChange(c.cell, c.i, c.j, c.value);
            });
          });
        }
      }
    }
  }, {
    key: 'handleKey',
    value: function handleKey(e) {
      var onChange = this.props.onChange;

      var _handleKeyLogic = (0, _dataSheet.handleKeyLogic)(e, this.props, this.state),
          newState = _handleKeyLogic.newState,
          cleanCells = _handleKeyLogic.cleanCells;

      if (cleanCells) {
        this.setState({ editing: {} }, function () {
          cleanCells.forEach(function (c) {
            return onChange(c.cell, c.i, c.j, '');
          });
        });
      } else if (newState) {
        this.setState(newState);
      }
    }
  }, {
    key: 'onContextMenu',
    value: function onContextMenu(evt, i, j) {
      var _props2 = this.props,
          onContextMenu = _props2.onContextMenu,
          data = _props2.data;


      if (onContextMenu) {
        onContextMenu(evt, data[i][j], i, j);
      }
    }
  }, {
    key: 'onDoubleClick',
    value: function onDoubleClick(i, j) {
      var cell = this.props.data[i][j];
      !cell.readOnly ? this.setState({ editing: { i: i, j: j }, forceEdit: true, clear: {} }) : null;
    }
  }, {
    key: 'onMouseDown',
    value: function onMouseDown(i, j) {
      var editing = (0, _utils.isEmptyObj)(this.state.editing) || this.state.editing.i !== i || this.state.editing.j !== j ? {} : this.state.editing;
      this.setState({ selecting: true, start: { i: i, j: j }, end: { i: i, j: j }, editing: editing, forceEdit: false });

      // Keep listening to mouse if user releases the mouse (dragging outside)
      document.addEventListener('mouseup', this.onMouseUp);
      // Listen for any keyboard presses (there is no input so must attach to document)
      document.addEventListener('keydown', this.handleKey);
      // Listen for any outside mouse clicks
      document.addEventListener('mousedown', this.pageClick);

      // Copy paste event handler
      document.addEventListener('copy', this.handleCopy);
      document.addEventListener('paste', this.handlePaste);
    }
  }, {
    key: 'onMouseOver',
    value: function onMouseOver(i, j) {}
  }, {
    key: 'onMouseUp',
    value: function onMouseUp() {
      this.setState({ selecting: false });
      document.removeEventListener('mouseup', this.onMouseUp);
    }
  }, {
    key: 'onChange',
    value: function onChange(i, j, val) {
      this.props.onChange(this.props.data[i][j], i, j, val);
      this.setState({ editing: {} });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      var prevEnd = prevState.end;
      if (!(0, _utils.isEmptyObj)(this.state.end) && !(this.state.end.i === prevEnd.i && this.state.end.j === prevEnd.j)) {
        this.props.onSelect && this.props.onSelect(this.props.data[this.state.end.i][this.state.end.j]);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props3 = this.props,
          dataRenderer = _props3.dataRenderer,
          valueRenderer = _props3.valueRenderer,
          attributesRenderer = _props3.attributesRenderer,
          className = _props3.className,
          overflow = _props3.overflow;
      var _state = this.state,
          reverting = _state.reverting,
          editing = _state.editing,
          clear = _state.clear,
          start = _state.start,
          end = _state.end;


      return _react2.default.createElement(
        'table',
        {
          ref: function ref(r) {
            return _this2.dgDom = r;
          },
          className: ['data-grid', className, overflow].filter(function (a) {
            return a;
          }).join(' ')
        },
        _react2.default.createElement(
          'tbody',
          null,
          this.props.data.map(function (row, i) {
            return _react2.default.createElement(
              'tr',
              { key: _this2.props.keyFn ? _this2.props.keyFn(i) : i },
              row.map(function (cell, j) {
                var props = {
                  key: cell.key ? cell.key : j,
                  className: cell.className ? cell.className : '',
                  row: i,
                  col: j,
                  selected: (0, _utils.isCellSelected)(start, end, i, j),
                  onMouseDown: _this2.onMouseDown,
                  onDoubleClick: _this2.onDoubleClick,
                  onMouseOver: _this2.onMouseOver,
                  onContextMenu: _this2.onContextMenu,
                  editing: (0, _utils.cellStateComparison)(editing, i, j),
                  reverting: (0, _utils.cellStateComparison)(reverting, i, j),
                  colSpan: cell.colSpan,
                  width: typeof cell.width === 'number' ? cell.width + 'px' : cell.width,
                  overflow: cell.overflow,
                  value: valueRenderer(cell, i, j),
                  attributes: attributesRenderer ? attributesRenderer(cell, i, j, false) : {}
                };

                if (cell.disableEvents) {
                  props.onMouseDown = _utils.nullFunction;
                  props.onDoubleClick = _utils.nullFunction;
                  props.onMouseOver = _utils.nullFunction;
                  props.onContextMenu = _utils.nullFunction;
                }

                if (cell.component) {
                  return _react2.default.createElement(_ComponentCell2.default, _extends({}, props, {
                    forceComponent: cell.forceComponent || false,
                    component: cell.component
                  }));
                }

                return _react2.default.createElement(_DataCell2.default, _extends({}, props, {
                  data: dataRenderer ? dataRenderer(cell, i, j) : null,
                  clear: (0, _utils.cellStateComparison)(clear, i, j),
                  rowSpan: cell.rowSpan,
                  onChange: _this2.onChange,
                  readOnly: cell.readOnly
                }));
              })
            );
          })
        )
      );
    }
  }]);

  return DataSheet;
}(_react.PureComponent);

exports.default = DataSheet;


DataSheet.propTypes = {
  data: _propTypes2.default.array.isRequired,
  className: _propTypes2.default.string,
  overflow: _propTypes2.default.oneOf(['wrap', 'nowrap', 'clip']),
  onChange: _propTypes2.default.func,
  onContextMenu: _propTypes2.default.func,
  valueRenderer: _propTypes2.default.func.isRequired,
  dataRenderer: _propTypes2.default.func,
  parsePaste: _propTypes2.default.func,
  attributesRenderer: _propTypes2.default.func
};