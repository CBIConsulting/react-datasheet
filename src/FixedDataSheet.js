import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import DataCell from './DataCell';
import ComponentCell from './ComponentCell';
import HeaderCell from './HeaderCell';

// Utils
import {
  TAB_KEY, ESCAPE_KEY, LEFT_KEY,
  UP_KEY, RIGHT_KEY, DOWN_KEY,
  DELETE_KEY, BACKSPACE_KEY,
  ENTER_KEY
} from './utils/constanct';

import {
  handleKeyLogic,
  handleCopyLogic,
  handlePasteLogic
} from './utils/dataSheet';

import {
  isEmptyObj,
  range,
  nullFunction,
  cellStateComparison,
  isCellSelected
} from './utils/utils';

export default class DataSheet extends PureComponent {

  constructor(props) {
    super(props);
    this.onMouseDown        = this.onMouseDown.bind(this);
    this.onMouseUp          = this.onMouseUp.bind(this);
    this.onMouseOver        = this.onMouseOver.bind(this);
    this.onDoubleClick      = this.onDoubleClick.bind(this);
    this.onContextMenu      = this.onContextMenu.bind(this);
    this.handleKey          = this.handleKey.bind(this);
    this.handleCopy         = this.handleCopy.bind(this);
    this.handlePaste        = this.handlePaste.bind(this);
    this.handleTableScroll  = this.handleTableScroll.bind(this);
    this.pageClick          = this.pageClick.bind(this);
    this.onChange           = this.onChange.bind(this);

    this.defaultState = {
      start: {},
      end: {},
      selecting: false,
      forceEdit: false,
      editing: {},
      reverting: {},
      clear: {}
    };

    // Grid sizes repository. Only in use when having header.
    // The bloked prop will be true only when the sizes has been
    // changed from outside (componentWillReceiveProps) to block
    // changes perform by the onCellWidthChange. In that case those
    // changes will be ignored because the component will be
    // re-rendered again.
    this.hasHeader = props.headerData && props.headerData.length > 0;
    if (this.hasHeader) {
      this.defaultState.headScrollLeft = 0; // Scrolling when having header
      this.defaultState.isScrolling = false;
    }

    this.state = this.defaultState;
    this.removeAllListeners = this.removeAllListeners.bind(this);
  }

  componentWillUnmount() {
    this.removeAllListeners();
  }

  componentDidMount() {
    if (this.tbodyDom) {
      this.tbodyDom.addEventListener('scroll', this.handleTableScroll);
    }
  }

  removeAllListeners() {
    document.removeEventListener('keydown',   this.handleKey);
    document.removeEventListener('mousedown', this.pageClick);
    document.removeEventListener('mouseup',   this.onMouseUp);
    document.removeEventListener('copy',      this.handleCopy);
    document.removeEventListener('paste',     this.handlePaste);

    if (this.tbodyDom) {
      this.tbodyDom.removeEventListener('scroll', this.handleTableScroll);
    }
  }

  pageClick(e) {
    if (!this.dgDom.contains(e.target)) {
      this.setState(this.defaultState);
      this.removeAllListeners();
    }
  }

  handleCopy(e) {
    if (isEmptyObj(this.state.editing)) {
      e.clipboardData.setData('text/plain', handleCopyLogic(e, this.props, this.state));
    }
  }

  handlePaste(e) {
    if (isEmptyObj(this.state.editing)) {
      const { onChange, onPaste } = this.props;
      const { pastedData, end, changedCells } = handlePasteLogic(e, this.props, this.state);

      if (onPaste) {
        onPaste(pastedData);
        this.setState({end: end});
      } else {
        this.setState({end: end, editing: {}}, () => {
          changedCells.forEach(c => onChange(c.cell, c.i, c.j, c.value))
        });
      }
    }
  }

  handleKey(e) {
    const { onChange } = this.props;
    const { newState, cleanCells } = handleKeyLogic(e, this.props, this.state);

    if (cleanCells) {
      this.setState({editing: {}}, () => {
        cleanCells.forEach(c => onChange(c.cell, c.i, c.j, ''));
      });
    } else if (newState) {
      this.setState(newState);
    }
  }

  handleTableScroll(e) {
    // Setting the thead left to the inverse of tbody.scrollLeft will make it track the movement
    // of the tbody element.
    const headScrollLeft = -this.tbodyDom.scrollLeft;

    // Setting the cells left value to the same as the tbody.scrollLeft makes it maintain
    // it's relative position at the left of the table.
    // console.log(e, this.tbodyDom.scrollLeft, this.tbodyDom.offsetWidth, this.tbodyDom);
    this.setState({ headScrollLeft });
  }

  onContextMenu(evt, i, j) {
    const { onContextMenu, data } = this.props;

    if (onContextMenu) {
      onContextMenu(evt, data[i][j], i, j);
    }
  }

  onDoubleClick(i, j) {
    let cell = this.props.data[i][j];
    (!cell.readOnly) ? this.setState({editing: {i:i, j:j}, forceEdit: true, clear: {}}) : null;
  }

