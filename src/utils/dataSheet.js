import { isEmptyObj, range, isUndefined } from './utils'
import {
  enterKeyPressed, deleteKeyPressed, escapeKeyPressed,
  numbersPressed, lettersPressed, numPadKeysPressed,
  equationKeysPressed, tabKeyPressed, rightKeyPressed,
  leftKeyPressed, downKeyPressed, upKeyPressed
} from './keyboard'

// Shared logic management methods for the datasheets

/**
 * Handle key logic return type definition.
 *
 * @typedef {object} KeyLogic
 * @property {object | false} newState The state changes.
 * @property {array | false} cleanCells The cells to be clean.
 */

/**
 * Handle the key up event logic.
 *
 * @param {KeyboardEvent} e KeyboardEvent event object. https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
 * @param {object} props Datasheet current props.
 * @param {object} state Datasheet current state.
 * @returns {KeyLogic} This object contains the new updated state and the cells that have to
 *                    be deleted for the case of delete key pressed. If there's no change
 *                    in the state (is editing, trying to move outside the datasheet area...)
 *                    or no cells to be cleaned a false value will be return, in the asociated
 *                    keys of the object.
 */
export const handleKeyLogic = (e, props, state) => {
  const { start, end, editing, forceEdit } = state
  const { data } = props
  const haveSelectedCells = !isEmptyObj(start)
  const ctrlKeyPressed = e.ctrlKey || e.metaKey
  const buildReturn = (newState = false, cleanCells = false) => ({ newState, cleanCells })

  if (haveSelectedCells && !ctrlKeyPressed) {
    const isEditing = !isEmptyObj(editing)
    const newLocation = handleKeyboardCellMovement(start, forceEdit, isEditing, data, e)
    
    // Movement key pressed
    if (newLocation) {
      e.preventDefault()

      return buildReturn({
        start: newLocation,
        end: newLocation,
        editing: {}
      })
    }

    const readOnly = data[start.i][start.j].readOnly

    // If delete key pressed then get the selected cells (to empty those cells)
    if (deleteKeyPressed(e.keyCode) && !isEditing) {
      e.preventDefault()
      return buildReturn({editing: {}}, getSelectedCells(data, start, end, false))
    }
    
    // If enter key and is editing go to next row (if there is more rows)
    if (enterKeyPressed(e.keyCode) && isEditing) {
      const upState = {
        editing: {},
        reverting: {}
      };

      if (data[start.i + 1] && data[start.i + 1][start.j]) {
        upState.start = {i: start.i + 1, j: start.j }
        upState.end = upState.start
      }

      return buildReturn(upState)
    }
    
    // If escape key was pressed and it's editing then revert the changes.
    if (escapeKeyPressed(e.keyCode) && isEditing) {
      return buildReturn({
        editing: {},
        reverting: editing
      })
    }
    
    // If enter and not editing then edit the current cell
    if (enterKeyPressed(e.keyCode) && !isEditing && !readOnly) {
      return buildReturn({
        editing: start,
        clear: {},
        reverting: {},
        forceEdit: true
      })
    }
    
    // Empty out cell if user starts typing without pressing enter
    if (
      !isEditing && !readOnly &&
      (
        numbersPressed(e.keyCode) ||
        numPadKeysPressed(e.keyCode) ||
        lettersPressed(e.keyCode) ||
        equationKeysPressed(e.keyCode)
      )  
    ) {
      return buildReturn({
        editing: start,
        clear: start,
        reverting: {},
        forceEdit: false
      })
    }
  }

  return buildReturn()
}

/**
 * Handle the copy event logic.
 *
 * @param {ClipboardEvent} e ClipboardEvent event object. https://developer.mozilla.org/en-US/docs/Web/API/ClipboardEvent
 * @param {object} props Datasheet current props.
 * @param {object} state Datasheet current state.
 * @returns {string} The selected cells data as a string with tabulation format
 *                    for cells and line breaks for the rows.
 */
export const handleCopyLogic = (e, props, state) => {
  const { dataRenderer, valueRenderer, data } = props
  const { start, end } = state
  e.preventDefault()

  return range(start.i, end.i).map(i =>
    range(start.j, end.j).map(j => {
      const cell = data[i][j]
      const value = dataRenderer ? dataRenderer(cell, i, j) : null

      if (value === null || value === '' || isUndefined(value)) {
        return valueRenderer(cell, i, j)
      }

      return value
    }).join('\t')
  ).join('\n')
}

