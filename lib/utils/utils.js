"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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