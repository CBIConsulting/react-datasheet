import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

class HeaderCell extends PureComponent {
  constructor (props) {
    super(props)
    this.clearTimeoutIdForSizesUpdater = null
  }

  componentDidMount () {
    this.checkWidth()
  }

  componentDidUpdate (prevProps) {
    this.checkWidth()
  }

  componentWillUnmount () {
    clearTimeout(this.timeout)

    if (this.clearTimeoutIdForSizesUpdater) {
      clearTimeout(this.clearTimeoutIdForSizesUpdater)
    }
  }

  render () {
    const {
      row, col, rowSpan, colSpan, width,
      overflow, className, value, component,
      attributes, fixed, left
    } = this.props
    const style = { width, left }
    const fullCN = [
      className, 'header-cell', 'cell',
      'read-only', overflow, fixed && 'fixed-column'
    ].filter(a => a).join(' ')

    return (
      <th
        ref={ref => this.cellDomNode = ref}
        className={fullCN}
        colSpan={colSpan || 1}
        rowSpan={rowSpan || 1}
        style={style}
        {...attributes}
      >
        {
          component || (
          <span style={{display: 'block'}}>
            { value }
          </span>
            )
        }
      </th>
    )
  }
}

HeaderCell.propTypes = {
  row: PropTypes.number.isRequired,
  col: PropTypes.number.isRequired,
  colSpan: PropTypes.number,
  rowSpan: PropTypes.number,
  width: PropTypes.string,
  overflow: PropTypes.oneOf(['wrap', 'nowrap', 'clip']),
  className: PropTypes.string,
  component: PropTypes.element,
  attributes: PropTypes.object,
  fixed: PropTypes.bool,
  left: PropTypes.string
}

export default HeaderCell
