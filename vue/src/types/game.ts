export type SwapDirections = 'left' | 'right' | 'up' | 'down' | 'none'
export interface Gem {
  id: number
  type: number
  color: string
  row: number
  col: number
  selected: boolean
  removing: boolean
  isNew: boolean
  swapDirection: SwapDirections
}

export interface Position {
  row: number
  col: number
}

export type GameBoard = Gem[][]
