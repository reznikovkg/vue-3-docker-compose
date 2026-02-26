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

export const BUBBLE_IMAGE_MAP = {
  red: [
    new URL('../assets/bubbles/red/Bubble_1.png', import.meta.url).href,
    new URL('../assets/bubbles/red/Bubble_2.png', import.meta.url).href,
    new URL('../assets/bubbles/red/Bubble_3.png', import.meta.url).href
  ],
  blue: [
    new URL('../assets/bubbles/blue/Bubble_1.png', import.meta.url).href,
    new URL('../assets/bubbles/blue/Bubble_2.png', import.meta.url).href,
    new URL('../assets/bubbles/blue/Bubble_3.png', import.meta.url).href
  ],
  green: [
    new URL('../assets/bubbles/green/Bubble_1.png', import.meta.url).href,
    new URL('../assets/bubbles/green/Bubble_2.png', import.meta.url).href,
    new URL('../assets/bubbles/green/Bubble_3.png', import.meta.url).href
  ],
  yellow: [
    new URL('../assets/bubbles/yellow/Bubble_1.png', import.meta.url).href,
    new URL('../assets/bubbles/yellow/Bubble_2.png', import.meta.url).href,
    new URL('../assets/bubbles/yellow/Bubble_3.png', import.meta.url).href
  ],
  orange: [
    new URL('../assets/bubbles/orange/Bubble_1.png', import.meta.url).href,
    new URL('../assets/bubbles/orange/Bubble_2.png', import.meta.url).href,
    new URL('../assets/bubbles/orange/Bubble_3.png', import.meta.url).href
  ],
  purple: [
    new URL('../assets/bubbles/purple/Bubble_1.png', import.meta.url).href,
    new URL('../assets/bubbles/purple/Bubble_2.png', import.meta.url).href,
    new URL('../assets/bubbles/purple/Bubble_3.png', import.meta.url).href
  ]
}
