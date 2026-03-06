import { ALL_ORIENTATIONS } from './pieces'

const MUTATIONS = {
    CHANGE_FIELD_SIZE: 'CHANGE_FIELD_SIZE',
    SET_NUMBER: 'SET_NUMBER',
    SET_GAME_ACTIVE: 'SET_GAME_ACTIVE',
    SET_CURRENT_PIECE: 'SET_CURRENT_PIECE',
    SET_LAST_SIDE: 'SET_LAST_SIDE',
    SET_FIELD: 'SET_FIELD'
}

const OBJECTS = {
  NONE: 0,
  CENTRAL_CUBE: 1,
  EXTERNAL_FIGURE: 2,
  ATTACHED_CUBE: 3
}

export default {
  namespaced: true,
  state () {
    return {
        size: 7,
        field: null,
        gameActive: false,
        currentPiece: null,
        lastSide: null,
    }
  },
  getters: {
    getField: (state) => state.field,
    getFieldSize: (state) => state.size,
    isGameActive: (state) => state.gameActive,
    getCurrentPiece: (state) => state.currentPiece,
  },
  mutations: {
    [MUTATIONS.CHANGE_FIELD_SIZE]: (state, newSize) => {
      state.size = newSize
      if (state.size < 7) {
          state.size = 7
      }
      else if (state.size > 21) {
          state.size = 21
      }
      else if (state.size % 2 == 0) {
          state.size += 1
      }

      state.field = Array(state.size).fill(null).map(() => Array(state.size).fill(0))
      state.gameActive = false
      state.currentPiece = null
      state.lastSide = null
    },
    [MUTATIONS.SET_NUMBER]: (state, { position, objectType }) => {
      if (position.x >= 0 && position.x < state.size &&
            position.y >= 0 && position.y < state.size) {
        state.field[position.y - 1][position.x - 1] = objectType
      }
    },
    [MUTATIONS.SET_GAME_ACTIVE]: (state, active) => {
        state.gameActive = active
    },
    [MUTATIONS.SET_CURRENT_PIECE]: (state, piece) => {
        state.currentPiece = piece
    },
    [MUTATIONS.SET_LAST_SIDE]: (state, side) => {
        state.lastSide = side
    },
    [MUTATIONS.SET_FIELD]: (state, newField) => {
        state.field = newField
    }
  },
  actions: {
    changeFieldSize: ({ commit }, newSize) => {
      commit(MUTATIONS.CHANGE_FIELD_SIZE, newSize)
    },
    startGame: ({ commit, dispatch }) => {
        commit(MUTATIONS.SET_GAME_ACTIVE, true)
        dispatch('spawnPiece')
    },
    stopGame: ({ commit, dispatch }) => {
        dispatch('clearPieceFromField')
        commit(MUTATIONS.SET_GAME_ACTIVE, false)
        commit(MUTATIONS.SET_CURRENT_PIECE, null)
        commit(MUTATIONS.SET_LAST_SIDE, null)
    },
    clearPieceFromField({ state, commit }) {
        if (!state.currentPiece || !state.field) return
        const piece = state.currentPiece
        const { shape, x, y } = piece
        const newField = state.field.map(row => [...row])
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[0].length; c++) {
                if (shape[r][c] === 1) {
                    const nx = x + c
                    const ny = y + r
                    if (nx >= 0 && nx < state.size && ny >= 0 && ny < state.size) {
                        if (newField[ny][nx] === 2) {
                            newField[ny][nx] = 0
                        }
                    }
                }
            }
        }
        commit(MUTATIONS.SET_FIELD, newField)
    },
    drawPieceOnField({ state, commit }) {
        if (!state.currentPiece || !state.field) return
        const piece = state.currentPiece
        const { shape, x, y } = piece
        const newField = state.field.map(row => [...row])
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[0].length; c++) {
                if (shape[r][c] === 1) {
                    const nx = x + c
                    const ny = y + r
                    if (nx >= 0 && nx < state.size && ny >= 0 && ny < state.size) {
                        newField[ny][nx] = 2
                    }
                }
            }
        }
        commit(MUTATIONS.SET_FIELD, newField)
    },
    spawnPiece: ({ state, commit, dispatch }) => {
        if (!state.gameActive) return

        if (state.currentPiece) {
            dispatch('clearPieceFromField')
        }

        let availableSides = [0, 1, 2, 3]
        if (state.lastSide !== null) {
            availableSides = availableSides.filter(s => s !== state.lastSide)
        }
        const side = availableSides[Math.floor(Math.random() * availableSides.length)]
        commit(MUTATIONS.SET_LAST_SIDE, side)

        const shape = ALL_ORIENTATIONS[Math.floor(Math.random() * ALL_ORIENTATIONS.length)]
        const height = shape.length
        const width = shape[0].length

        const getPosition = (minPossible, maxPossible) => {
            if (maxPossible - minPossible >= 2) {
                const newMin = minPossible + 1
                const newMax = maxPossible - 1
                return Math.floor(Math.random() * (newMax - newMin + 1)) + newMin
            }
            return Math.floor(Math.random() * (maxPossible - minPossible + 1)) + minPossible
        }

        let x, y, direction
        switch (side) {
            case 0:
                x = getPosition(0, state.size - width)
                y = -height
                direction = 0
                break
            case 1:
                x = state.size
                y = getPosition(0, state.size - height)
                direction = 1
                break
            case 2:
                x = getPosition(0, state.size - width)
                y = state.size
                direction = 2
                break
            case 3:
                x = -width
                y = getPosition(0, state.size - height)
                direction = 3
                break
        }

        const newPiece = { shape, x, y, direction }
        commit(MUTATIONS.SET_CURRENT_PIECE, newPiece)
        dispatch('drawPieceOnField')
    },
    changeCentralCubePosition: (store, { oldPosition, newPosition }) => {
      store.commit(MUTATIONS.SET_NUMBER, { position: newPosition, objectType: OBJECTS.CENTRAL_CUBE })
      store.commit(MUTATIONS.SET_NUMBER, { position: oldPosition, objectType: OBJECTS.NONE })
    },
    initStartGame: ({ commit, dispatch }) => {
        commit(MUTATIONS.SET_GAME_ACTIVE, true)
        dispatch('spawnPiece')
    },
    initStopGame: ({ commit, dispatch }) => {
        dispatch('clearPieceFromField')
        commit(MUTATIONS.SET_GAME_ACTIVE, false)
        commit(MUTATIONS.SET_CURRENT_PIECE, null)
        commit(MUTATIONS.SET_LAST_SIDE, null)
    },
    clearPieceFromField({ state, commit }) {
        if (!state.currentPiece || !state.field) return
        const piece = state.currentPiece
        const { shape, x, y } = piece
        const newField = state.field.map(row => [...row])
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[0].length; c++) {
                if (shape[r][c] === 1) {
                    const nx = x + c
                    const ny = y + r
                    if (nx >= 0 && nx < state.size && ny >= 0 && ny < state.size) {
                        if (newField[ny][nx] === 2) {
                            newField[ny][nx] = 0
                        }
                    }
                }
            }
        }
        commit(MUTATIONS.SET_FIELD, newField)
    },
    drawPieceOnField({ state, commit }) {
        if (!state.currentPiece || !state.field) return
        const piece = state.currentPiece
        const { shape, x, y } = piece
        const newField = state.field.map(row => [...row])
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[0].length; c++) {
                if (shape[r][c] === 1) {
                    const nx = x + c
                    const ny = y + r
                    if (nx >= 0 && nx < state.size && ny >= 0 && ny < state.size) {
                        newField[ny][nx] = 2
                    }
                }
            }
        }
        commit(MUTATIONS.SET_FIELD, newField)
    },
    spawnPiece: ({ state, commit, dispatch }) => {
        if (!state.gameActive) return

        if (state.currentPiece) {
            dispatch('clearPieceFromField')
        }

        let availableSides = [0, 1, 2, 3]
        if (state.lastSide !== null) {
            availableSides = availableSides.filter(s => s !== state.lastSide)
        }
        const side = availableSides[Math.floor(Math.random() * availableSides.length)]
        commit(MUTATIONS.SET_LAST_SIDE, side)

        const shape = ALL_ORIENTATIONS[Math.floor(Math.random() * ALL_ORIENTATIONS.length)]
        const height = shape.length
        const width = shape[0].length

        const getPosition = (minPossible, maxPossible) => {
            if (maxPossible - minPossible >= 2) {
                const newMin = minPossible + 1
                const newMax = maxPossible - 1
                return Math.floor(Math.random() * (newMax - newMin + 1)) + newMin
            }
            return Math.floor(Math.random() * (maxPossible - minPossible + 1)) + minPossible
        }

        let x, y, direction
        switch (side) {
            case 0:
                x = getPosition(0, state.size - width)
                y = -height
                direction = 0
                break
            case 1:
                x = state.size
                y = getPosition(0, state.size - height)
                direction = 1
                break
            case 2:
                x = getPosition(0, state.size - width)
                y = state.size
                direction = 2
                break
            case 3:
                x = -width
                y = getPosition(0, state.size - height)
                direction = 3
                break
        }

        const newPiece = { shape, x, y, direction }
        commit(MUTATIONS.SET_CURRENT_PIECE, newPiece)
        dispatch('drawPieceOnField')
    },
    movePiece: ({ state, commit, dispatch }) => {
        if (!state.gameActive || !state.currentPiece) return

        dispatch('clearPieceFromField')

        const piece = state.currentPiece
        let { x, y, direction } = piece
        const { shape } = piece
        const height = shape.length
        const width = shape[0].length

        switch (direction) {
            case 0: y++; break
            case 1: x--; break
            case 2: y--; break
            case 3: x++; break
        }

        let outside = (direction === 0 && y >= state.size) || (direction === 1 && x + width <= 0) ||
        (direction === 2 && y + height <= 0) || (direction === 3 && x >= state.size)

        if (outside) {
            commit(MUTATIONS.SET_CURRENT_PIECE, null)
            if (state.gameActive) {
                dispatch('spawnPiece')
            }
        } else {
            const updatedPiece = { ...piece, x, y }
            commit(MUTATIONS.SET_CURRENT_PIECE, updatedPiece)
            dispatch('drawPieceOnField')
        }
    }
  }
}