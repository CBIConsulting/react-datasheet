import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import DataCell from './DataCell';
import ComponentCell from './ComponentCell';
import HeaderCell from './HeaderCell';

const TAB_KEY           =  9;
const ENTER_KEY         = 13;
const ESCAPE_KEY        = 27;
const LEFT_KEY          = 37;
const UP_KEY            = 38;
const RIGHT_KEY         = 39;
const DOWN_KEY          = 40;
const DELETE_KEY        = 46;
const BACKSPACE_KEY     =  8;

const isEmpty = (obj) => Object.keys(obj).length === 0;
const range = (start, end) => {
  const array = [];
  const inc = (end - start > 0);
  for (let i = start; inc ? (i <= end) : (i >= end); inc ? i++ : i--) {
    inc ? array.push(i) : array.unshift(i)
  }
  return array;
};
const nullFtn = (obj) => {};
const defaultParsePaste = (str) => {
  return str.split(/\r\n|\n|\r/)
    .map((row) => row.split('\t'));
}

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

    if (this.hasHeader && this.tbodyDom) {
      this.tbodyDom.removeEventListener('scroll', this.handleTableScroll);
    }
  }

  componentDidMount() {
    if (this.hasHeader && this.tbodyDom) {
      this.tbodyDom.addEventListener('scroll', this.handleTableScroll);
    }
  }

  removeAllListeners() {
    document.removeEventListener('keydown',   this.handleKey);
    document.removeEventListener('mousedown', this.pageClick);
    document.removeEventListener('mouseup',   this.onMouseUp);
    document.removeEventListener('copy',      this.handleCopy);
    document.removeEventListener('paste',     this.handlePaste);
  }

  pageClick(e) {
    if (!this.dgDom.contains(e.target)) {
      this.setState(this.defaultState);
      this.removeAllListeners();
    }
  }

  handleCopy(e) {
    if (isEmpty(this.state.editing)) {
      e.preventDefault();
      const {dataRenderer, valueRenderer, data} = this.props;
      const {start, end} = this.state;


      const text = range(start.i, end.i).map((i) =>
        range(start.j, end.j).map(j => {
          const cell = data[i][j];
          const value = dataRenderer ? dataRenderer(cell, i, j) : null;
          if (value === '' || value === null || typeof(value) === 'undefined') {
            return valueRenderer(cell, i, j);
          }
          return value;
        }).join('\t')
      ).join('\n');
      e.clipboardData.setData('text/plain', text);
    }
  }

  handlePaste(e) {
    if (isEmpty(this.state.editing)) {
      const start = this.state.start;

      const parse = this.props.parsePaste || defaultParsePaste;
      const pastedMap = [];
      const pasteData = parse(e.clipboardData.getData('text/plain'));

      let end = {};

      pasteData.map((row, i) => {
        const rowData = [];
        row.map((pastedData, j) => {
          const cell = this.props.data[start.i + i] && this.props.data[start.i + i][start.j + j];
          rowData.push({cell: cell, data: pastedData});
          if (cell && !cell.readOnly && !this.props.onPaste) {
            this.onChange(start.i + i, start.j + j, pastedData);
            end = {i: start.i + i, j: start.j + j};
          }

        });
        pastedMap.push(rowData);
      });
      this.props.onPaste && this.props.onPaste(pastedMap);
      this.setState({end: end});
    }
  }

  handleKeyboardCellMovement(e) {
    const {start, editing} = this.state;
    const {data} = this.props;
    const currentCell = data[start.i][start.j];
    let newLocation = null;

    if (
      (this.state.forceEdit || currentCell.component !== undefined)
      && !isEmpty(this.state.editing)
      && e.keyCode !== TAB_KEY
    ) {
      return false;
    } else if (e.keyCode === TAB_KEY && !e.shiftKey) {
      newLocation = {i : start.i, j: start.j + 1};
      newLocation = typeof(data[newLocation.i][newLocation.j]) !== 'undefined' ? newLocation : { i : start.i + 1, j: 0}
    } else if (e.keyCode === RIGHT_KEY) {
      newLocation = {i: start.i, j: start.j + 1}
    } else if (e.keyCode === LEFT_KEY || e.keyCode === TAB_KEY && e.shiftKey) {
      newLocation = {i : start.i, j: start.j - 1}
    } else if (e.keyCode === UP_KEY) {
      newLocation = {i: start.i - 1, j: start.j}
    } else if (e.keyCode === DOWN_KEY) {
      newLocation = {i: start.i + 1, j: start.j}
    }


    if (newLocation && data[newLocation.i] && typeof(data[newLocation.i][newLocation.j]) !== 'undefined') {
      this.setState({start: newLocation, end: newLocation, editing: {}});
    }
    if (newLocation) {
      e.preventDefault();
      return true;
    }
    return false;
  }

  getSelectedCells(data, start, end) {
    let selected = [];
    range(start.i, end.i).map(i => {
      range(start.j, end.j).map(j => {
        selected.push({cell: data[i][j], i, j});
      })
    });
    return selected;
  }

  handleKey(e) {
    const {start, end, editing} = this.state;
    const data = this.props.data;
    const isEditing = !isEmpty(editing);
    const noCellsSelected = isEmpty(start);
    const ctrlKeyPressed = e.ctrlKey || e.metaKey;
    const deleteKeysPressed = (e.keyCode === DELETE_KEY || e.keyCode === BACKSPACE_KEY);
    const enterKeyPressed = e.keyCode === ENTER_KEY;
    const escapeKeyPressed = e.keyCode === ESCAPE_KEY;
    const numbersPressed = (e.keyCode >= 48 && e.keyCode <= 57);
    const lettersPressed = (e.keyCode >= 65 && e.keyCode <= 90);
    const numPadKeysPressed = (e.keyCode >= 96 && e.keyCode <= 105);
    const cell = data[start.i][start.j];
    const equationKeysPressed = [
      187, /* equal */
      189, /* substract */
      190, /* period */
      107, /* add */
      109, /* decimal point */
      110
    ].indexOf(e.keyCode) > -1;

    if (noCellsSelected || ctrlKeyPressed || this.handleKeyboardCellMovement(e)) {
      return true;
    }


    if (deleteKeysPressed && !isEditing) {
      this.getSelectedCells(data, start, end).map(({cell, i, j}) =>
        (!cell.readOnly) ? this.onChange(i, j, '') : null
      );
      e.preventDefault();
    } else if (enterKeyPressed && isEditing) {
      this.setState({editing: {}, reverting: {}});
    } else if (escapeKeyPressed && isEditing) {
      this.setState({editing: {}, reverting: editing});
    } else if (enterKeyPressed && !isEditing  && !cell.readOnly) {
      this.setState({editing: start, clear: {}, reverting: {}, forceEdit: true});
    } else if (numbersPressed
      || numPadKeysPressed
      || lettersPressed
      || equationKeysPressed
      || enterKeyPressed
    ) {
      //empty out cell if user starts typing without pressing enter
      if (!isEditing && !cell.readOnly) {
        this.setState({
          editing: start,
          clear: start,
          reverting: {},
          forceEdit: false
        });
      }
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
    const { onContextMenu } = this.props;

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
  className: PropTypes.string,
  overflow: PropTypes.oneOf(['wrap', 'nowrap', 'clip']),
  onChange: PropTypes.func,
  onContextMenu: PropTypes.func,
  valueRenderer: PropTypes.func.isRequired,
  dataRenderer: PropTypes.func,
  parsePaste: PropTypes.func,
  headerData: PropTypes.array
};