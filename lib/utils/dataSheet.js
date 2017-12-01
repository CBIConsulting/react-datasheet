'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handlePasteLogic = exports.handleCopyLogic = exports.handleKeyLogic = undefined;

var _utils = require('./utils');

var _constanct = require('./constanct');

// Private functions
var handleKeyboardCellMovement = function handleKeyboardCellMovement(start, forceEdit, isEditing, data, e) {
  var currentCell = data[start.i][start.j];
  var newLocation = null;

  if (!forceEdit && currentCell.component === undefined || !isEditing || e.keyCode === _constanct.TAB_KEY) {
    if (e.keyCode === _constanct.TAB_KEY && !e.shiftKey) {
      newLocation = { i: start.i, j: start.j + 1 };
      newLocation = typeof data[newLocation.i][newLocation.j] !== 'undefined' ? newLocation : { i: start.i + 1, j: 0 };
    } else if (e.keyCode === _constanct.RIGHT_KEY) {
      newLocation = { i: start.i, j: start.j + 1 };
    } else if (e.keyCode === _constanct.LEFT_KEY || e.keyCode === _constanct.TAB_KEY && e.shiftKey) {
      newLocation = { i: start.i, j: start.j - 1 };
    } else if (e.keyCode === _constanct.UP_KEY) {
      newLocation = { i: start.i - 1, j: start.j };
    } else if (e.keyCode === _constanct.DOWN_KEY) {
      newLocation = { i: start.i + 1, j: start.j };
    }
  }

  return newLocation;
};

var getSelectedCells = function getSelectedCells(data, start, end) {
  var readOnly = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

  var selected = [];

  (0, _utils.range)(start.i, end.i).forEach(function (i) {
    return (0, _utils.range)(start.j, end.j).forEach(function (j) {
      var cell = data[i][j];

      if (readOnly || !data[i][j].readOnly) {
        selected.push({ cell: cell, i: i, j: j });
      }
    });
  });

  return selected;
};

var parsePaste = function parsePaste(str) {
  return str.split(/\r\n|\n|\r/).map(function (row) {
    return row.split('\t');
  });
};