  onMouseDown(i, j) {
    let editing = (isEmpty(this.state.editing) || this.state.editing.i !== i || this.state.editing.j !== j)
      ? {} : this.state.editing;
    this.setState({selecting: true, start:{i, j}, end:{i, j}, editing: editing, forceEdit: false});

    //Keep listening to mouse if user releases the mouse (dragging outside)
    document.addEventListener('mouseup', this.onMouseUp);
    //Listen for any keyboard presses (there is no input so must attach to document)
    document.addEventListener('keydown', this.handleKey);
    //Listen for any outside mouse clicks
    document.addEventListener('mousedown', this.pageClick);

    //Copy paste event handler
    document.addEventListener('copy', this.handleCopy);
    document.addEventListener('paste', this.handlePaste);
  }

  onMouseOver(i, j) {
    (this.state.selecting && isEmpty(this.state.editing)) ? this.setState({end: {i, j}}) : null;
  }

  onMouseUp() {
    this.setState({selecting: false});
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  onChange(i, j, val) {
    this.props.onChange(this.props.data[i][j], i, j, val);
    this.setState({editing: {}});
  }

  componentDidUpdate(prevProps, prevState) {
    let prevEnd = prevState.end;
    if (!isEmpty(this.state.end) && !(this.state.end.i === prevEnd.i && this.state.end.j === prevEnd.j)) {
      this.props.onSelect && this.props.onSelect(this.props.data[this.state.end.i][this.state.end.j]);
    }
  }

  parseStyleSize(dimension) {
    return typeof dimension === 'number' ? dimension + 'px' : dimension;
  }

  buildTableHeader(data) {
    return this.hasHeader ? (
      <thead ref={ ref => this.theadDom = ref } style={{ left: this.state.headScrollLeft }}>
        { data.map((row, i) => this.buildHeaderRow(row, i)) }
      </thead>
    ) : null;
  }

  buildTableBody(data) {
    return (
      <tbody ref={ ref => this.tbodyDom = ref }>
        { data.map((row, i) => this.buildBodyRow(row, i)) }
      </tbody>
    );
  }

  buildHeaderRow(row, i) {
    const { valueRenderer } = this.props;
    const { cellWidths } = this.state;

    return (
      <tr key={ 'header-row-' + i }>
        {
          row.map((cell, j) => {
            const props = {
              key: cell.key ? cell.key : j,
              className: cell.className ? cell.className : '',
              row: i,
              col: j,
              colSpan: cell.colSpan,
              rowSpan: cell.rowSpan,
              readOnly: true,
              width: this.parseStyleSize(cell.width),
              overflow: cell.overflow,
              value: valueRenderer(cell, i, j, true),
              component: cell.component
            };

            return <HeaderCell {...props} />;
          })
        }
      </tr>
    );
  }

  buildBodyRow(row, i) {
    const { dataRenderer, valueRenderer } = this.props;

    return (
      <tr key={this.props.keyFn ? this.props.keyFn(i) : i}>
        {
          row.map((cell, j) => {
            const props = {
              key: cell.key ? cell.key : j,
              className: cell.className ? cell.className : '',
              row: i,
              col: j,
              selected: this.isSelected(i, j),
              onMouseDown:   this.onMouseDown,
              onDoubleClick: this.onDoubleClick,
              onMouseOver:   this.onMouseOver,
              onContextMenu: this.onContextMenu,
              editing: this.isEditing(i, j),
              reverting: this.isReverting(i, j),
              colSpan: cell.colSpan,
              width: this.parseStyleSize(cell.width),
              overflow: cell.overflow,
              value: valueRenderer(cell, i, j, false),
              extraAttributes: cell.extraAttributes
            };

            if (cell.disableEvents) {
              props.onMouseDown = nullFtn;
              props.onDoubleClick = nullFtn;
              props.onMouseOver = nullFtn;
              props.onContextMenu = nullFtn;
            }

            if (cell.component) {
              return (
                <ComponentCell
                  {...props}
                  forceComponent={ cell.forceComponent || false }
                  component={ cell.component }
                />
              );
            }

            return (
              <DataCell
                {...props}
                data     = { dataRenderer ? dataRenderer(cell, i, j) : null }
                clear    = { this.shouldClear(i, j) }
                rowSpan  = { cell.rowSpan }
                onChange = { this.onChange }
                readOnly = { cell.readOnly }
              />
            );
          })
        }
      </tr>
    );
  }

  render() {
    const { className, overflow, data, headerData, size } = this.props;
    const { isScrolling } = this.state;
    const fullCN = [
      'data-grid', className, overflow,
      this.hasHeader && 'has-header',
      isScrolling && 'scrolling-down'
    ].filter(c => c).join(' ');

    return (
      <div className={ 'data-grid-wrapper' } style={{width: this.parseStyleSize(800), height: this.parseStyleSize(400)}}>
        <table className={ 'dtg-virtual-header' }>
        </table>
        <table ref={ (r) => this.dgDom = r } className={ fullCN }>
          { this.buildTableHeader(headerData) }
          { this.buildTableBody(data) }
        </table>
      </div>
    );
  }
}

DataSheet.propTypes = {
  data: PropTypes.array.isRequired,
  headerData: PropTypes.array.isRequired,
  className: PropTypes.string,
  overflow: PropTypes.oneOf(['wrap', 'nowrap', 'clip']),
  onChange: PropTypes.func,
  onContextMenu: PropTypes.func,
  valueRenderer: PropTypes.func.isRequired,
  dataRenderer: PropTypes.func,
  parsePaste: PropTypes.func
};