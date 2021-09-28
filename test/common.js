import expect from 'expect'

import {
  handleKeyLogic,
  handleCopyLogic,
  handlePasteLogic
} from '../src/utils/dataSheet'

import {
  isEmptyObj,
  cellStateComparison,
  isCellSelected,
  isUndefined,
  range
} from '../src/utils/utils'

import {
  TAB_KEY, ESCAPE_KEY, LEFT_KEY,
  UP_KEY, RIGHT_KEY, DOWN_KEY,
  DELETE_KEY, BACKSPACE_KEY,
  ENTER_KEY
} from '../src/utils/constanct';

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
      [{value: 8}, {value: 9}],
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

    describe('handleKeyLogic', () => {
      const currentPosition = {i: 1, j: 0};
      const doNothing = {
        newState: false,
        cleanCells: false
      }
      let customEvent, customState;
      
      beforeEach(() => {
        customEvent = {
          ctrlKey: false,
          keyCode: null,
          shiftKey: false,
          ...eventSimulation
        }
        
        customState = {
          start: currentPosition,
          end: currentPosition,
          editing: {},
          forceEdit: false
        }
      })

      it('do nothing when no selected cells', () => {
        customState.start = {}
        customState.end = {}
        expect(handleKeyLogic(customEvent, props, customState)).toEqual(doNothing);
      })

      it('do nothing when there\'re selected cells but control key is not pressed', () => {
        expect(handleKeyLogic(customEvent, props, customState)).toEqual(doNothing);
      })

      it('do nothing on movement key pressed and editing', () => {
        customState.editing = currentPosition
        customEvent.keyCode = LEFT_KEY
        expect(handleKeyLogic(customEvent, props, customState)).toEqual(doNothing);
      })

      it('move right and exit editing when tab key pressed', () => {
        customState.editing = currentPosition
        customEvent.keyCode = TAB_KEY

        expect(handleKeyLogic(customEvent, props, customState)).toEqual({
          cleanCells: false,
          newState: {
            editing: {},
            start: {j: 1, i: 1},
            end: {j: 1, i: 1}
          }
        })
      })

      it('move left and exit editing when tab key + shift key pressed', () => {
        const customPosition = {i: 1, j: 1}
        customState.start = customPosition
        customState.end = customPosition
        customState.editing = customPosition
        customEvent.keyCode = TAB_KEY
        customEvent.shiftKey = true

        expect(handleKeyLogic(customEvent, props, customState)).toEqual({
          cleanCells: false,
          newState: {
            editing: {},
            start: {i: 1, j: 0},
            end: {i: 1, j: 0}
          }
        })
      })

      it('move left when left key pressed', () => {
        const customPosition = {i: 1, j: 1}
        customState.start = customPosition
        customState.end = customPosition
        customEvent.keyCode = LEFT_KEY

        expect(handleKeyLogic(customEvent, props, customState)).toEqual({
          cleanCells: false,
          newState: {
            editing: {},
            start: {i: 1, j: 0},
            end: {i: 1, j: 0}
          }
        })
      })

      it('move right when right key pressed', () => {
        customEvent.keyCode = RIGHT_KEY

        expect(handleKeyLogic(customEvent, props, customState)).toEqual({
          cleanCells: false,
          newState: {
            editing: {},
            start: {i: 1, j: 1},
            end: {i: 1, j: 1}
          }
        })
      })

      it('move down when down key pressed', () => {
        customEvent.keyCode = DOWN_KEY

        expect(handleKeyLogic(customEvent, props, customState)).toEqual({
          cleanCells: false,
          newState: {
            editing: {},
            start: {i: 2, j: 0},
            end: {i: 2, j: 0}
          }
        })
      })

      it('move up when up key pressed', () => {
        customEvent.keyCode = UP_KEY

        expect(handleKeyLogic(customEvent, props, customState)).toEqual({
          cleanCells: false,
          newState: {
            editing: {},
            start: {i: 0, j: 0},
            end: {i: 0, j: 0}
          }
        })
      })

      it('get selected cells to remove on delete keys pressed', () => {
        customEvent.keyCode = DELETE_KEY

        expect(handleKeyLogic(customEvent, props, customState)).toEqual({
          cleanCells: [{cell: {value: 1}, i: 1, j: 0}],
          newState: {editing: {}}
        });
      })

      it('get selected cells to remove on delete keys pressed and not editing', () => {
        customEvent.keyCode = DELETE_KEY

        expect(handleKeyLogic(customEvent, props, customState)).toEqual({
          cleanCells: [{cell: {value: 1}, i: 1, j: 0}],
          newState: {editing: {}}
        })
      })

      it('do nothing on delete keys pressed and editing', () => {
        customState.editing = currentPosition
        customEvent.keyCode = DELETE_KEY
        expect(handleKeyLogic(customEvent, props, customState)).toEqual(doNothing);
      })

      it('get selected cells to remove on delete keys pressed', () => {
        customEvent.keyCode = DELETE_KEY

        expect(handleKeyLogic(customEvent, props, customState)).toEqual({
          cleanCells: [{cell: {value: 1}, i: 1, j: 0}],
          newState: {editing: {}}
        });
      })

      it('revert changes on escape key pressed and exit edit mode', () => {
        customState.editing = currentPosition
        customEvent.keyCode = ESCAPE_KEY
        expect(handleKeyLogic(customEvent, props, customState)).toEqual({
          cleanCells: false,
          newState: {
            editing: {},
            reverting: currentPosition
          }
        });
      })

      it('do nothing on escape key pressed and not editing', () => {
        customEvent.keyCode = ESCAPE_KEY
        expect(handleKeyLogic(customEvent, props, customState)).toEqual(doNothing);
      })

      it('edit the current cell on enter key pressed and not already editing (not read only)', () => {    
        customEvent.keyCode = ENTER_KEY
        expect(handleKeyLogic(customEvent, props, customState)).toEqual({
          cleanCells: false,
          newState: {
            editing: currentPosition,
            clear: {},
            reverting: {},
            forceEdit: true
          }
        });
      })

      it('do nothing on enter key pressed and not already editing (read only)', () => {
        const customProps = {
          data: [
            [{value: 5}],
            [{value: 1, readOnly: true}]
          ]
        }
        customEvent.keyCode = ENTER_KEY
        expect(handleKeyLogic(customEvent, customProps, customState)).toEqual(doNothing);
      })

      it('move to next row and leave editing on enter key pressed and editing', () => {
        customState.editing = currentPosition
        customEvent.keyCode = ENTER_KEY
        expect(handleKeyLogic(customEvent, props, customState)).toEqual({
          cleanCells: false,
          newState: {
            editing: {},
            reverting: {},
            start: {i: 2, j: 0},
            end: {i: 2, j: 0}
          }
        });
      })

      it('leave editing on enter key pressed and editing, bein the last row', () => {
        const customPosition = {i: 2, j: 0}
        customState.start = customPosition
        customState.end = customPosition
        customState.editing = customPosition
        customEvent.keyCode = ENTER_KEY

        expect(handleKeyLogic(customEvent, props, customState)).toEqual({
          cleanCells: false,
          newState: {
            editing: {},
            reverting: {}
          }
        });
      })

      it('empty out cell if user starts typing without pressing enter', () => {
        const expected = {
          cleanCells: false,
          newState: {
            editing: currentPosition,
            clear: currentPosition,
            reverting: {},
            forceEdit: false
          }
        };

        // Numbers
        customEvent.keyCode = 48
        expect(handleKeyLogic(customEvent, props, customState)).toEqual(expected);
        customEvent.keyCode = 50
        expect(handleKeyLogic(customEvent, props, customState)).toEqual(expected);
        customEvent.keyCode = 54
        expect(handleKeyLogic(customEvent, props, customState)).toEqual(expected);
        customEvent.keyCode = 57
        expect(handleKeyLogic(customEvent, props, customState)).toEqual(expected);

        // Ignore
        customEvent.keyCode = 58
        expect(handleKeyLogic(customEvent, props, customState)).toEqual(doNothing);
        customEvent.keyCode = 64
        expect(handleKeyLogic(customEvent, props, customState)).toEqual(doNothing);

        // Letters
        customEvent.keyCode = 65
        expect(handleKeyLogic(customEvent, props, customState)).toEqual(expected);
        customEvent.keyCode = 69
        expect(handleKeyLogic(customEvent, props, customState)).toEqual(expected);
        customEvent.keyCode = 75
        expect(handleKeyLogic(customEvent, props, customState)).toEqual(expected);
        customEvent.keyCode = 90
        expect(handleKeyLogic(customEvent, props, customState)).toEqual(expected);

        // Ignore
        customEvent.keyCode = 92
        expect(handleKeyLogic(customEvent, props, customState)).toEqual(doNothing);
        customEvent.keyCode = 95
        expect(handleKeyLogic(customEvent, props, customState)).toEqual(doNothing);

        // Num pad
        customEvent.keyCode = 187
        expect(handleKeyLogic(customEvent, props, customState)).toEqual(expected);
        customEvent.keyCode = 189
        expect(handleKeyLogic(customEvent, props, customState)).toEqual(expected);
        customEvent.keyCode = 190
        expect(handleKeyLogic(customEvent, props, customState)).toEqual(expected);
        customEvent.keyCode = 107
        expect(handleKeyLogic(customEvent, props, customState)).toEqual(expected);
        customEvent.keyCode = 109
        expect(handleKeyLogic(customEvent, props, customState)).toEqual(expected);
        customEvent.keyCode = 110
        expect(handleKeyLogic(customEvent, props, customState)).toEqual(expected);
      })
    })
  })

  describe('Utility functions', () => {
    it('isEmptyObj', () => {
      expect(isEmptyObj({})).toBe(true);
      expect(isEmptyObj({a:1})).toBe(false);
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