/* Handle Key */
var handleKeyLogic = exports.handleKeyLogic = function handleKeyLogic(e, props, state) {
  var start = state.start,
      end = state.end,
      editing = state.editing,
      forceEdit = state.forceEdit;
  var data = props.data;

  var noCellsSelected = (0, _utils.isEmptyObj)(start);
  var ctrlKeyPressed = e.ctrlKey || e.metaKey;
  var buildReturn = function buildReturn() {
    var newState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var cleanCells = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    return { newState: newState, cleanCells: cleanCells };
  };

  if (!noCellsSelected && !ctrlKeyPressed) {
    var isEditing = !(0, _utils.isEmptyObj)(editing);
    var newLocation = handleKeyboardCellMovement(start, forceEdit, isEditing, data, e);

    if (newLocation) {
      e.preventDefault();

      if (data[newLocation.i] && typeof data[newLocation.i][newLocation.j] !== 'undefined') {
        return buildReturn({
          start: newLocation,
          end: newLocation,
          editing: {}
        });
      }
    } else {
      var deleteKeysPressed = e.keyCode === _constanct.DELETE_KEY || e.keyCode === _constanct.BACKSPACE_KEY;
      var enterKeyPressed = e.keyCode === _constanct.ENTER_KEY;
      var escapeKeyPressed = e.keyCode === _constanct.ESCAPE_KEY;
      var numbersPressed = e.keyCode >= 48 && e.keyCode <= 57;
      var lettersPressed = e.keyCode >= 65 && e.keyCode <= 90;
      var numPadKeysPressed = e.keyCode >= 96 && e.keyCode <= 105;
      var cell = data[start.i][start.j];
      var equationKeysPressed = [187, /* equal */
      189, /* substract */
      190, /* period */
      107, /* add */
      109, /* decimal point */
      110].indexOf(e.keyCode) > -1;

      if (deleteKeysPressed && !isEditing) {
        e.preventDefault();
        return buildReturn(false, getSelectedCells(data, start, end, false));
      } else if (enterKeyPressed && isEditing) {
        return buildReturn({ editing: {}, reverting: {} });
      } else if (escapeKeyPressed && isEditing) {
        return buildReturn({ editing: {}, reverting: editing });
      } else if (enterKeyPressed && !isEditing && !cell.readOnly) {
        return buildReturn({ editing: start, clear: {}, reverting: {}, forceEdit: true });
      } else if (numbersPressed || numPadKeysPressed || lettersPressed || equationKeysPressed || enterKeyPressed) {
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
};
/*
 function handleKey(e) {
    const {start, end, editing} = this.state;
    const data = this.props.data;
    const isEditing = !isEmpty(editing);
    const noCellsSelected = isEmpty(start);
    const ctrlKeyPressed = e.ctrlKey || e.metaKey;
    const deleteKeysPressed = (e.keyCode === DELETE_KEY || e.keyCode === BACKSPACE_KEY);
    const enterKeyPressed = e.keyCode === ENTER_KEY;
    const escapeKeyPressed = e.keyCode === ESCAPE_KEY;
    const numbersPressed = (e.keyCode >= 48 && e.keyCode <= 57);
    const lettersPressed = (e.keyCode >= 65 && e.keyCode <= 90);
    const numPadKeysPressed = (e.keyCode >= 96 && e.keyCode <= 105);
    const cell = data[start.i][start.j];
    const equationKeysPressed = [
      187,
      110
    ].indexOf(e.keyCode) > -1;

    if (noCellsSelected || ctrlKeyPressed || this.handleKeyboardCellMovement(e)) {
      return true;
    }


    if (deleteKeysPressed && !isEditing) {
      this.getSelectedCells(data, start, end).map(({cell, i, j}) =>
        (!cell.readOnly) ? this.onChange(i, j, '') : null
      );
      e.preventDefault();
    } else if (enterKeyPressed && isEditing) {
      this.setState({editing: {}, reverting: {}});
    } else if (escapeKeyPressed && isEditing) {
      this.setState({editing: {}, reverting: editing});
    } else if (enterKeyPressed && !isEditing  && !cell.readOnly) {
      this.setState({editing: start, clear: {}, reverting: {}, forceEdit: true});
    } else if (numbersPressed
      || numPadKeysPressed
      || lettersPressed
      || equationKeysPressed
      || enterKeyPressed
    ) {
      //empty out cell if user starts typing without pressing enter
      if (!isEditing && !cell.readOnly) {
        this.setState({
          editing: start,
          clear: start,
          reverting: {},
          forceEdit: false
        });
      }
    }
  }*/

// Handle copy and paste
var handleCopyLogic = exports.handleCopyLogic = function handleCopyLogic(e, props, state) {
  var dataRenderer = props.dataRenderer,
      valueRenderer = props.valueRenderer,
      data = props.data;
  var start = state.start,
      end = state.end;

  e.preventDefault();

  return (0, _utils.range)(start.i, end.i).map(function (i) {
    return (0, _utils.range)(start.j, end.j).map(function (j) {
      var cell = data[i][j];
      var value = dataRenderer ? dataRenderer(cell, i, j) : null;

      if (value === '' || value === null || typeof value === 'undefined') {
        return valueRenderer(cell, i, j);
      }

      return value;
    }).join('\t');
  }).join('\n');
};

var handlePasteLogic = exports.handlePasteLogic = function handlePasteLogic(e, props, state) {
  var data = props.data,
      onPaste = props.onPaste;

  var start = state.start;
  var parse = props.parsePaste || parsePaste;
  var changedCells = [];
  var end = {};

  var pastedDataMap = parse(e.clipboardData.getData('text/plain')).map(function (row, i) {
    return row.map(function (cellData, j) {
      var cell = data[start.i + i] && data[start.i + i][start.j + j];

      if (cell && !cell.readOnly && !onPaste) {
        changedCells.push({ cell: cell, i: start.i + i, j: start.j + j, value: cellData });
        end = { i: start.i + i, j: start.j + j };
      }

      return { cell: cell, data: cellData };
    });
  });

  return {
    pastedData: pastedDataMap,
    end: end,
    changedCells: changedCells
  };
};