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

export const SIZE_RADIUS = {
  big: 68,
  medium: 52,
  small: 36
}

export const MISS_BY_SIZE = {
  big: -5,
  medium: -3,
  small: -1
}

export const FALL_BY_SIZE = {
  big: -10,
  medium: -6,
  small: -3
}

export const PUSH_BY_SIZE = {
  big: {
    big: 1,
    medium: 1.5,
    small: 2
  },
  medium: {
    big: 0.5,
    medium: 1,
    small: 1.5
  },
  small: {
    big: 0.25,
    medium: 0.5,
    small: 1
  }
}

export const BUBBLE_RULES = {
  rad: SIZE_RADIUS,
  miss: MISS_BY_SIZE,
  fall: FALL_BY_SIZE,
  push: PUSH_BY_SIZE
}

export const BUBBLE_DEFAULTS = {
  type: GAME_DEFAULTS.targetColor,
  left: 0,
  top: 0,
  size: 40,
  bubbleId: 0,
  sizeType: 'medium'
}
