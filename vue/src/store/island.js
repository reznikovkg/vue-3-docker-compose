const DEFAULT_FIELD_SIZE = 11
const DEFAULT_TIME = 60
const NORMAL_DELAY = 400
const BOOST_DELAY = 120
const BEST_SCORE_KEY = 'prom-best-score'

const STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  GAME_OVER: 'game-over'
}

const MUTATIONS = {
  SET_FIELD_SIZE: 'SET_FIELD_SIZE',
  SET_BASE_CELL: 'SET_BASE_CELL',
  SET_ISLAND_CELLS: 'SET_ISLAND_CELLS',
  SET_ACTIVE_FIGURE: 'SET_ACTIVE_FIGURE',
  SET_LAST_SPAWN_SIDE: 'SET_LAST_SPAWN_SIDE',
  SET_SCORE: 'SET_SCORE',
  SET_BEST_SCORE: 'SET_BEST_SCORE',
  SET_TIME_LEFT: 'SET_TIME_LEFT',
  SET_STATUS: 'SET_STATUS',
  SET_FIGURE_DELAY: 'SET_FIGURE_DELAY',
  SET_BOOST_DELAY: 'SET_BOOST_DELAY',
  SET_FIGURE_TIMEOUT_ID: 'SET_FIGURE_TIMEOUT_ID',
  SET_TIMER_INTERVAL_ID: 'SET_TIMER_INTERVAL_ID'
}

const MOVES = {
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 }
}

const ROTATIONS = {
  CW: 'cw',
  CCW: 'ccw'
}

const SIDE_VECTORS = {
  top: { x: 0, y: 1 },
  right: { x: -1, y: 0 },
  bottom: { x: 0, y: -1 },
  left: { x: 1, y: 0 }
}

const SIDES = Object.keys(SIDE_VECTORS)

const TETROMINOES = {
  I: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 }
  ],
  O: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 }
  ],
  T: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 }
  ],
  S: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: 1 }
  ],
  Z: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 }
  ],
  J: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 }
  ],
  L: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 1 }
  ]
}

const createDefaultState = () => ({
  fieldSize: DEFAULT_FIELD_SIZE,
  baseCell: null,
  islandCells: [],
  activeFigure: null,
  lastSpawnSide: null,
  score: 0,
  bestScore: 0,
  timeLeft: DEFAULT_TIME,
  status: STATUS.IDLE,
  figureDelay: NORMAL_DELAY,
  boostDelay: BOOST_DELAY,
  figureTimeoutId: null,
  timerIntervalId: null
})

const cellKey = (cell) => `${cell.x}:${cell.y}`

const createCellKeySet = (cells) => new Set(cells.map((cell) => cellKey(cell)))

const translateCells = (cells, vector) => cells.map((cell) => ({
  x: cell.x + vector.x,
  y: cell.y + vector.y
}))

const rotateOffset = (cell, direction) => {
  if (direction === ROTATIONS.CW) {
    return {
      x: -cell.y,
      y: cell.x
    }
  }

  return {
    x: cell.y,
    y: -cell.x
  }
}

const rotateCellsAroundBase = (cells, baseCell, direction) => cells.map((cell) => {
  const rotatedOffset = rotateOffset({
    x: cell.x - baseCell.x,
    y: cell.y - baseCell.y
  }, direction)

  return {
    x: baseCell.x + rotatedOffset.x,
    y: baseCell.y + rotatedOffset.y
  }
})

const rotateRelativeCells = (cells, turns) => {
  let nextCells = cells.map((cell) => ({ ...cell }))

  for (let index = 0; index < turns; index += 1) {
    nextCells = nextCells.map((cell) => rotateOffset(cell, ROTATIONS.CW))
  }

  return nextCells
}

const getBounds = (cells) => cells.reduce((result, cell) => ({
  minX: Math.min(result.minX, cell.x),
  maxX: Math.max(result.maxX, cell.x),
  minY: Math.min(result.minY, cell.y),
  maxY: Math.max(result.maxY, cell.y)
}), {
  minX: Number.POSITIVE_INFINITY,
  maxX: Number.NEGATIVE_INFINITY,
  minY: Number.POSITIVE_INFINITY,
  maxY: Number.NEGATIVE_INFINITY
})

const getRandomInt = (min, max) => {
  if (max <= min) {
    return min
  }

  return Math.floor(Math.random() * (max - min + 1)) + min
}

