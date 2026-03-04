function rotateClockwise(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      rotated[j][rows - 1 - i] = matrix[i][j];
    }
  }
  return rotated;
}

function getAllRotations(baseShape) {
  const rotations = [];
  let current = baseShape;
  for (let i = 0; i < 4; i++) {
    const str = JSON.stringify(current);
    if (!rotations.some(r => JSON.stringify(r) === str)) {
      rotations.push(current);
    }
    current = rotateClockwise(current);
  }
  return rotations;
}

export const TETROMINOS = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  L: [[1, 0, 0], [1, 1, 1]],
  J: [[0, 0, 1], [1, 1, 1]]
};

export const ALL_ORIENTATIONS = Object.values(TETROMINOS).flatMap(getAllRotations);