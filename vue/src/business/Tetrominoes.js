const className = "tetromino";

export const TETROMINOES = {
  I: {
    shape: [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
    className: `${className} ${className}__i`,
  },
  J: {
    shape: [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
    className: `${className} ${className}__j`,
  },
  L: {
    shape: [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    className: `${className} ${className}__l`,
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    className: `${className} ${className}__o`,
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    className: `${className} ${className}__s`,
  },
  T: {
    shape: [
      [1, 1, 1],
      [0, 1, 0],
      [0, 0, 0],
    ],
    className: `${className} ${className}__t`,
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    className: `${className} ${className}__z`,
  },
};

const DEBUG_LOGS = false;

// Функция для получения случайной фигуры
export const randomTetromino = (store = null, hardMode = false) => {
  let tetrominoes = TETROMINOES;
  
  if (store) {
    try {
      const gameTetrominoes = store.getters['tetrominoes/getGameTetrominoes'];
      
      if (DEBUG_LOGS) {
        console.log(' Доступные фигуры:', Object.keys(gameTetrominoes));
      }
      
      if (gameTetrominoes && Object.keys(gameTetrominoes).length > 0) {
        tetrominoes = gameTetrominoes;
      }
    } catch (e) {
      if (DEBUG_LOGS) {
        console.warn(' Store недоступен, используем базовые фигуры');
      }
    }
  }
  
  const keys = Object.keys(tetrominoes);
  const index = Math.floor(Math.random() * keys.length);
  const key = keys[index];
  const baseTetromino = { ...tetrominoes[key] };
  
  // В сложном режиме с вероятностью 0.2 делаем фигуру стальной
  const isSteel = hardMode && Math.random() < 0.2;
  
  if (isSteel) {
    baseTetromino.className = `${baseTetromino.className} steel`;
    baseTetromino.isSteel = true;
  } else {
    baseTetromino.isSteel = false;
  }
  
  if (DEBUG_LOGS) {
    console.log(' Выбрана фигура:', key, isSteel ? ' СТАЛЬНАЯ' : '', baseTetromino);
  }
  
  return baseTetromino;
};

export const rotate = ({ piece, direction }) => {
  // Transpose rows and columns
  const newPiece = piece.map((_, index) =>
    piece.map((column) => column[index])
  );

  // Reverse rows to get a rotated matrix
  if (direction > 0) {
    return newPiece.map((row) => row.reverse())
  };

  return newPiece.reverse();
};

export const transferToBoard = ({
  className,
  isOccupied,
  position,
  rows,
  shape,
  isSteel = false, // Новый параметр
}) => {
  shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        const occupied = isOccupied;
        const _y = y + position.row;
        const _x = x + position.column;
        rows[_y][_x] = { 
          occupied, 
          className,
          isSteel: isSteel && occupied, // Стальные только если occupied
        };
      }
    });
  });

  return rows;
};