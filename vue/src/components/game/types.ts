export interface MazeCell {
  type: string
  visited: boolean
}

export interface Player {
  row: number
  column: number
}

export interface CurrentLevel {
  id: string
  name: string
}

export interface MazeConfiguration {
  id: string
  name: string
  description: string
  rows: string[][]
  playerPosition: Player
}

export interface CellTypes {
  WALL: string
  PATH: string
}

export interface GameDirections {
  UP: string
  DOWN: string
  LEFT: string
  RIGHT: string
}

export interface AvailableMoves {
  [key: string]: boolean
}

export interface Progress {
  current: number
  total: number
}

export interface GameModuleState {
  maze: MazeCell[][]
  player: Player
  configurations: MazeConfiguration[]
  currentLevel?: CurrentLevel
  cellTypes: CellTypes
  directions: GameDirections
  availableMoves?: AvailableMoves
  progress?: Progress
  isComplete?: boolean
}

export interface RootState {
  game: GameModuleState
}

export interface MazeBoardCell {
  row: number
  column: number
  type: string
  isVisited: boolean
  isPlayer: boolean
}
