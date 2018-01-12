import React from 'react';
import FixedDataSheet from '../lib/FixedDataSheet';

export default class BasicSheet extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      header: [
        [
          {value: '', fixed: true},
          {value: 'A', fixed: true},
          {value: 'B'},
          {value: 'C'},
          {value: 'D'}
        ]
      ],
      grid: [
        [{readOnly: true, value: 1, fixed: true}, {value: 1, fixed: true}, {value: 3}, {value: 3}, {value: 3}],
        [{readOnly: true, value: 2, fixed: true}, {value: 2, fixed: true}, {value: 4}, {value: 4}, {value: 4}],
        [{readOnly: true, value: 3, fixed: true}, {value: 1, fixed: true}, {value: 3}, {value: 3}, {value: 3}],
        [{readOnly: true, value: 4, fixed: true}, {value: 2, fixed: true}, {value: 4}, {value: 4}, {value: 4}]
      ]
    }
  }
  render () {
    return (
      <FixedDataSheet
        headerData={this.state.header}
        data={this.state.grid}
        width={'300px'}
        height={'200px'}
        valueRenderer={(cell) => cell.value}
        onContextMenu={(e, cell, i, j) => cell.readOnly ? e.preventDefault() : null}
        onChange={(modifiedCell, rowI, colJ, value) =>
          this.setState({
            grid: this.state.grid.map((row) =>
              row.map((cell) =>
                (cell === modifiedCell) ? ({value: value}) : cell
              )
            )
          })
        }
      />
    )
  }
}
