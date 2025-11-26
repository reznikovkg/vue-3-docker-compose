import { SwapDirections } from "@/types"

export const GEM_COLORS = [
  '#FF6B6B', // Красный
  '#4ECDC4', // Бирюзовый
  '#45B7D1', // Голубой
  '#96CEB4', // Зеленый
  '#FFEAA7', // Желтый
  '#DDA0DD', // Сливовый
  '#98D8C8', // Мятный
  '#F7DC6F'  // Светло-желтый
]

export const AVAILABLE_SIZES = [4, 5, 6, 7, 8]

export const SWAP_DIRECTIONS: Record<string, SwapDirections> = {
  RIGHT: 'right',
  LEFT: 'left',
  UP: 'up',
  DOWN: 'down',
  NONE: 'none'
}

export const OPPOSITE_SWAP_DIRECTIONS = {
  left: 'right',
  right: 'left',
  up: 'down',
  down: 'up',
}
