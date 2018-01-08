import { isEmptyObj, range } from './utils';
import {
  TAB_KEY, ESCAPE_KEY, LEFT_KEY,
  UP_KEY, RIGHT_KEY, DOWN_KEY,
  DELETE_KEY, BACKSPACE_KEY,
  ENTER_KEY
} from './constanct';

// Private functions
const handleKeyboardCellMovement = (start, forceEdit, isEditing, data, e) => {
  const currentCell = data[start.i][start.j];
  let newLocation = null;

  if (
      (!forceEdit && currentCell.component === undefined)
      || !isEditing
      || e.keyCode === TAB_KEY
  ) {
    if (e.keyCode === TAB_KEY && !e.shiftKey) {
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
  }

  return newLocation;
}

const getSelectedCells = (data, start, end, readOnly = true) => {
  const selected = [];

  range(start.i, end.i).forEach(i => (
    range(start.j, end.j).forEach(j => {
      const cell = data[i][j];

      if (readOnly || !cell.readOnly) {
        selected.push({cell, i, j});
      }
    })
  ));

  return selected;
}

const parsePaste = (str) => {
  return str.split(/\r\n|\n|\r/).map(row => row.split('\t'));
}

/* Handle Key */
export const handleKeyLogic = (e, props, state) => {
  const { start, end, editing, forceEdit } = state;
  const { data } = props;
  const noCellsSelected = isEmptyObj(start);
  const ctrlKeyPressed = e.ctrlKey || e.metaKey;
  const buildReturn = (newState = false, cleanCells = false) => ({ newState, cleanCells });

  if (!noCellsSelected && !ctrlKeyPressed) {
    const isEditing = !isEmptyObj(editing);
    const newLocation = handleKeyboardCellMovement(start, forceEdit, isEditing, data, e);

    if (newLocation) {
      e.preventDefault();

      if (data[newLocation.i] && typeof(data[newLocation.i][newLocation.j]) !== 'undefined') {
        return buildReturn({
          start: newLocation,
          end: newLocation,
          editing: {}
        });
      }
    } else {
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

      if (deleteKeysPressed && !isEditing) {
        e.preventDefault();
        return buildReturn(false, getSelectedCells(data, start, end, false));
      } else if (enterKeyPressed && isEditing) {
        return buildReturn({editing: {}, reverting: {}});
      } else if (escapeKeyPressed && isEditing) {
        return buildReturn({editing: {}, reverting: editing });
      } else if (enterKeyPressed && !isEditing  && !cell.readOnly) {
        return buildReturn({editing: start, clear: {}, reverting: {}, forceEdit: true});
      } else if (numbersPressed
        || numPadKeysPressed
        || lettersPressed
        || equationKeysPressed
        || enterKeyPressed
      ) {
        //empty out cell if user starts typing without pressing enter
        if (!isEditing && !cell.readOnly) {
          return buildReturn({
            editing: start,
            clear: start,
            reverting: {},
            forceEdit: false
          });
        }
      }
    }
  }

  return buildReturn();
}

// Handle copy and paste
export const handleCopyLogic = (e, props, state) => {
  const { dataRenderer, valueRenderer, data } = props;
  const { start, end } = state;
  e.preventDefault();

  return range(start.i, end.i).map(i =>
    range(start.j, end.j).map(j => {
      const cell = data[i][j];
      const value = dataRenderer ? dataRenderer(cell, i, j) : null;

      if (value === '' || value === null || typeof(value) === 'undefined') {
        return valueRenderer(cell, i, j);
      }

      return value;
    }).join('\t')
  ).join('\n');
}

export const handlePasteLogic = (e, props, state) => {
  const { data, onPaste } = props;
  const start = state.start;
  const parse = props.parsePaste || parsePaste;
  const changedCells = [];
  let end = {};

  const pastedDataMap = parse(e.clipboardData.getData('text/plain')).map(
    (row, i) => row.map(
      (cellData, j) => {
        const cell = data[start.i + i] && data[start.i + i][start.j + j];

        if (cell && !cell.readOnly && !onPaste) {
          changedCells.push({cell, i: start.i + i, j: start.j + j, value: cellData});
          end = {i: start.i + i, j: start.j + j};
        }

        return {cell: cell, data: cellData};
      }
    )
  );

  return {
    pastedData: pastedDataMap,
    end: end,
    changedCells
  }
}