/**
 * Tells if an object is empty.
 *
 * @param {object} obj The object to check.
 * @returns {bool} If the object is empty or not.
 */
export const isEmptyObj = obj => Object.keys(obj).length === 0

/**
 * Given a start and end position it return an array with all the positions
 * in between, both start and end positions included.
 *
 * @param {int} start Start position.
 * @param {int} end End position.
 * @returns {array} The positions in the range.
 */
export const range = (start, end) => {
  const array = []
  const inc = (end - start > 0)

  for (let i = start; inc ? (i <= end) : (i >= end); inc ? i++ : i--) {
    inc ? array.push(i) : array.unshift(i)
  }

  return array
}

/**
 * Compare a position state like editing or reverting with an i and j positions given.
 *
 * @param {object} state It should be an object with the i and j positions.
 * @param {int} i Row position
 * @param {int} j Column position
 * @returns {bool} True if it's the same cell position.
 */
export const cellStateComparison = (state, i, j) => state.i === i && state.j === j

/**
 * Tells if the cell at the position (i, j) is selected.
 *
 * @param {object} start Start state that indicates where the selected cells start.
 * @param {object} end End state that indicates where the selected cells end.
 * @param {int} i Row position
 * @param {int} j Column position
 * @returns {bool} True if the cell at the position (i, j) is in the selected range
 */
export const isCellSelected = (start, end, i, j) => {
  const posX = (j >= start.j && j <= end.j)
  const negX = (j <= start.j && j >= end.j)
  const posY = (i >= start.i && i <= end.i)
  const negY = (i <= start.i && i >= end.i)

  return (posX && posY) ||
    (negX && posY) ||
    (negX && negY) ||
    (posX && negY)
}

/**
 * Tells if value is undefined.
 *
 * @param {any} value The value to be checked.
 * @returns {bool} True if the value is undefined.
 */
export const isUndefined = value => typeof (value) === 'undefined'