const normalizeFieldSize = (value) => {
  const parsedValue = Number.parseInt(value, 10)

  if (Number.isNaN(parsedValue)) {
    return DEFAULT_FIELD_SIZE
  }

  const nextValue = Math.max(5, parsedValue)

  return nextValue % 2 === 0 ? nextValue + 1 : nextValue
}

const pickSpawnSide = (lastSpawnSide) => {
  const availableSides = SIDES.filter((side) => side !== lastSpawnSide)
  const index = getRandomInt(0, availableSides.length - 1)

  return availableSides[index]
}

const getSpawnAnchor = (cells, side, fieldSize) => {
  const bounds = getBounds(cells)

  if (side === 'top') {
    return {
      x: getRandomInt(-bounds.minX, fieldSize - bounds.maxX - 1),
      y: -bounds.maxY - 1
    }
  }

  if (side === 'bottom') {
    return {
      x: getRandomInt(-bounds.minX, fieldSize - bounds.maxX - 1),
      y: fieldSize - bounds.minY
    }
  }

  if (side === 'left') {
    return {
      x: -bounds.maxX - 1,
      y: getRandomInt(-bounds.minY, fieldSize - bounds.maxY - 1)
    }
  }

  return {
    x: fieldSize - bounds.minX,
    y: getRandomInt(-bounds.minY, fieldSize - bounds.maxY - 1)
  }
}

const buildFigure = (type, rotationIndex, side, fieldSize) => {
  const shape = rotateRelativeCells(TETROMINOES[type], rotationIndex)
  const anchor = getSpawnAnchor(shape, side, fieldSize)

  return {
    type,
    rotationIndex,
    side,
    vector: { ...SIDE_VECTORS[side] },
    anchor,
    cells: translateCells(shape, anchor)
  }
}

const isInsideBoard = (cell, fieldSize) => (
  cell.x >= 0 &&
  cell.x < fieldSize &&
  cell.y >= 0 &&
  cell.y < fieldSize
)

const isWithinBoard = (cells, fieldSize) => cells.every((cell) => isInsideBoard(cell, fieldSize))

const touchesWall = (cells, fieldSize) => cells.some((cell) => (
  cell.x === 0 ||
  cell.y === 0 ||
  cell.x === fieldSize - 1 ||
  cell.y === fieldSize - 1
))

const hasCollision = (cells, keySet) => cells.some((cell) => keySet.has(cellKey(cell)))

const mergeCells = (islandCells, figureCells) => {
  const uniqueCells = new Map()
  const allCells = [...islandCells, ...figureCells]

  allCells.forEach((cell) => {
    uniqueCells.set(cellKey(cell), cell)
  })

  return Array.from(uniqueCells.values())
}

const getLayerIndex = (cell, baseCell) => Math.max(
  Math.abs(cell.x - baseCell.x),
  Math.abs(cell.y - baseCell.y)
)

const getLayerCells = (layer, baseCell) => {
  if (layer === 0) {
    return [{ ...baseCell }]
  }

  const layerCells = []

  for (let dx = -layer; dx <= layer; dx += 1) {
    for (let dy = -layer; dy <= layer; dy += 1) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) === layer) {
        layerCells.push({
          x: baseCell.x + dx,
          y: baseCell.y + dy
        })
      }
    }
  }

  return layerCells
}

const findFirstFilledLayer = (islandCells, baseCell) => {
  if (!baseCell) {
    return null
  }

  const cellSet = createCellKeySet(islandCells)
  const maxLayer = islandCells.reduce((result, cell) => {
    return Math.max(result, getLayerIndex(cell, baseCell))
  }, 0)

  for (let layer = 1; layer <= maxLayer; layer += 1) {
    const layerCells = getLayerCells(layer, baseCell)
    const isFilled = layerCells.every((cell) => cellSet.has(cellKey(cell)))

    if (isFilled) {
      return layer
    }
  }

  return null
}

const collapseLayer = (islandCells, baseCell, layer) => {
  let removedLayerCount = 0
  let fallenCount = 0

  const nextIslandCells = islandCells.filter((cell) => {
    const layerIndex = getLayerIndex(cell, baseCell)

    if (layerIndex === layer) {
      removedLayerCount += 1
      return false
    }

    if (layerIndex > layer) {
      fallenCount += 1
      return false
    }

    return true
  })

  return {
    nextIslandCells,
    removedLayerCount,
    fallenCount,
    scoreGain: removedLayerCount * 5 + fallenCount
  }
}

