import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import DataCell from './DataCell'
import ComponentCell from './ComponentCell'
import HeaderCell from './HeaderCell'

// Utils
import {
  handleKeyLogic,
  handleCopyLogic,
  handlePasteLogic
} from './utils/dataSheet'

import {
  isEmptyObj,
  cellStateComparison,
  isCellSelected
} from './utils/utils'

export default class FixedDataSheet extends PureComponent {
  constructor (props) {
    super(props)
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.onMouseOver = this.onMouseOver.bind(this)
    this.onDoubleClick = this.onDoubleClick.bind(this)
    this.onContextMenu = this.onContextMenu.bind(this)
    this.handleKey = this.handleKey.bind(this)
    this.handleCopy = this.handleCopy.bind(this)
    this.handlePaste = this.handlePaste.bind(this)
    this.handleTableScroll = this.handleTableScroll.bind(this)
    this.pageClick = this.pageClick.bind(this)
    this.onChange = this.onChange.bind(this)
    this.lastFixedColumn = this.getLastFixedColumn(props.headerData)

    this.defaultState = {
      start: {},
      end: {},
      selecting: false,
      forceEdit: false,
      editing: {},
      reverting: {},
      clear: {},
      scrollTop: 0,
      scrollLeft: 0
    }

    this.state = this.defaultState
    this.removeAllListeners = this.removeAllListeners.bind(this)
  }

  componentWillUnmount () {
    this.removeAllListeners()
    this.dgDom && this.dgDom.removeEventListener('scroll', this.handleTableScroll)
  }

  componentDidMount () {
    this.dgDom.addEventListener('scroll', this.handleTableScroll)
  }

  componentDidUpdate (prevProps, prevState) {
    let prevEnd = prevState.end
    if (!isEmptyObj(this.state.end) && !(this.state.end.i === prevEnd.i && this.state.end.j === prevEnd.j)) {
      this.props.onSelect && this.props.onSelect(this.props.data[this.state.end.i][this.state.end.j])
    }
  }

  componentWillReceiveProps (nextProps) {
    this.lastFixedColumn = this.getLastFixedColumn(nextProps.headerData)
  }

  removeAllListeners () {
    document.removeEventListener('keydown', this.handleKey)
    document.removeEventListener('mousedown', this.pageClick)
    document.removeEventListener('mouseup', this.onMouseUp)
    document.removeEventListener('copy', this.handleCopy)
    document.removeEventListener('paste', this.handlePaste)
  }

  getLastFixedColumn (headerData) {
    const lastI = headerData.length - 1

    return headerData && headerData[lastI] &&
      headerData[lastI].reduce((prev, cell, i) => cell.fixed ? i : prev, null)
  }

  pageClick (e) {
    if (!this.dgDom.contains(e.target)) {
      this.setState(this.defaultState)
      this.removeAllListeners()
    }
  }

  handleCopy (e) {
    if (isEmptyObj(this.state.editing)) {
      e.clipboardData.setData('text/plain', handleCopyLogic(e, this.props, this.state))
    }
  }

  handlePaste (e) {
    if (isEmptyObj(this.state.editing)) {
      const { onChange, onPaste } = this.props
      const { pastedData, end, changedCells } = handlePasteLogic(e, this.props, this.state)

      this.setState({end: end, editing: {}}, () => {
        if (onPaste) {
          onPaste(pastedData)
        } else {
          changedCells.forEach(c => onChange(c.cell, c.i, c.j, c.value))
        }
      })
    }
  }

  handleKey (e) {
    const { onChange } = this.props
    const { newState, cleanCells } = handleKeyLogic(e, this.props, this.state)

    newState && this.setState(newState, () => {
      cleanCells && cleanCells.forEach(c => onChange(c.cell, c.i, c.j, ''))
    })
  }

  /**
   * Handle table scroll event. Setting the left position (of the fixed columns) at the same
   * as the main container DOM scrollLeft will make it track the horizontal movement. The
   * same happens for the top to simulate the fixed header.
   *
   * @param {Event} e Event info object
   * @returns {void}
   */
  handleTableScroll (e) {
    this.setState({
      scrollTop: this.dgDom.scrollTop,
      scrollLeft: this.dgDom.scrollLeft
    })
  }

  onContextMenu (evt, i, j) {
    const { onContextMenu, data } = this.props

    if (onContextMenu) {
      onContextMenu(evt, data[i][j], i, j)
    }
  }

  onDoubleClick (i, j) {
    if (!this.props.data[i][j].readOnly) {
      this.setState({editing: {i: i, j: j}, forceEdit: true, clear: {}})
    }
  }

  onMouseDown (i, j) {
    let editing = (isEmptyObj(this.state.editing) || this.state.editing.i !== i || this.state.editing.j !== j)
      ? {} : this.state.editing
    this.setState({selecting: true, start: {i, j}, end: {i, j}, editing: editing, forceEdit: false})

    // Keep listening to mouse if user releases the mouse (dragging outside)
    document.addEventListener('mouseup', this.onMouseUp)
    // Listen for any keyboard presses (there is no input so must attach to document)
    document.addEventListener('keydown', this.handleKey)
    // Listen for any outside mouse clicks
    document.addEventListener('mousedown', this.pageClick)

    // Copy paste event handler
    document.addEventListener('copy', this.handleCopy)
    document.addEventListener('paste', this.handlePaste)
  }

