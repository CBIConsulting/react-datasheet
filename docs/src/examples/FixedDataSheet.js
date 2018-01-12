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
        [{readOnly: true, value: 4, fixed: true}, {value: 2, fixed: true}, {value: 4}, {value: 4}, {value: 4}],
        [{readOnly: true, value: 5, fixed: true}, {value: 1, fixed: true}, {value: 1}, {value: 3}, {value: 1}],
        [{readOnly: true, value: 6, fixed: true}, {value: 2, fixed: true}, {value: 4}, {value: 4}, {value: 3}],
        [{readOnly: true, value: 7, fixed: true}, {value: 1, fixed: true}, {value: 2}, {value: 3}, {value: 2}],
        [{readOnly: true, value: 8, fixed: true}, {value: 2, fixed: true}, {value: 4}, {value: 4}, {value: 5}],
        [{readOnly: true, value: 9, fixed: true}, {value: 1, fixed: true}, {value: 3}, {value: 3}, {value: 12}],
        [{readOnly: true, value: 10, fixed: true}, {value: 2, fixed: true}, {value: 4}, {value: 4}, {value: 1}]
      ]
    }
  }
  render () {
    return (
      <FixedDataSheet
        headerData={this.state.header}
        data={this.state.grid}
        width={'300px'}
        height={'150px'}
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
