export const GHOST_VALUE = -1
export const NEXT_PIECE_SIZE = 4
export const GHOST_BACKGROUND = 'rgba(255, 255, 255, 0.2)'
export const ERROR_COLOR = '#ff4444'

export const GAME_STATUS = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameOver',
}

export const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
}

export const BASE_SPEEDS = {
  [DIFFICULTY.EASY]: 600,
  [DIFFICULTY.MEDIUM]: 400,
  [DIFFICULTY.HARD]: 250
}

export const CONTROLS = {
  LEFT: '←',
  RIGHT: '→',
  ROTATE: '↻',
  DROP: '↓',
  PAUSE: '⏸',
  PLAY: '▶',
  RESET: '↺',
}

export const BOARD_SIZES = {
  SMALL: { width: 8, height: 16, label: 'Маленькое 8x16' },
  MEDIUM: { width: 10, height: 20, label: 'Среднее 10x20' },
  LARGE: { width: 12, height: 24, label: 'Большое 12x24' }
}

export const STEEL_OVERLAY = 'rgba(0, 0, 0, 0.5)'

export const BASE_PIECES = [
  {
    id: 'base-1',
    name: 'I-образная',
    color: '#00FFFF',
    shape: [[1, 1, 1, 1]],
    isSteel: false
  },
  {
    id: 'base-2',
    name: 'O-образная',
    color: '#FFFF00',
    shape: [[1, 1], [1, 1]],
    isSteel: false
  },
  {
    id: 'base-3',
    name: 'T-образная',
    color: '#800080',
    shape: [[0, 1, 0], [1, 1, 1]],
    isSteel: false
  },
  {
    id: 'base-4',
    name: 'S-образная',
    color: '#FFA500',
    shape: [[0, 1, 1], [1, 1, 0]],
    isSteel: false
  },
  {
    id: 'base-5',
    name: 'Z-образная',
    color: '#FF0000',
    shape: [[1, 1, 0], [0, 1, 1]],
    isSteel: false
  },
  {
    id: 'base-6',
    name: 'L-образная',
    color: '#0000FF',
    shape: [[1, 0, 0], [1, 1, 1]],
    isSteel: false
  },
  {
    id: 'base-7',
    name: 'J-образная',
    color: '#00FF00',
    shape: [[0, 0, 1], [1, 1, 1]],
    isSteel: false
  }
]
