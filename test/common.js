import expect from 'expect'

import {
  handleKeyLogic,
  handleCopyLogic,
  handlePasteLogic
} from '../src/utils/dataSheet'

import {
  isEmptyObj,
  nullFunction,
  cellStateComparison,
  isCellSelected,
  isUndefined,
  range
} from '../src/utils/utils'

describe('Utils', () => {
  describe('Logic functions', () => {
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

    it('handleKeyLogic', () => {
      expect(true).toBe(true);
    })
  })

  describe('Utility functions', () => {
    it('isEmptyObj', () => {
      expect(isEmptyObj({})).toBe(true);
      expect(isEmptyObj({a:1})).toBe(false);
    })

    it('nullFunction', () => {
      expect(nullFunction()).toEqual(undefined);
    })

    it('cellStateComparison', () => {
      expect(cellStateComparison({i: 1, j: 5}, 1, 5)).toBe(true);
      expect(cellStateComparison({i: 1, j: 5}, 2, 5)).toBe(false);
    })

    it('isCellSelected', () => {
      expect(isCellSelected({i: 0, j: 0}, {i: 1, j: 1}, 1, 2)).toBe(false);
      expect(isCellSelected({i: 0, j: 0}, {i: 1, j: 1}, 0, 1)).toBe(true);
    })

    it('isUndefined', () => {
      expect(isUndefined(undefined)).toBe(true);
      expect(isUndefined(null)).toBe(false);
      expect(isUndefined(0)).toBe(false);
      expect(isUndefined('undefined')).toBe(false);
      expect(isUndefined(true)).toBe(false);
    })

    it('range', () => {
      expect(range(1, 5)).toEqual([1, 2, 3, 4, 5]);
      expect(range(1, 3)).toEqual([1, 2, 3]);
      expect(range(4, 8)).toEqual([4, 5, 6, 7, 8]);
    })
  })
})