/**
 * Handle paste logic return type definition.
 *
 * @typedef {object} PasteLogic
 * @property {array} pastedData It's an two dimensional array with cells and its data.
 * @property {object} end Indicates where the paste end if it's within the datasheet area.
 * @property {array} changedCells Changed cells. It's an array of objects. Each object contains
 *                                the row and column position, the cell object and the value.
 */

/**
 *
 * @param {ClipboardEvent} e ClipboardEvent event object. https://developer.mozilla.org/en-US/docs/Web/API/ClipboardEvent
 * @param {object} props Datasheet current props.
 * @param {object} state Datasheet current state.
 * @returns {PasteLogic} It give us information about what have been copied and where.
 */
export const handlePasteLogic = (e, props, state) => {
  const { data, onPaste } = props
  const start = state.start
  const parse = props.parsePaste || parsePaste
  const changedCells = []
  let end = {}

  const pastedDataMap = parse(e.clipboardData.getData('text/plain')).map(
    (row, i) => row.map(
      (cellData, j) => {
        const cell = data[start.i + i] && data[start.i + i][start.j + j]

        if (cell && !cell.readOnly && !onPaste) {
          changedCells.push({cell, i: start.i + i, j: start.j + j, value: cellData})
          end = {i: start.i + i, j: start.j + j}
        }

        return {cell: cell, data: cellData}
      }
    )
  )

  return {
    pastedData: pastedDataMap,
    end: end,
    changedCells
  }
}

/**
 * Handle the movement between cells using the keyboard. Given the current position,
 * data and options it gets the new location (i as in row and j as in cell positions).
 *
 * @param {object} start The current edit position or the start position when various
 *                        cells selected.
 * @param {bool} forceEdit Indicates that a double click was made in a cell.
 * @param {bool} isEditing Indicates if a cell is being edited right now.
 * @param {array} data Cells data of the datasheet
 * @param {KeyboardEvent} e KeyboardEvent data object
 * @returns {object | null} The new selected cell location or null if no movement key
 *                          was pressed
 */
function handleKeyboardCellMovement (start, forceEdit, isEditing, data, e) {
  const tabKPressed = tabKeyPressed(e.keyCode)
  let newLocation = null

  // Ignore movement keys when editing unless it's tab key
  if (
      (!forceEdit && isUndefined(data[start.i][start.j].component)) ||
      !isEditing ||
      tabKPressed
  ) {
    if (tabKPressed && !e.shiftKey) { // Move right
      newLocation = {i: start.i, j: start.j + 1}
      newLocation = !isUndefined(data[newLocation.i][newLocation.j]) ? newLocation : { i: start.i + 1, j: 0}
    } else if (rightKeyPressed(e.keyCode)) { // Move right
      newLocation = {i: start.i, j: start.j + 1}
    } else if (leftKeyPressed(e.keyCode) || (tabKPressed && e.shiftKey)) { // Move left
      newLocation = {i: start.i, j: start.j - 1}
    } else if (upKeyPressed(e.keyCode)) { // Move up
      newLocation = {i: start.i - 1, j: start.j}
    } else if (downKeyPressed(e.keyCode)) { // Move down
      newLocation = {i: start.i + 1, j: start.j}
    }

    // If the new location doesn't exist whitin the datasheet area
    if (
      newLocation && (
        !data[newLocation.i] ||
        (data[newLocation.i] && isUndefined(data[newLocation.i][newLocation.j]))
      )
    ) {
      newLocation = null
    }
  }

  return newLocation
}

/**
 * Given the start and end position gets an array with the selected cells.
 *
 * @param {array} data Cells data of the datasheet
 * @param {object} start The current edit position or the start position when various
 *                        cells selected.
 * @param {object} end The current edit position or the end position when various
 *                      cells selected.
 * @param {bool} readOnly Ignore readOnly property of the cell
 * @returns {array} Selected cells
 */
function getSelectedCells (data, start, end, readOnly = true) {
  const selected = []

  range(start.i, end.i).forEach(i => (
    range(start.j, end.j).forEach(j => {
      const cell = data[i][j]

      if (readOnly || !cell.readOnly) {
        selected.push({cell, i, j})
      }
    })
  ))

  return selected
}

/**
 * Parse the pasted string and turn it into a 2 dimensional matrix of cells.
 *
 * @param {string} str The string that have been pasted.
 * @returns {array} The pasted data turned into a 2 dimensional matrix of cells.
 */
function parsePaste (str) {
  return str.split(/\r\n|\n|\r/).map(row => row.split('\t'))
}
