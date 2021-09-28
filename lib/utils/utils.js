'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Tells if an object is empty.
 *
 * @param {object} obj The object to check.
 * @returns {bool} If the object is empty or not.
 */
var isEmptyObj = exports.isEmptyObj = function isEmptyObj(obj) {
  return Object.keys(obj).length === 0;
};

/**
 * Given a start and end position it return an array with all the positions
 * in between, both start and end positions included.
 *
 * @param {int} start Start position.
 * @param {int} end End position.
 * @returns {array} The positions in the range.
 */
var range = exports.range = function range(start, end) {
  var array = [];
  var inc = end - start > 0;

  for (var i = start; inc ? i <= end : i >= end; inc ? i++ : i--) {
    inc ? array.push(i) : array.unshift(i);
  }

  return array;
};

/**
 * Compare a position state like editing or reverting with an i and j positions given.
 *
 * @param {object} state It should be an object with the i and j positions.
 * @param {int} i Row position
 * @param {int} j Column position
 * @returns {bool} True if it's the same cell position.
 */
var cellStateComparison = exports.cellStateComparison = function cellStateComparison(state, i, j) {
  return state.i === i && state.j === j;
};

/**
 * Tells if the cell at the position (i, j) is selected.
 *
 * @param {object} start Start state that indicates where the selected cells start.
 * @param {object} end End state that indicates where the selected cells end.
 * @param {int} i Row position
 * @param {int} j Column position
 * @returns {bool} True if the cell at the position (i, j) is in the selected range
 */
var isCellSelected = exports.isCellSelected = function isCellSelected(start, end, i, j) {
  var posX = j >= start.j && j <= end.j;
  var negX = j <= start.j && j >= end.j;
  var posY = i >= start.i && i <= end.i;
  var negY = i <= start.i && i >= end.i;

  return posX && posY || negX && posY || negX && negY || posX && negY;
};

/**
 * Tells if value is undefined.
 *
 * @param {any} value The value to be checked.
 * @returns {bool} True if the value is undefined.
 */
var isUndefined = exports.isUndefined = function isUndefined(value) {
  return typeof value === 'undefined';
};