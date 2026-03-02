export const GAME_COLORS = ['red', 'blue', 'green', 'yellow', 'orange', 'purple']

export const GAME_COLOR_HEX = {
  red: '#ff4d4f',
  blue: '#4096ff',
  green: '#73d13d',
  yellow: '#fadb14',
  orange: '#fa8c16',
  purple: '#722ed1'
}

export const GAME_DEFAULTS = {
  colorsCount: 6,
  targetColor: 'red',
  intensity: 1,
  scoreHit: 1,
  scoreMiss: -5,
  maxTime: 60
}

export const BUBBLE_DEFAULTS = {
  type: GAME_DEFAULTS.targetColor,
  left: 0,
  top: 0,
  size: 40,
  bubbleId: 0
}
