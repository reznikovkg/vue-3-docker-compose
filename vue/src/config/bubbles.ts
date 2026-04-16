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


export const BUBBLE_COLORS: BubbleColor[] = [
  { value: 'red', name: 'Красный', image: redBubble },
  { value: 'blue', name: 'Синий', image: blueBubble },
  { value: 'green', name: 'Зелёный', image: greenBubble },
  { value: 'yellow', name: 'Жёлтый', image: yellowBubble },
  { value: 'purple', name: 'Фиолетовый', image: purpleBubble },
  { value: 'pink', name: 'Розовый', image: pinkBubble },
  { value: 'orange', name: 'Оранжевый', image: orangeBubble },
  { value: 'white', name: 'Белый', image: whiteBubble }
]

export const BUBBLE_BY_VALUE: Record<string, BubbleColor> = BUBBLE_COLORS.reduce((acc, color) => {
  acc[color.value] = color
  return acc
}, {} as Record<string, BubbleColor>)

export const ALL_COLORS: string[] = BUBBLE_COLORS.map(c => c.value)

export const BUBBLE_IMAGES: Record<string, string> = BUBBLE_COLORS.reduce((acc, color) => {
  acc[color.value] = color.image
  return acc
}, {} as Record<string, string>)

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