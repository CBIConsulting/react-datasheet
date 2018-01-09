import {
    BACKSPACE_KEY, DELETE_KEY, TAB_KEY,
    ESCAPE_KEY, ENTER_KEY, RIGHT_KEY,
    LEFT_KEY, UP_KEY, DOWN_KEY
} from './constanct'

/**
 * Tells if the enter key was pressed.
 *
 * @param {int} keyCode KeyboardEvent keyCode
 * @returns {bool} Enter key pressed
 */
export const enterKeyPressed = keyCode => keyCode === ENTER_KEY

/**
 * Tells if the delete key was pressed.
 *
 * @param {int} keyCode KeyboardEvent keyCode
 * @returns {bool} Delete key pressed
 */
export const deleteKeyPressed = keyCode => (keyCode === DELETE_KEY || keyCode === BACKSPACE_KEY)

/**
 * Tells if the escape key was pressed.
 *
 * @param {int} keyCode KeyboardEvent keyCode
 * @returns {bool} Escape key pressed
 */
export const escapeKeyPressed = keyCode => keyCode === ESCAPE_KEY

/**
 * Tells if a number key was pressed.
 *
 * @param {int} keyCode KeyboardEvent keyCode
 * @returns {bool} Number key pressed
 */
export const numbersPressed = keyCode => (keyCode >= 48 && keyCode <= 57)

/**
 * Tells if a letter key was pressed.
 *
 * @param {int} keyCode KeyboardEvent keyCode
 * @returns {bool} Letter key pressed
 */
export const lettersPressed = keyCode => (keyCode >= 65 && keyCode <= 90)

/**
 * Tells if a numbers pad key was pressed.
 *
 * @param {int} keyCode KeyboardEvent keyCode
 * @returns {bool} Number pad key pressed
 */
export const numPadKeysPressed = keyCode => (keyCode >= 96 && keyCode <= 105)

/**
 * Tells if a equation key was pressed.
 *
 * @param {int} keyCode KeyboardEvent keyCode
 * @returns {bool} Equation key pressed
 */
export const equationKeysPressed = keyCode => [
  187, /* equal */
  189, /* substract */
  190, /* period */
  107, /* add */
  109, /* decimal point */
  110
].indexOf(keyCode) > -1

/**
 * Tells if the tab key was pressed.
 *
 * @param {int} keyCode KeyboardEvent keyCode
 * @returns {bool} Tab key pressed
 */
export const tabKeyPressed = keyCode => keyCode === TAB_KEY

/**
 * Tells if the right key was pressed.
 *
 * @param {int} keyCode KeyboardEvent keyCode
 * @returns {bool} Right key pressed
 */
export const rightKeyPressed = keyCode => keyCode === RIGHT_KEY

/**
 * Tells if the left key was pressed.
 *
 * @param {int} keyCode KeyboardEvent keyCode
 * @returns {bool} Left key pressed
 */
export const leftKeyPressed = keyCode => keyCode === LEFT_KEY

/**
 * Tells if the down key was pressed.
 *
 * @param {int} keyCode KeyboardEvent keyCode
 * @returns {bool} Down key pressed
 */
export const downKeyPressed = keyCode => keyCode === DOWN_KEY

/**
 * Tells if the up key was pressed.
 *
 * @param {int} keyCode KeyboardEvent keyCode
 * @returns {bool} Up key pressed
 */
export const upKeyPressed = keyCode => keyCode === UP_KEY
