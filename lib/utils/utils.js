'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Filter cell extra attributes to get only the valid ones. Right now the only
 * valid extra attributes are the ones with the data prefix. This is an object
 * where the key is the attribute name and the value is its value.
 * Ex: {data-hint: 'Hint to display on cell hover'}
 *
 * @param { object } attributes  Extra attributes of the cell.
 * @return { object } Filtered attributes. An empty object if there is no attributes.
 */
var filterCellExtraAttributes = exports.filterCellExtraAttributes = function filterCellExtraAttributes(attributes) {
  var filteredAttribs = {};

  if (attributes) {
    Object.keys(attributes).forEach(function (attribName) {
      if (attribName.indexOf('data-') === 0) {
        filteredAttribs[attribName] = attributes[attribName];
      }
    });
  }

  return filteredAttribs;
};

var isEmptyObj = exports.isEmptyObj = function isEmptyObj(obj) {
  return Object.keys(obj).length === 0;
};
var range = exports.range = function range(start, end) {
  var array = [];
  var inc = end - start > 0;

  for (var i = start; inc ? i <= end : i >= end; inc ? i++ : i--) {
    inc ? array.push(i) : array.unshift(i);
  }

  return array;
};
var nullFunction = exports.nullFunction = function nullFunction(obj) {};
var cellStateComparison = exports.cellStateComparison = function cellStateComparison(state, i, j) {
  return state.i === i && state.j === j;
};
var isCellSelected = exports.isCellSelected = function isCellSelected(start, end, i, j) {
  var posX = j >= start.j && j <= end.j;
  var negX = j <= start.j && j >= end.j;
  var posY = i >= start.i && i <= end.i;
  var negY = i <= start.i && i >= end.i;

  return posX && posY || negX && posY || negX && negY || posX && negY;
};