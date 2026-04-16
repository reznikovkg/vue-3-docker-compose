import blueBubble from './../assets/bubbles/bubble_blue.png'
import greenBubble from './../assets/bubbles/bubble_green.png'
import orangeBubble from './../assets/bubbles/bubble_orange.png'
import pinkBubble from './../assets/bubbles/bubble_pink.png'
import purpleBubble from './../assets/bubbles/bubble_purple.png'
import redBubble from './../assets/bubbles/bubble_red.png'
import whiteBubble from './../assets/bubbles/bubble_white.png'
import yellowBubble from './../assets/bubbles/bubble_yellow.png'

export interface BubbleColor {
  value: string
  name: string
  image: string
}

export const BUBBLE_NAMES = {
  RED: 'red',
  BLUE: 'blue',
  GREEN: 'green',
  YELLOW: 'yellow',
  PURPLE: 'purple',
  PINK: 'pink',
  ORANGE: 'orange',
  WHITE: 'white'
} as const

export const BUBBLE_BY_VALUE: Record<string, BubbleColor> = {
  [BUBBLE_NAMES.RED]: { value: BUBBLE_NAMES.RED, name: 'Красный', image: redBubble },
  [BUBBLE_NAMES.BLUE]: { value: BUBBLE_NAMES.BLUE, name: 'Синий', image: blueBubble },
  [BUBBLE_NAMES.GREEN]: { value: BUBBLE_NAMES.GREEN, name: 'Зелёный', image: greenBubble },
  [BUBBLE_NAMES.YELLOW]: { value: BUBBLE_NAMES.YELLOW, name: 'Жёлтый', image: yellowBubble },
  [BUBBLE_NAMES.PURPLE]: { value: BUBBLE_NAMES.PURPLE, name: 'Фиолетовый', image: purpleBubble },
  [BUBBLE_NAMES.PINK]: { value: BUBBLE_NAMES.PINK, name: 'Розовый', image: pinkBubble },
  [BUBBLE_NAMES.ORANGE]: { value: BUBBLE_NAMES.ORANGE, name: 'Оранжевый', image: orangeBubble },
  [BUBBLE_NAMES.WHITE]: { value: BUBBLE_NAMES.WHITE, name: 'Белый', image: whiteBubble }
}

export const BUBBLE_COLORS = Object.values(BUBBLE_BY_VALUE)

export const ALL_COLORS = Object.keys(BUBBLE_BY_VALUE)

export const BUBBLE_IMAGES = Object.fromEntries(
  Object.entries(BUBBLE_BY_VALUE).map(([key, color]) => [key, color.image])
)

export const getBubbleName = (value: string): string => {
  return BUBBLE_BY_VALUE[value]?.name || value
}

export const getBubbleImage = (value: string): string => {
  return BUBBLE_BY_VALUE[value]?.image || BUBBLE_BY_VALUE['white']?.image || ''
}

export const preloadBubbleImages = (): void => {
  Object.values(BUBBLE_IMAGES).forEach(src => {
    const img = new Image()
    img.src = src
  })
}