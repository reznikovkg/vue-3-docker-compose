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

// Флаг для включения/выключения отладочных логов
const DEBUG_LOGS = false; // Поставьте true, если нужны логи

// Функция для получения случайной фигуры
export const randomTetromino = (store = null) => {
  let tetrominoes = TETROMINOES;
  
  // Если передан store, используем фигуры из него
  if (store) {
    try {
      const gameTetrominoes = store.getters['tetrominoes/getGameTetrominoes'];
      
      if (DEBUG_LOGS) {
        console.log('🎲 Доступные фигуры:', Object.keys(gameTetrominoes));
      }
      
      if (gameTetrominoes && Object.keys(gameTetrominoes).length > 0) {
        tetrominoes = gameTetrominoes;
      }
    } catch (e) {
      if (DEBUG_LOGS) {
        console.warn('⚠️ Store недоступен, используем базовые фигуры');
      }
    }
  }
  
  const keys = Object.keys(tetrominoes);
  const index = Math.floor(Math.random() * keys.length);
  const key = keys[index];
  
  if (DEBUG_LOGS) {
    console.log('✅ Выбрана фигура:', key, tetrominoes[key]);
  }
  
  return tetrominoes[key];
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
}) => {
  shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        const occupied = isOccupied;
        const _y = y + position.row;
        const _x = x + position.column;
        rows[_y][_x] = { occupied, className };
      }
    });
  });

  return rows;
};