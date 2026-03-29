import mazeConfigurations from './game/mazeConfigurations'
import { CELL_TYPES, GAME_MUTATIONS, MOVE_DIRECTIONS } from './game/constants'

const DIRECTION_VECTORS = {
  [MOVE_DIRECTIONS.UP]: {
    rowOffset: -1,
    columnOffset: 0,
  },
  [MOVE_DIRECTIONS.DOWN]: {
    rowOffset: 1,
    columnOffset: 0,
  },
  [MOVE_DIRECTIONS.LEFT]: {
    rowOffset: 0,
    columnOffset: -1,
  },
  [MOVE_DIRECTIONS.RIGHT]: {
    rowOffset: 0,
    columnOffset: 1,
  },
}

const createCell = (type) => ({
  type,
  visited: false,
})

const buildMaze = (rows) =>
  rows.map((row) => row.map((cellType) => createCell(cellType)))

const cloneMaze = (maze) =>
  maze.map((row) => row.map((cell) => ({ ...cell })))

const isInsideMaze = (maze, row, column) => {
  return (
    row >= 0 &&
    row < maze.length &&
    column >= 0 &&
    column < (maze[row]?.length ?? 0)
  )
}

const getCell = (maze, row, column) => {
  if (!isInsideMaze(maze, row, column)) {
    return null
  }

  return maze[row][column]
}

const isPathCell = (maze, row, column) => {
  const cell = getCell(maze, row, column)

  return cell?.type === CELL_TYPES.PATH
}

const markVisitedCells = (maze, positions) => {
  positions.forEach(({ row, column }) => {
    const cell = getCell(maze, row, column)

    if (cell?.type === CELL_TYPES.PATH) {
      cell.visited = true
    }
  })
}

const countVisitedCells = (maze) => {
  return maze
    .flat()
    .filter((cell) => cell.type === CELL_TYPES.PATH && cell.visited).length
}

const createProgress = (maze) => ({
  current: countVisitedCells(maze),
  total: maze.flat().filter((cell) => cell.type === CELL_TYPES.PATH).length,
})

const createPlayerPosition = (playerPosition) => ({
  row: playerPosition.row,
  column: playerPosition.column,
})

const createCurrentLevel = (configuration) => ({
  id: configuration.id,
  name: configuration.name,
})

const createGameStateSnapshot = (maze, playerPosition) => {
  const normalizedPlayerPosition = createPlayerPosition(playerPosition)
  const progress = createProgress(maze)
  const isComplete = progress.current === progress.total

  return {
    maze,
    player: normalizedPlayerPosition,
    progress,
    isComplete,
    availableMoves: isComplete
      ? createDisabledMoves()
      : getAvailableMoves(maze, normalizedPlayerPosition),
  }
}

const resolveMove = (maze, playerPosition, direction) => {
  const vector = DIRECTION_VECTORS[direction]

  if (!vector) {
    return {
      blocked: true,
      finalPosition: createPlayerPosition(playerPosition),
      traversedCells: [],
    }
  }

  let nextRow = playerPosition.row + vector.rowOffset
  let nextColumn = playerPosition.column + vector.columnOffset

  if (!isPathCell(maze, nextRow, nextColumn)) {
    return {
      blocked: true,
      finalPosition: createPlayerPosition(playerPosition),
      traversedCells: [],
    }
  }

  const traversedCells = []

  while (isPathCell(maze, nextRow, nextColumn)) {
    traversedCells.push({
      row: nextRow,
      column: nextColumn,
    })

    nextRow += vector.rowOffset
    nextColumn += vector.columnOffset
  }

  const finalPosition = traversedCells[traversedCells.length - 1]

  return {
    blocked: false,
    finalPosition,
    traversedCells,
  }
}

const getAvailableMoves = (maze, playerPosition) => {
  return Object.values(MOVE_DIRECTIONS).reduce((availability, direction) => {
    availability[direction] = !resolveMove(maze, playerPosition, direction).blocked

    return availability
  }, {})
}

const createDisabledMoves = () => {
  return Object.values(MOVE_DIRECTIONS).reduce((availability, direction) => {
    availability[direction] = false

    return availability
  }, {})
}

const createStateFromConfiguration = (configuration) => {
  const maze = buildMaze(configuration.rows)
  const playerPosition = createPlayerPosition(configuration.playerPosition)

  markVisitedCells(maze, [playerPosition])

  return createGameStateSnapshot(maze, playerPosition)
}

const createMovedState = (state, direction) => {
  if (state.isComplete) {
    return null
  }

  const maze = cloneMaze(state.maze)
  const playerPosition = createPlayerPosition(state.player)
  const moveResult = resolveMove(maze, playerPosition, direction)

  if (moveResult.blocked) {
    return null
  }

  markVisitedCells(maze, moveResult.traversedCells)

  return createGameStateSnapshot(maze, moveResult.finalPosition)
}

const initialConfiguration = mazeConfigurations[0]

export default {
  namespaced: true,
  state() {
    const preparedState = createStateFromConfiguration(initialConfiguration)

    return {
      cellTypes: CELL_TYPES,
      directions: MOVE_DIRECTIONS,
      configurations: mazeConfigurations,
      currentLevel: createCurrentLevel(initialConfiguration),
      ...preparedState,
    }
  },
  mutations: {
    [GAME_MUTATIONS.SET_CURRENT_LEVEL]: (state, configuration) => {
      state.currentLevel = createCurrentLevel(configuration)
    },
    [GAME_MUTATIONS.SET_GAME_STATE]: (state, gameState) => {
      state.maze = gameState.maze
      state.player = gameState.player
      state.progress = gameState.progress
      state.isComplete = gameState.isComplete
      state.availableMoves = gameState.availableMoves
    },
  },
  actions: {
    initializeGame: ({ commit, state }, configurationId) => {
      const selectedConfiguration =
        state.configurations.find(
          (configuration) => configuration.id === configurationId,
        ) || state.configurations[0]

      commit(GAME_MUTATIONS.SET_CURRENT_LEVEL, selectedConfiguration)
      commit(
        GAME_MUTATIONS.SET_GAME_STATE,
        createStateFromConfiguration(selectedConfiguration),
      )
    },
    movePlayer: ({ commit, state }, direction) => {
      const nextGameState = createMovedState(state, direction)

      if (!nextGameState) {
        return
      }

      commit(GAME_MUTATIONS.SET_GAME_STATE, nextGameState)
    },
  },
}
