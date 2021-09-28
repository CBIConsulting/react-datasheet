'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.upKeyPressed = exports.downKeyPressed = exports.leftKeyPressed = exports.rightKeyPressed = exports.tabKeyPressed = exports.equationKeysPressed = exports.numPadKeysPressed = exports.lettersPressed = exports.numbersPressed = exports.escapeKeyPressed = exports.deleteKeyPressed = exports.enterKeyPressed = undefined;

var _constanct = require('./constanct');

/**
 * Tells if the enter key was pressed.
 *
 * @param {int} keyCode KeyboardEvent keyCode
 * @returns {bool} Enter key pressed
 */
var enterKeyPressed = exports.enterKeyPressed = function enterKeyPressed(keyCode) {
  return keyCode === _constanct.ENTER_KEY;
};

/**
 * Tells if the delete key was pressed.
 *
 * @param {int} keyCode KeyboardEvent keyCode
 * @returns {bool} Delete key pressed
 */
var deleteKeyPressed = exports.deleteKeyPressed = function deleteKeyPressed(keyCode) {
  return keyCode === _constanct.DELETE_KEY || keyCode === _constanct.BACKSPACE_KEY;
};

/**
 * Tells if the escape key was pressed.
 *
 * @param {int} keyCode KeyboardEvent keyCode
 * @returns {bool} Escape key pressed
 */
var escapeKeyPressed = exports.escapeKeyPressed = function escapeKeyPressed(keyCode) {
  return keyCode === _constanct.ESCAPE_KEY;
};

/**
 * Tells if a number key was pressed.
 *
 * @param {int} keyCode KeyboardEvent keyCode
 * @returns {bool} Number key pressed
 */
var numbersPressed = exports.numbersPressed = function numbersPressed(keyCode) {
  return keyCode >= 48 && keyCode <= 57;
};

/**
 * Tells if a letter key was pressed.
 *
 * @param {int} keyCode KeyboardEvent keyCode
 * @returns {bool} Letter key pressed
 */
var lettersPressed = exports.lettersPressed = function lettersPressed(keyCode) {
  return keyCode >= 65 && keyCode <= 90;
};

/**
 * Tells if a numbers pad key was pressed.
 *
 * @param {int} keyCode KeyboardEvent keyCode
 * @returns {bool} Number pad key pressed
 */
var numPadKeysPressed = exports.numPadKeysPressed = function numPadKeysPressed(keyCode) {
  return keyCode >= 96 && keyCode <= 105;
};

/**
 * Tells if a equation key was pressed.
 *
 * @param {int} keyCode KeyboardEvent keyCode
 * @returns {bool} Equation key pressed
 */
var equationKeysPressed = exports.equationKeysPressed = function equationKeysPressed(keyCode) {
  return [187, /* equal */
  189, /* substract */
  190, /* period */
  107, /* add */
  109, /* decimal point */
  110].indexOf(keyCode) > -1;
};

/**
 * Tells if the tab key was pressed.
 *
 * @param {int} keyCode KeyboardEvent keyCode
 * @returns {bool} Tab key pressed
 */
var tabKeyPressed = exports.tabKeyPressed = function tabKeyPressed(keyCode) {
  return keyCode === _constanct.TAB_KEY;
};

/**
 * Tells if the right key was pressed.
 *
 * @param {int} keyCode KeyboardEvent keyCode
 * @returns {bool} Right key pressed
 */
var rightKeyPressed = exports.rightKeyPressed = function rightKeyPressed(keyCode) {
  return keyCode === _constanct.RIGHT_KEY;
};

/**
 * Tells if the left key was pressed.
 *
 * @param {int} keyCode KeyboardEvent keyCode
 * @returns {bool} Left key pressed
 */
var leftKeyPressed = exports.leftKeyPressed = function leftKeyPressed(keyCode) {
  return keyCode === _constanct.LEFT_KEY;
};

/**
 * Tells if the down key was pressed.
 *
 * @param {int} keyCode KeyboardEvent keyCode
 * @returns {bool} Down key pressed
 */
var downKeyPressed = exports.downKeyPressed = function downKeyPressed(keyCode) {
  return keyCode === _constanct.DOWN_KEY;
};

/**
 * Tells if the up key was pressed.
 *
 * @param {int} keyCode KeyboardEvent keyCode
 * @returns {bool} Up key pressed
 */
var upKeyPressed = exports.upKeyPressed = function upKeyPressed(keyCode) {
  return keyCode === _constanct.UP_KEY;
};