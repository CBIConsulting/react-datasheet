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

var _HeaderCell = require('./HeaderCell');

var _HeaderCell2 = _interopRequireDefault(_HeaderCell);

var _dataSheet = require('./utils/dataSheet');

var _utils = require('./utils/utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Utils


var FixedDataSheet = function (_PureComponent) {
  _inherits(FixedDataSheet, _PureComponent);

  function FixedDataSheet(props) {
    _classCallCheck(this, FixedDataSheet);

    var _this = _possibleConstructorReturn(this, (FixedDataSheet.__proto__ || Object.getPrototypeOf(FixedDataSheet)).call(this, props));

    _this.onMouseDown = _this.onMouseDown.bind(_this);
    _this.onMouseUp = _this.onMouseUp.bind(_this);
    _this.onMouseOver = _this.onMouseOver.bind(_this);
    _this.onDoubleClick = _this.onDoubleClick.bind(_this);
    _this.onContextMenu = _this.onContextMenu.bind(_this);
    _this.handleKey = _this.handleKey.bind(_this);
    _this.handleCopy = _this.handleCopy.bind(_this);
    _this.handlePaste = _this.handlePaste.bind(_this);
    _this.handleTableScroll = _this.handleTableScroll.bind(_this);
    _this.pageClick = _this.pageClick.bind(_this);
    _this.onChange = _this.onChange.bind(_this);
    _this.lastFixedColumn = _this.getLastFixedColumn(props.headerData);

    _this.defaultState = {
      start: {},
      end: {},
      selecting: false,
      forceEdit: false,
      editing: {},
      reverting: {},
      clear: {},
      scrollTop: 0,
      scrollLeft: 0
    };

    _this.state = _this.defaultState;
    _this.removeAllListeners = _this.removeAllListeners.bind(_this);
    return _this;
  }

  _createClass(FixedDataSheet, [{
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.removeAllListeners();
      this.dgDom && this.dgDom.removeEventListener('scroll', this.handleTableScroll);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.dgDom.addEventListener('scroll', this.handleTableScroll);
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
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      this.lastFixedColumn = this.getLastFixedColumn(nextProps.headerData);
    }
  }, {
    key: 'removeAllListeners',
    value: function removeAllListeners() {
      document.removeEventListener('keydown', this.handleKey);
      document.removeEventListener('mousedown', this.pageClick);
      document.removeEventListener('mouseup', this.onMouseUp);
      document.removeEventListener('copy', this.handleCopy);
      document.removeEventListener('paste', this.handlePaste);
    }
  }, {
    key: 'getLastFixedColumn',
    value: function getLastFixedColumn(headerData) {
      var lastI = headerData.length - 1;

      return headerData && headerData[lastI] && headerData[lastI].reduce(function (prev, cell, i) {
        return cell.fixed ? i : prev;
      }, null);
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

        this.setState({ end: end, editing: {} }, function () {
          if (onPaste) {
            onPaste(pastedData);
          } else {
            changedCells.forEach(function (c) {
              return onChange(c.cell, c.i, c.j, c.value);
            });
          }
        });
      }
    }
  }, {
    key: 'handleKey',
    value: function handleKey(e) {
      var onChange = this.props.onChange;

      var _handleKeyLogic = (0, _dataSheet.handleKeyLogic)(e, this.props, this.state),
          newState = _handleKeyLogic.newState,
          cleanCells = _handleKeyLogic.cleanCells;

      newState && this.setState(newState, function () {
        cleanCells && cleanCells.forEach(function (c) {
          return onChange(c.cell, c.i, c.j, '');
        });
      });
    }

    /**
     * Handle table scroll event. Setting the left position (of the fixed columns) at the same
     * as the main container DOM scrollLeft will make it track the horizontal movement. The
     * same happens for the top to simulate the fixed header.
     *
     * @param {Event} e Event info object
     * @returns {void}
     */

  }, {
    key: 'handleTableScroll',
    value: function handleTableScroll(e) {
      this.setState({
        scrollTop: this.dgDom.scrollTop,
        scrollLeft: this.dgDom.scrollLeft
      });
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
      if (!this.props.data[i][j].readOnly) {
        this.setState({ editing: { i: i, j: j }, forceEdit: true, clear: {} });
      }
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
    value: function onMouseOver(i, j) {
      if (this.state.selecting && (0, _utils.isEmptyObj)(this.state.editing)) {
        this.setState({ end: { i: i, j: j } });
      }
    }
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
    key: 'parseStyleSize',
    value: function parseStyleSize(dimension) {
      return typeof dimension === 'number' ? dimension + 'px' : dimension;
    }
  }, {
    key: 'buildHeader',
    value: function buildHeader() {
      var _this2 = this;

      var _props3 = this.props,
          headerData = _props3.headerData,
          valueRenderer = _props3.valueRenderer,
          attributesRenderer = _props3.attributesRenderer,
          keyFn = _props3.keyFn;
      var scrollLeft = this.state.scrollLeft;

      var rows = headerData.map(function (row, i) {
        var key = 'header_' + i;

        return _react2.default.createElement(
          'tr',
          { key: keyFn ? keyFn(key) : key },
          row.map(function (cell, j) {
            var isLastFixed = cell.fixed && _this2.lastFixedColumn === j;
            var className = [cell.className, isLastFixed && 'last', isLastFixed && scrollLeft && 'scrolling'].filter(function (cn) {
              return cn;
            }).join(' ');

            return _react2.default.createElement(_HeaderCell2.default, {
              key: cell.key ? cell.key : j,
              className: className,
              row: i,
              col: j,
              colSpan: cell.colSpan,
              rowSpan: cell.rowSpan,
              width: _this2.parseStyleSize(cell.width),
              overflow: cell.overflow,
              value: valueRenderer(cell, i, j, true),
              component: cell.component,
              attributes: attributesRenderer ? attributesRenderer(cell, i, j, true) : {},
              fixed: cell.fixed,
              left: cell.fixed ? _this2.parseStyleSize(scrollLeft) : null
            });
          })
        );
      });

      return _react2.default.createElement(
        'thead',
        null,
        rows
      );
    }
  }, {
    key: 'buildBody',
    value: function buildBody() {
      var _this3 = this;

      var _props4 = this.props,
          data = _props4.data,
          dataRenderer = _props4.dataRenderer,
          valueRenderer = _props4.valueRenderer,
          attributesRenderer = _props4.attributesRenderer,
          keyFn = _props4.keyFn;
      var _state = this.state,
          reverting = _state.reverting,
          editing = _state.editing,
          clear = _state.clear,
          start = _state.start,
          end = _state.end,
          scrollLeft = _state.scrollLeft;


      var rows = data.map(function (row, i) {
        return _react2.default.createElement(
          'tr',
          { key: keyFn ? keyFn(i) : i },
          row.map(function (cell, j) {
            var isLastFixed = cell.fixed && _this3.lastFixedColumn === j;
            var className = [cell.className, isLastFixed && 'last', isLastFixed && scrollLeft && 'scrolling'].filter(function (cn) {
              return cn;
            }).join(' ');

            var props = {
              key: cell.key ? cell.key : j,
              className: className,
              row: i,
              col: j,
              selected: (0, _utils.isCellSelected)(start, end, i, j),
              onMouseDown: _this3.onMouseDown,
              onDoubleClick: _this3.onDoubleClick,
              onMouseOver: _this3.onMouseOver,
              onContextMenu: _this3.onContextMenu,
              editing: (0, _utils.cellStateComparison)(editing, i, j),
              reverting: (0, _utils.cellStateComparison)(reverting, i, j),
              colSpan: cell.colSpan,
              width: _this3.parseStyleSize(cell.width),
              overflow: cell.overflow,
              value: valueRenderer(cell, i, j, false),
              attributes: attributesRenderer ? attributesRenderer(cell, i, j, false) : {},
              fixed: cell.fixed,
              left: cell.fixed ? _this3.parseStyleSize(scrollLeft) : null
            };

            if (cell.disableEvents) {
              props.onMouseDown = function () {};
              props.onDoubleClick = function () {};
              props.onMouseOver = function () {};
              props.onContextMenu = function () {};
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
              onChange: _this3.onChange,
              readOnly: cell.readOnly
            }));
          })
        );
      });

      return _react2.default.createElement(
        'tbody',
        null,
        rows
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      var _props5 = this.props,
          className = _props5.className,
          overflow = _props5.overflow,
          width = _props5.width,
          height = _props5.height;
      var scrollTop = this.state.scrollTop;

      var fullCN = ['data-grid', className, overflow, scrollTop && 'scrolling'].filter(function (c) {
        return c;
      }).join(' ');
      var style = {
        width: this.parseStyleSize(width),
        height: this.parseStyleSize(height)
      };
      var header = this.buildHeader();
      var body = this.buildBody();

      return _react2.default.createElement(
        'div',
        { ref: function ref(r) {
            return _this4.dgDom = r;
          }, className: 'data-grid-wrapper fixed', style: style },
        _react2.default.createElement(
          'table',
          { className: 'dtg-virtual-header ' + fullCN, style: { top: scrollTop } },
          header
        ),
        _react2.default.createElement(
          'table',
          { className: 'dtg-main ' + fullCN },
          header,
          body
        )
      );
    }
  }]);

  return FixedDataSheet;
}(_react.PureComponent);

exports.default = FixedDataSheet;


FixedDataSheet.propTypes = {
  data: _propTypes2.default.array.isRequired,
  headerData: _propTypes2.default.array.isRequired,
  width: _propTypes2.default.string.isRequired,
  height: _propTypes2.default.string.isRequired,
  className: _propTypes2.default.string,
  overflow: _propTypes2.default.oneOf(['wrap', 'nowrap', 'clip']),
  onChange: _propTypes2.default.func.isRequired,
  onContextMenu: _propTypes2.default.func,
  valueRenderer: _propTypes2.default.func.isRequired,
  dataRenderer: _propTypes2.default.func,
  parsePaste: _propTypes2.default.func
};

FixedDataSheet.defaultProps = {
  width: '800px',
  height: '400px'
};