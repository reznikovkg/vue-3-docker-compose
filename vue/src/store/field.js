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
    [MUTATIONS.SET_NUMBER]: (state, { position, number }) => {
      if (position.x >= 0 && position.x < state.size &&
            position.y >= 0 && position.y < state.size) {
        state.field[position.y][position.x] = number
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
    changeFieldSize: (store, newSize) => {
      store.commit(MUTATIONS.CHANGE_FIELD_SIZE, newSize)
    },
    startGame: (store) => {
        store.commit(MUTATIONS.SET_GAME_ACTIVE, true)
        store.dispatch('spawnPiece')
    },
    stopGame: (store) => {
        store.dispatch('clearPieceFromField')
        store.commit(MUTATIONS.SET_GAME_ACTIVE, false)
        store.commit(MUTATIONS.SET_CURRENT_PIECE, null)
        store.commit(MUTATIONS.SET_LAST_SIDE, null)
    },
    clearPieceFromField(store) {
        if (!store.state.currentPiece || !store.state.field) return
        const piece = store.state.currentPiece
        const { shape, x, y } = piece
        const newField = store.state.field.map(row => [...row])
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[0].length; c++) {
                if (shape[r][c] === 1) {
                    const nx = x + c
                    const ny = y + r
                    if (nx >= 0 && nx < store.state.size && ny >= 0 && ny < store.state.size) {
                        if (newField[ny][nx] === 2) {
                            newField[ny][nx] = 0
                        }
                    }
                }
            }
        }
        store.commit(MUTATIONS.SET_FIELD, newField)
    },
    drawPieceOnField(store) {
        if (!store.state.currentPiece || !store.state.field) return
        const piece = state.currentPiece
        const { shape, x, y } = piece
        const newField = store.state.field.map(row => [...row])
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[0].length; c++) {
                if (shape[r][c] === 1) {
                    const nx = x + c
                    const ny = y + r
                    if (nx >= 0 && nx < store.state.size && ny >= 0 && ny < store.state.size) {
                        newField[ny][nx] = 2
                    }
                }
            }
        }
        store.commit(MUTATIONS.SET_FIELD, newField)
    },
    spawnPiece: (store) => {
        if (!store.state.gameActive) return

        if (store.state.currentPiece) {
            store.dispatch('clearPieceFromField')
        }

        let availableSides = [0, 1, 2, 3]
        if (store.state.lastSide !== null) {
            availableSides = availableSides.filter(s => s !== store.state.lastSide)
        }
        const side = availableSides[Math.floor(Math.random() * availableSides.length)]
        store.commit(MUTATIONS.SET_LAST_SIDE, side)

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
                x = getPosition(0, store.state.size - width)
                y = -height
                direction = 0
                break
            case 1:
                x = store.state.size
                y = getPosition(0, store.state.size - height)
                direction = 1
                break
            case 2:
                x = getPosition(0, store.state.size - width)
                y = store.state.size
                direction = 2
                break
            case 3:
                x = -width
                y = getPosition(0, store.state.size - height)
                direction = 3
                break
        }

        const newPiece = { shape, x, y, direction }
        store.commit(MUTATIONS.SET_CURRENT_PIECE, newPiece)
        store.dispatch('drawPieceOnField')
    },
    changeCentralCubePosition: (store, { oldPosition, newPosition }) => {
      store.commit(MUTATIONS.SET_NUMBER, { position: {x: newPosition.x - 1, y: newPosition.y - 1}, number: OBJECTS.CENTRAL_CUBE })
      store.commit(MUTATIONS.SET_NUMBER, { position: {x: oldPosition.x - 1, y: oldPosition.y - 1}, number: OBJECTS.NONE })
    },
    initStartGame: (store) => {
        store.commit(MUTATIONS.SET_GAME_ACTIVE, true)
        store.dispatch('spawnPiece')
    },
    initStopGame: (store) => {
        store.dispatch('clearPieceFromField')
        store.commit(MUTATIONS.SET_GAME_ACTIVE, false)
        store.commit(MUTATIONS.SET_CURRENT_PIECE, null)
        store.commit(MUTATIONS.SET_LAST_SIDE, null)
    },
    clearPieceFromField(store) {
        if (!store.state.currentPiece || !store.state.field) return
        const piece = store.state.currentPiece
        const { shape, x, y } = piece
        const newField = store.state.field.map(row => [...row])
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[0].length; c++) {
                if (shape[r][c] === 1) {
                    const nx = x + c
                    const ny = y + r
                    if (nx >= 0 && nx < store.state.size && ny >= 0 && ny < store.state.size) {
                        if (newField[ny][nx] === 2) {
                            newField[ny][nx] = 0
                        }
                    }
                }
            }
        }
        store.commit(MUTATIONS.SET_FIELD, newField)
    },
    drawPieceOnField(store) {
        if (!store.state.currentPiece || !store.state.field) return
        const piece = store.state.currentPiece
        const { shape, x, y } = piece
        const newField = store.state.field.map(row => [...row])
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[0].length; c++) {
                if (shape[r][c] === 1) {
                    const nx = x + c
                    const ny = y + r
                    if (nx >= 0 && nx < store.state.size && ny >= 0 && ny < store.state.size) {
                        newField[ny][nx] = 2
                    }
                }
            }
        }
        store.commit(MUTATIONS.SET_FIELD, newField)
    },
    spawnPiece: (store) => {
        if (!store.state.gameActive) return

        if (store.state.currentPiece) {
            store.dispatch('clearPieceFromField')
        }

        let availableSides = [0, 1, 2, 3]
        if (store.state.lastSide !== null) {
            availableSides = availableSides.filter(s => s !== store.state.lastSide)
        }
        const side = availableSides[Math.floor(Math.random() * availableSides.length)]
        store.commit(MUTATIONS.SET_LAST_SIDE, side)

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
                x = getPosition(0, store.state.size - width)
                y = -height
                direction = 0
                break
            case 1:
                x = store.state.size
                y = getPosition(0, store.state.size - height)
                direction = 1
                break
            case 2:
                x = getPosition(0, store.state.size - width)
                y = store.state.size
                direction = 2
                break
            case 3:
                x = -width
                y = getPosition(0, store.state.size - height)
                direction = 3
                break
        }

        const newPiece = { shape, x, y, direction }
        store.commit(MUTATIONS.SET_CURRENT_PIECE, newPiece)
        store.dispatch('drawPieceOnField')
    },
    movePiece: (store) => {
        if (!store.state.gameActive || !store.state.currentPiece) return

        store.dispatch('clearPieceFromField')

        const piece = store.state.currentPiece
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

        let outside = (direction === 0 && y >= store.state.size) || (direction === 1 && x + width <= 0) ||
        (direction === 2 && y + height <= 0) || (direction === 3 && x >= store.state.size)

        if (outside) {
            store.commit(MUTATIONS.SET_CURRENT_PIECE, null)
            if (store.state.gameActive) {
                store.dispatch('spawnPiece')
            }
        } else {
            const updatedPiece = { ...piece, x, y }
            store.commit(MUTATIONS.SET_CURRENT_PIECE, updatedPiece)
            store.dispatch('drawPieceOnField')
            store.dispatch('checkLevel', 0)
            let isSpawn = false
            for (let r = 0; r < updatedPiece.shape.length && !isSpawn; r++) {
                for (let c = 0; c < updatedPiece.shape[0].length && !isSpawn; c++) {
                    if (shape[r][c] === 1) {
                        const nx = x + c
                        const ny = y + r
                        if (0 <= ny && ny < store.state.size && 0 <= nx && nx < store.state.size &&
                            store.state.field[ny][nx] == 3) {
                                store.dispatch('spawnPiece')
                                isSpawn = true
                            }
                    }
                }
            }
        }
    },
    isHomogeneousLevel: (store, {level, number}) => {
      if (level < 0) return true
      if (level == 0) return number == 1
      let { x, y } = store.rootGetters['cube/getCentralCubePosition']
      x--
      y--
      let fieldSize = store.state.size
      let isHomogeneous = true
      if (x + level < fieldSize && y + level < fieldSize && x - level >= 0 && y - level >= 0) {
        for (let up = -level; up <= level && isHomogeneous; up++) {
            isHomogeneous &&= store.state.field[y - level][x + up] == number
        }
        
        for (let down = -level; down <= level && isHomogeneous; down++) {
            isHomogeneous &&= store.state.field[y + level][x + down] == number
        }

        for (let right = -level; right <= level && isHomogeneous; right++) {
            isHomogeneous &&= store.state.field[y + right][x - level] == number
        }
        
        for (let left = -level; left <= level && isHomogeneous; left++) {
            isHomogeneous &&= store.state.field[y + left][x + level] == number
        }
      }
      return isHomogeneous
    },
    checkLevel: (store, level) => {
      if (level < 0) return
      let { x, y } = store.rootGetters['cube/getCentralCubePosition']
      x--
      y--
      let fieldSize = store.state.size
      if (x + level < fieldSize && y + level < fieldSize && x - level >= 0 && y - level >= 0) {
        for (let up = -level; up <= level; up++) {
          store.dispatch('checkCell', { x: x + up, y: y - level })
        }
        
        for (let down = -level; down <= level; down++) {
          store.dispatch('checkCell', { x: x + down, y: y + level })
        }

        for (let right = -level; right <= level; right++) {
          store.dispatch('checkCell', { x: x - level, y: y + right })
        }
        
        for (let left = -level; left <= level; left++) {
          store.dispatch('checkCell', { x: x + level, y: y + left })
        }
      }
      store.dispatch('isHomogeneousLevel', { level: 1, number: 0}).then(
        value => console.log(value)
      )
    },
    checkCell: (store, {x, y}) => { 
      let fieldSize = store.state.size
      let cur_cell = store.state.field[y][x]
      if (cur_cell != OBJECTS.NONE && cur_cell != OBJECTS.EXTERNAL_FIGURE) {
        const queue = []
        if (y > 0 && store.state.field[y - 1][x] == OBJECTS.EXTERNAL_FIGURE) {
          store.commit(MUTATIONS.SET_NUMBER, {position: {x: x, y: y - 1}, number: OBJECTS.ATTACHED_CUBE})
          queue.push({x: x, y: y - 1})
        }
        if (y < fieldSize - 1 && store.state.field[y + 1][x] == OBJECTS.EXTERNAL_FIGURE) {
          store.commit(MUTATIONS.SET_NUMBER, {position: {x: x, y: y + 1}, number: OBJECTS.ATTACHED_CUBE})
          queue.push({x: x, y: y + 1})
        }
        if (x > 0 && store.state.field[y][x - 1] == OBJECTS.EXTERNAL_FIGURE) {
          store.commit(MUTATIONS.SET_NUMBER, {position: {x: x - 1, y: y}, number: OBJECTS.ATTACHED_CUBE})
          queue.push({x: x - 1, y: y})
        }
        if (x < fieldSize - 1 && store.state.field[y][x + 1] == OBJECTS.EXTERNAL_FIGURE) {
          store.commit(MUTATIONS.SET_NUMBER, {position: {x: x + 1, y: y}, number: OBJECTS.ATTACHED_CUBE})
          queue.push({x: x + 1, y: y})
        }
        while (queue.length > 0) {
          const { x, y } = queue.shift()
          if (y > 0 && store.state.field[y - 1][x] == OBJECTS.EXTERNAL_FIGURE) {
            store.commit(MUTATIONS.SET_NUMBER, {position: {x: x, y: y - 1}, number: OBJECTS.ATTACHED_CUBE})
            queue.push({x: x, y: y - 1})
          }
          if (y < fieldSize - 1 && store.state.field[y + 1][x] == OBJECTS.EXTERNAL_FIGURE) {
            store.commit(MUTATIONS.SET_NUMBER, {position: {x: x, y: y + 1}, number: OBJECTS.ATTACHED_CUBE})
            queue.push({x: x, y: y + 1})
          }
          if (x > 0 && store.state.field[y][x - 1] == OBJECTS.EXTERNAL_FIGURE) {
            store.commit(MUTATIONS.SET_NUMBER, {position: {x: x - 1, y: y}, number: OBJECTS.ATTACHED_CUBE})
            queue.push({x: x - 1, y: y})
          }
          if (x < fieldSize - 1 && store.state.field[y][x + 1] == OBJECTS.EXTERNAL_FIGURE) {
            store.commit(MUTATIONS.SET_NUMBER, {position: {x: x + 1, y: y}, number: OBJECTS.ATTACHED_CUBE})
            queue.push({x: x + 1, y: y})
          }
        }
      }
      return false
    }
  }
}