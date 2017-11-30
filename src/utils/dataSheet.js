/* Handle Key */
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

      if (readOnly || !data[i][j].readOnly) {
        selected.push({cell, i, j});
      }
    })
  ));

  return selected;
}

export const handleKey = (start, end, forceEdit, editing, data, e) => {
  const noCellsSelected = isEmptyObj(start);
  const ctrlKeyPressed = e.ctrlKey || e.metaKey;
  const buildReturn = (newState = false, cleanCells = false) => ({ newState, cleanCells });

  if (!noCellsSelected && !ctrlKeyPressed) {
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
      const isEditing = !isEmptyObj(editing);

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
export const copy = (data, dataRenderer, valueRenderer, start, end, e) => {
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

export const paste = (newStringData, data, startI, startJ, parser) => {
  const parsedData = (parser || parsePaste)(newStringData);
  const changedCells = [];
  let end = {};

  const pastedMap = parsedData.map((row, i) => {
    return row.map((pastedData, j) => {
      const cell = data[startI + i] && data[startI + i][startJ + j];

      if (cell && !cell.readOnly) {
        changedCells.push({i: startI + i, j: startJ + j, value: pastedData});
        end = {i: start.i + i, j: start.j + j};
      }

      return {cell: cell, data: pastedData};
    });
  });

  return {
    pastedData: pastedMap,
    end: end,
    changedCells
  }
}