const isFigureOutsideBoard = (cells, fieldSize, side) => {
  if (side === 'top') {
    return cells.every((cell) => cell.y > fieldSize - 1)
  }

  if (side === 'bottom') {
    return cells.every((cell) => cell.y < 0)
  }

  if (side === 'left') {
    return cells.every((cell) => cell.x > fieldSize - 1)
  }

  return cells.every((cell) => cell.x < 0)
}

const readBestScore = () => {
  if (typeof globalThis.localStorage === 'undefined') {
    return 0
  }

  const savedValue = globalThis.localStorage.getItem(BEST_SCORE_KEY)
  const parsedValue = Number.parseInt(savedValue ?? '0', 10)

  return Number.isNaN(parsedValue) ? 0 : parsedValue
}

const writeBestScore = (value) => {
  if (typeof globalThis.localStorage === 'undefined') {
    return
  }

  globalThis.localStorage.setItem(BEST_SCORE_KEY, String(value))
}

const clearFigureTimeout = (state, commit) => {
  if (state.figureTimeoutId === null) {
    return
  }

  globalThis.clearTimeout(state.figureTimeoutId)
  commit(MUTATIONS.SET_FIGURE_TIMEOUT_ID, null)
}

const clearTimerInterval = (state, commit) => {
  if (state.timerIntervalId === null) {
    return
  }

  globalThis.clearInterval(state.timerIntervalId)
  commit(MUTATIONS.SET_TIMER_INTERVAL_ID, null)
}

const maybeUpdateBestScore = (state, commit) => {
  if (state.score <= state.bestScore) {
    return
  }

  commit(MUTATIONS.SET_BEST_SCORE, state.score)
  writeBestScore(state.score)
}

