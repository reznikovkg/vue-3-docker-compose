export const EASY = 'EASY'
export const HARD = 'HARD'

export const MODES = {
  [EASY]: {
    key: EASY,
    label: 'Обычный',
    blockPerMove: 0
  },
  [HARD]: {
    key: HARD,
    label: 'Сложный',
    blockPerMove: 1
  }
}

export const DEFAULT_MODE = EASY

export const MAX_LAYERS = 4
export const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f']
export const FLASK_COUNT = 6
export const MAX_RECORDS = 10
