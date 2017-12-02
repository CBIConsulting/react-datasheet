import React, { PureComponent } from 'react'
import PropTypes from 'prop-types';

export default class ComponentCell extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { updated: false };
    this.clearTimeoutIdForSizesUpdater = null;
  }

  componentDidMount() {
    this.checkWidth();
  }

  componentWillUpdate(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({ updated: true });
      this.timeout = setTimeout(() => {
        this.setState({ updated: false });
      }, 700);
    }
  }

  componentDidUpdate() {
    this.checkWidth();
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);

    if (this.clearTimeoutIdForSizesUpdater) {
      clearTimeout(this.clearTimeoutIdForSizesUpdater);
    }
  }

  checkWidth() {
    const { onWidthChange } = this.props;

    if (onWidthChange && this.clearTimeoutIdForSizesUpdater === null) {
      this.clearTimeoutIdForSizesUpdater = setTimeout(() => {
        this.clearTimeoutIdForSizesUpdater = null;

        const { width, row, col } = this.props;
        const bcr = this.cellDomNode.getBoundingClientRect();

        if (width != bcr.width + 'px') {
          onWidthChange(row, col, bcr.width);
        }
      }, 5);
    }
  }

  render() {
    let {
      row, col, readOnly, forceComponent, rowSpan, colSpan, width, overflow,
      value, className, editing, selected, onMouseDown, onMouseOver, onDoubleClick,
      onContextMenu, attributes, minWidth
    } = this.props;
    const style = { width };

    if (minWidth) {
      style.minWidth = minWidth;
    }

    return (
      <td
        ref={ ref => this.cellDomNode = ref }
        className={[
          className, 'cell', overflow,
          editing && 'editing', selected && 'selected',
          this.state.updated && 'updated'
        ].filter(a => a).join(' ')}
        onMouseDown={() => onMouseDown(row, col)}
        onDoubleClick={() => onDoubleClick(row, col)}
        onMouseOver={() => onMouseOver(row, col)}
        onContextMenu={(e) => onContextMenu(e, row, col)} colSpan={colSpan || 1}
        rowSpan={rowSpan || 1}
        style={style}
        { ...attributes }
      >
        { ((editing && !readOnly) || forceComponent) ? this.props.component : value }
      </td>
    );
  }
}

ComponentCell.propTypes = {
  row: PropTypes.number.isRequired,
  col: PropTypes.number.isRequired,
  colSpan: PropTypes.number,
  rowSpan: PropTypes.number,
  width: PropTypes.string,
  minWidth: PropTypes.string,
  overflow: PropTypes.oneOf(['wrap', 'nowrap', 'clip']),
  className: PropTypes.string,
  selected: PropTypes.bool.isRequired,
  editing: PropTypes.bool.isRequired,
  onMouseDown: PropTypes.func.isRequired,
  onDoubleClick: PropTypes.func.isRequired,
  onMouseOver: PropTypes.func.isRequired,
  onContextMenu: PropTypes.func.isRequired,
  updated: PropTypes.bool,
  forceComponent: PropTypes.bool,
  attributes: PropTypes.object,
  onWidthChange: PropTypes.func
};
