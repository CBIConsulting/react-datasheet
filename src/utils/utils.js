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