export default {
  namespaced: true,
  state: createDefaultState,
  getters: {
    getFieldSize: (state) => state.fieldSize,
    getBaseCell: (state) => state.baseCell,
    getIslandCells: (state) => state.islandCells,
    getActiveFigure: (state) => state.activeFigure,
    getActiveFigureCells: (state) => state.activeFigure ? state.activeFigure.cells : [],
    getScore: (state) => state.score,
    getBestScore: (state) => state.bestScore,
    getTimeLeft: (state) => state.timeLeft,
    getStatus: (state) => state.status,
    getFigureDelay: (state) => state.figureDelay
  },
  mutations: {
    [MUTATIONS.SET_FIELD_SIZE]: (state, payload) => {
      state.fieldSize = payload
    },
    [MUTATIONS.SET_BASE_CELL]: (state, payload) => {
      state.baseCell = payload
    },
    [MUTATIONS.SET_ISLAND_CELLS]: (state, payload) => {
      state.islandCells = payload
    },
    [MUTATIONS.SET_ACTIVE_FIGURE]: (state, payload) => {
      state.activeFigure = payload
    },
    [MUTATIONS.SET_LAST_SPAWN_SIDE]: (state, payload) => {
      state.lastSpawnSide = payload
    },
    [MUTATIONS.SET_SCORE]: (state, payload) => {
      state.score = payload
    },
    [MUTATIONS.SET_BEST_SCORE]: (state, payload) => {
      state.bestScore = payload
    },
    [MUTATIONS.SET_TIME_LEFT]: (state, payload) => {
      state.timeLeft = payload
    },
    [MUTATIONS.SET_STATUS]: (state, payload) => {
      state.status = payload
    },
    [MUTATIONS.SET_FIGURE_DELAY]: (state, payload) => {
      state.figureDelay = payload
    },
    [MUTATIONS.SET_BOOST_DELAY]: (state, payload) => {
      state.boostDelay = payload
    },
    [MUTATIONS.SET_FIGURE_TIMEOUT_ID]: (state, payload) => {
      state.figureTimeoutId = payload
    },
    [MUTATIONS.SET_TIMER_INTERVAL_ID]: (state, payload) => {
      state.timerIntervalId = payload
    }
  },
  actions: {
    loadBestScore: ({ commit }) => {
      const bestScore = readBestScore()

      commit(MUTATIONS.SET_BEST_SCORE, bestScore)

      return bestScore
    },

    saveBestScore: ({ state }) => {
      writeBestScore(state.bestScore)
    },

    startTimer: ({ state, commit, dispatch }) => {
      clearTimerInterval(state, commit)

      const timerIntervalId = globalThis.setInterval(() => {
        dispatch('tickTimer')
      }, 1000)

      commit(MUTATIONS.SET_TIMER_INTERVAL_ID, timerIntervalId)
    },

    tickTimer: ({ state, commit, dispatch }) => {
      if (state.status !== STATUS.RUNNING) {
        return
      }

      const nextTime = state.timeLeft - 1

      if (nextTime <= 0) {
        commit(MUTATIONS.SET_TIME_LEFT, 0)
        dispatch('finishGame')
        return
      }

      commit(MUTATIONS.SET_TIME_LEFT, nextTime)
    },

    scheduleFigureTick: ({ state, commit, dispatch }, delay = state.figureDelay) => {
      if (state.status !== STATUS.RUNNING || !state.activeFigure) {
        return
      }

      clearFigureTimeout(state, commit)

      const figureTimeoutId = globalThis.setTimeout(() => {
        dispatch('tickFigure')
      }, delay)

      commit(MUTATIONS.SET_FIGURE_TIMEOUT_ID, figureTimeoutId)
    },

    startGame: ({ state, commit, dispatch }, fieldSize) => {
      const nextFieldSize = normalizeFieldSize(fieldSize ?? state.fieldSize)
      const center = Math.floor(nextFieldSize / 2)
      const baseCell = {
        x: center,
        y: center
      }

      clearFigureTimeout(state, commit)
      clearTimerInterval(state, commit)

      commit(MUTATIONS.SET_FIELD_SIZE, nextFieldSize)
      commit(MUTATIONS.SET_BASE_CELL, baseCell)
      commit(MUTATIONS.SET_ISLAND_CELLS, [{ ...baseCell }])
      commit(MUTATIONS.SET_ACTIVE_FIGURE, null)
      commit(MUTATIONS.SET_LAST_SPAWN_SIDE, null)
      commit(MUTATIONS.SET_SCORE, 0)
      commit(MUTATIONS.SET_TIME_LEFT, DEFAULT_TIME)
      commit(MUTATIONS.SET_STATUS, STATUS.RUNNING)
      commit(MUTATIONS.SET_FIGURE_DELAY, NORMAL_DELAY)
      commit(MUTATIONS.SET_BOOST_DELAY, BOOST_DELAY)

      dispatch('loadBestScore')
      dispatch('startTimer')
      dispatch('spawnFigure')
    },

    restartGame: ({ dispatch }, fieldSize) => {
      dispatch('startGame', fieldSize)
    },

    stopGame: ({ state, commit }) => {
      clearFigureTimeout(state, commit)
      clearTimerInterval(state, commit)
    },

    spawnFigure: ({ state, commit, dispatch }) => {
      if (state.status !== STATUS.RUNNING) {
        return
      }

      const typeKeys = Object.keys(TETROMINOES)
      const type = typeKeys[getRandomInt(0, typeKeys.length - 1)]
      const rotationIndex = getRandomInt(0, 3)
      const side = pickSpawnSide(state.lastSpawnSide)
      const figure = buildFigure(type, rotationIndex, side, state.fieldSize)

      commit(MUTATIONS.SET_ACTIVE_FIGURE, figure)
      commit(MUTATIONS.SET_LAST_SPAWN_SIDE, side)
      commit(MUTATIONS.SET_FIGURE_DELAY, NORMAL_DELAY)

      dispatch('scheduleFigureTick')
    },

    tickFigure: ({ state, commit, dispatch }) => {
      if (state.status !== STATUS.RUNNING || !state.activeFigure) {
        return
      }

      commit(MUTATIONS.SET_FIGURE_TIMEOUT_ID, null)

      const nextCells = translateCells(state.activeFigure.cells, state.activeFigure.vector)
      const islandKeySet = createCellKeySet(state.islandCells)

      if (hasCollision(nextCells, islandKeySet)) {
        dispatch('resolveAttachment')
        return
      }

      if (isFigureOutsideBoard(nextCells, state.fieldSize, state.activeFigure.side)) {
        commit(MUTATIONS.SET_ACTIVE_FIGURE, null)
        dispatch('spawnFigure')
        return
      }

      commit(MUTATIONS.SET_ACTIVE_FIGURE, {
        ...state.activeFigure,
        anchor: {
          x: state.activeFigure.anchor.x + state.activeFigure.vector.x,
          y: state.activeFigure.anchor.y + state.activeFigure.vector.y
        },
        cells: nextCells
      })

      dispatch('scheduleFigureTick')
    },

    resolveAttachment: ({ state, commit, dispatch }) => {
      if (state.status !== STATUS.RUNNING || !state.activeFigure) {
        return
      }

      clearFigureTimeout(state, commit)

      const figureCells = state.activeFigure.cells.filter((cell) => isInsideBoard(cell, state.fieldSize))
      let nextIslandCells = mergeCells(state.islandCells, figureCells)
      let scoreGain = 0
      let timeGain = 0

      const filledLayer = findFirstFilledLayer(nextIslandCells, state.baseCell)

      if (filledLayer !== null) {
        const collapseResult = collapseLayer(nextIslandCells, state.baseCell, filledLayer)

        nextIslandCells = collapseResult.nextIslandCells
        scoreGain += collapseResult.scoreGain
        timeGain += DEFAULT_TIME
      }

      commit(MUTATIONS.SET_ISLAND_CELLS, nextIslandCells)
      commit(MUTATIONS.SET_ACTIVE_FIGURE, null)

      if (scoreGain > 0) {
        commit(MUTATIONS.SET_SCORE, state.score + scoreGain)
        maybeUpdateBestScore({
          ...state,
          score: state.score + scoreGain
        }, commit)
      }

      if (timeGain > 0) {
        commit(MUTATIONS.SET_TIME_LEFT, state.timeLeft + timeGain)
      }

      if (touchesWall(nextIslandCells, state.fieldSize)) {
        dispatch('finishGame')
        return
      }

      dispatch('spawnFigure')
    },

    finishGame: ({ state, commit, dispatch }) => {
      if (state.status === STATUS.GAME_OVER) {
        return
      }

      clearFigureTimeout(state, commit)
      clearTimerInterval(state, commit)
      maybeUpdateBestScore(state, commit)

      commit(MUTATIONS.SET_ACTIVE_FIGURE, null)
      commit(MUTATIONS.SET_STATUS, STATUS.GAME_OVER)

      dispatch('saveBestScore')
    },

    moveIsland: ({ state, commit, dispatch }, direction) => {
      if (state.status !== STATUS.RUNNING) {
        return
      }

      const move = MOVES[direction]

      if (!move) {
        return
      }

      const nextCells = translateCells(state.islandCells, move)

      if (!isWithinBoard(nextCells, state.fieldSize)) {
        return
      }

      commit(MUTATIONS.SET_ISLAND_CELLS, nextCells)
      commit(MUTATIONS.SET_BASE_CELL, {
        x: state.baseCell.x + move.x,
        y: state.baseCell.y + move.y
      })

      if (touchesWall(nextCells, state.fieldSize)) {
        dispatch('finishGame')
        return
      }

      if (state.activeFigure && hasCollision(state.activeFigure.cells, createCellKeySet(nextCells))) {
        dispatch('resolveAttachment')
      }
    },

    rotateIsland: ({ state, commit, dispatch }, direction) => {
      if (
        state.status !== STATUS.RUNNING ||
        !state.baseCell ||
        (direction !== ROTATIONS.CW && direction !== ROTATIONS.CCW)
      ) {
        return
      }

      const nextCells = rotateCellsAroundBase(state.islandCells, state.baseCell, direction)

      if (!isWithinBoard(nextCells, state.fieldSize)) {
        return
      }

      commit(MUTATIONS.SET_ISLAND_CELLS, nextCells)

      if (touchesWall(nextCells, state.fieldSize)) {
        dispatch('finishGame')
        return
      }

      if (state.activeFigure && hasCollision(state.activeFigure.cells, createCellKeySet(nextCells))) {
        dispatch('resolveAttachment')
      }
    },

    boostFigure: ({ state, commit, dispatch }) => {
      if (state.status !== STATUS.RUNNING || !state.activeFigure) {
        return
      }

      commit(MUTATIONS.SET_FIGURE_DELAY, state.boostDelay)
      dispatch('scheduleFigureTick', state.boostDelay)
    }
  }
}