  onMouseOver (i, j) {
    if (this.state.selecting && isEmptyObj(this.state.editing)) {
      this.setState({end: {i, j}})
    }
  }

  onMouseUp () {
    this.setState({selecting: false})
    document.removeEventListener('mouseup', this.onMouseUp)
  }

  onChange (i, j, val) {
    this.props.onChange(this.props.data[i][j], i, j, val)
    this.setState({editing: {}})
  }

  parseStyleSize (dimension) {
    return typeof dimension === 'number' ? dimension + 'px' : dimension
  }

  buildHeader () {
    const {
      headerData, valueRenderer,
      attributesRenderer, keyFn
    } = this.props
    const { scrollLeft } = this.state
    const rows = headerData.map((row, i) => {
      const key = 'header_' + i

      return (
        <tr key={keyFn ? keyFn(key) : key}>
          {
            row.map((cell, j) => {
              const isLastFixed = cell.fixed && this.lastFixedColumn === j
              const className = [
                cell.className, isLastFixed && 'last',
                isLastFixed && scrollLeft && 'scrolling'
              ].filter(cn => cn).join(' ')

              return <HeaderCell
                key={cell.key ? cell.key : j}
                className={className}
                row={i}
                col={j}
                colSpan={cell.colSpan}
                rowSpan={cell.rowSpan}
                width={this.parseStyleSize(cell.width)}
                overflow={cell.overflow}
                value={valueRenderer(cell, i, j, true)}
                component={cell.component}
                attributes={attributesRenderer ? attributesRenderer(cell, i, j, true) : {}}
                fixed={cell.fixed}
                left={cell.fixed ? this.parseStyleSize(scrollLeft) : null}
              />
            })
          }
        </tr>
      )
    })

    return (
      <thead>
        { rows }
      </thead>
    )
  }

  buildBody () {
    const {
      data, dataRenderer, valueRenderer,
      attributesRenderer, keyFn
    } = this.props

    const {
      reverting, editing, clear,
      start, end, scrollLeft
    } = this.state

    const rows = data.map((row, i) => (
      <tr key={keyFn ? keyFn(i) : i}>
        {
          row.map((cell, j) => {
            const isLastFixed = cell.fixed && this.lastFixedColumn === j
            const className = [
              cell.className, isLastFixed && 'last',
              isLastFixed && scrollLeft && 'scrolling'
            ].filter(cn => cn).join(' ')

            const props = {
              key: cell.key ? cell.key : j,
              className: className,
              row: i,
              col: j,
              selected: isCellSelected(start, end, i, j),
              onMouseDown: this.onMouseDown,
              onDoubleClick: this.onDoubleClick,
              onMouseOver: this.onMouseOver,
              onContextMenu: this.onContextMenu,
              editing: cellStateComparison(editing, i, j),
              reverting: cellStateComparison(reverting, i, j),
              colSpan: cell.colSpan,
              width: this.parseStyleSize(cell.width),
              overflow: cell.overflow,
              value: valueRenderer(cell, i, j, false),
              attributes: attributesRenderer ? attributesRenderer(cell, i, j, false) : {},
              fixed: cell.fixed,
              left: cell.fixed ? this.parseStyleSize(scrollLeft) : null
            }

            if (cell.disableEvents) {
              props.onMouseDown = () => {}
              props.onDoubleClick = () => {}
              props.onMouseOver = () => {}
              props.onContextMenu = () => {}
            }

            if (cell.component) {
              return (
                <ComponentCell
                  {...props}
                  forceComponent={cell.forceComponent || false}
                  component={cell.component}
                />
              )
            }

            return (
              <DataCell
                {...props}
                data={dataRenderer ? dataRenderer(cell, i, j) : null}
                clear={cellStateComparison(clear, i, j)}
                rowSpan={cell.rowSpan}
                onChange={this.onChange}
                readOnly={cell.readOnly}
              />
            )
          })
        }
      </tr>
    ))

    return (
      <tbody>
        { rows }
      </tbody>
    )
  }

  render () {
    const { className, overflow, width, height } = this.props
    const { scrollTop } = this.state
    const fullCN = [
      'data-grid', className, overflow,
      scrollTop && 'scrolling'
    ].filter(c => c).join(' ')
    const style = {
      width: this.parseStyleSize(width),
      height: this.parseStyleSize(height)
    }
    const header = this.buildHeader()
    const body = this.buildBody()

    return (
      <div ref={r => (this.dgDom = r)} className={'data-grid-wrapper fixed'} style={style}>
        <table className={'dtg-virtual-header ' + fullCN} style={{ top: scrollTop }}>
          { header }
        </table>
        <table className={'dtg-main ' + fullCN}>
          { header }
          { body }
        </table>
      </div>
    )
  }
}

FixedDataSheet.propTypes = {
  data: PropTypes.array.isRequired,
  headerData: PropTypes.array.isRequired,
  width: PropTypes.string.isRequired,
  height: PropTypes.string.isRequired,
  className: PropTypes.string,
  overflow: PropTypes.oneOf(['wrap', 'nowrap', 'clip']),
  onChange: PropTypes.func.isRequired,
  onContextMenu: PropTypes.func,
  valueRenderer: PropTypes.func.isRequired,
  dataRenderer: PropTypes.func,
  parsePaste: PropTypes.func
}

FixedDataSheet.defaultProps = {
  width: '800px',
  height: '400px'
}
