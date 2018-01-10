import expect from 'expect'

import {
  handleKeyLogic,
  handleCopyLogic,
  handlePasteLogic
} from '../src/utils/dataSheet'

describe('Utility functions', () => {
  const copyData = '5\t2\n1\t6';
  const eventSimulation = {
    preventDefault: () => {},
    clipboardData: {
      getData(type) {
        return copyData
      }
    }
  };
  const data = [
    [{value: 5}, {value: 2}],
    [{value: 1}, {value: 6}],
  ];
  const valueRenderer = cell => cell.value;
  const props = {data, valueRenderer};
  const state = {
    start: {i: 0, j: 0},
    end: {i: 1, j: 1}
  };

  it('handleCopyLogic', () => {
    expect(handleCopyLogic(eventSimulation, props, state)).toEqual(copyData)
  })

  it('handlePasteLogic', () => {
    expect(handlePasteLogic(eventSimulation, props, state)).toEqual({
      changedCells: [
        {
          cell: {value: 5},
          i: 0,
          j: 0,
          value: '5'
        },
        {
          cell: {value: 2},
          i: 0,
          j: 1,
          value: '2'
        },
        {
          cell: {value: 1},
          i: 1,
          j: 0,
          value: '1'
        },
        {
          cell: {value: 6},
          i: 1,
          j: 1,
          value: '6'
        }
      ],
      end: {i: 1, j: 1},
      pastedData: [
        [
          {
            cell: {value: 5},
            data: '5'
          },
          {
            cell: {value: 2},
            data: '2'
          }
        ],
        [
          {
            cell: {value: 1},
            data: '1'
          },
          {
            cell: {value: 6},
            data: '6'
          }
        ]
      ]
    })
  })
})