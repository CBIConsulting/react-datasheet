/**
 * Filter cell extra attributes to get only the valid ones. Right now the only
 * valid extra attributes are the ones with the data prefix. This is an object
 * where the key is the attribute name and the value is its value.
 * Ex: {data-hint: 'Hint to display on cell hover'}
 *
 * @param { object } attributes  Extra attributes of the cell.
 * @return { object } Filtered attributes. An empty object if there is no attributes.
 */
export const filterCellExtraAttributes = attributes => {
  const filteredAttribs = {};

  if (attributes) {
    Object.keys(attributes).forEach(attribName => {
      if (attribName.indexOf('data-') === 0) {
        filteredAttribs[attribName] = attributes[attribName];
      }
    });
  }

  return filteredAttribs;
}

export const isEmptyObj = obj => Object.keys(obj).length === 0;
export const range = (start, end) => {
  const array = [];
  const inc = (end - start > 0);

  for (let i = start; inc ? (i <= end) : (i >= end); inc ? i++ : i--) {
    inc ? array.push(i) : array.unshift(i)
  }

  return array;
};
export const nullFunction = obj => {};
export const cellStateComparison = (state, i, j) => state.i === i && state.j === j;
export const isCellSelected = (start, end, i, j) => {
  const posX = (j >= start.j && j <= end.j);
  const negX = (j <= start.j && j >= end.j);
  const posY = (i >= start.i && i <= end.i);
  const negY = (i <= start.i && i >= end.i);

  return (posX && posY) ||
    (negX && posY) ||
    (negX && negY) ||
    (posX && negY);
};