import { ALL_ORIENTATIONS } from './pieces'
import { DECREASE_TIMER_VALUE_DEFAULT, INCREASE_TIMER_VALUE_DEFAULT } from './game'

const MUTATIONS = {
    CHANGE_FIELD_SIZE: 'CHANGE_FIELD_SIZE',
    SET_NUMBER: 'SET_NUMBER',
    SET_GAME_ACTIVE: 'SET_GAME_ACTIVE',
    SET_CURRENT_PIECE: 'SET_CURRENT_PIECE',
    SET_LAST_SIDE: 'SET_LAST_SIDE',
    SET_FIELD: 'SET_FIELD',
    CLEAR_FIELD: 'CLEAR_FIELD',
    SET_CURRENT_FIGURE_COORDS: 'SET_CURRENT_FIGURE_COORDS',
}

export const OBJECTS = {
  NONE: 0,
  CENTRAL_CUBE: 1,
  EXTERNAL_FIGURE: 2,
  ATTACHED_CUBE: 3
}

export default {
  namespaced: true,
  state () {
    return {
        size: 15,
        field: null,
        gameActive: false,
        currentPiece: null,
        currentFigureCoords: null,
        lastSide: null,
    }
  },
  getters: {
    getField: (state) => state.field,
    getFieldSize: (state) => state.size,
    isGameActive: (state) => state.gameActive,
    getCurrentPiece: (state) => state.currentPiece,
    getCurrentFigureCoords: state => state.currentFigureCoords
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

      state.field = Array(state.size).fill(null).map(
            () => Array(state.size).fill(OBJECTS.NONE)
        )
      state.gameActive = false
      state.currentPiece = null
      state.lastSide = null

      let center = Math.floor(state.size / 2)

      state.field[center][center] = OBJECTS.CENTRAL_CUBE
    },
    [MUTATIONS.CLEAR_FIELD]: (state) => {
      state.field = Array(state.size).fill(null).map(() => Array(state.size).fill(0))
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
    },
    [MUTATIONS.SET_CURRENT_FIGURE_COORDS]: (state, value) => {
        state.currentFigureCoords = value
    }
  },
  actions: {
    setField: (store, newField) => {
        store.commit(MUTATIONS.SET_FIELD, newField)
    },
    changeFieldSize: (store, newSize) => {
      store.commit(MUTATIONS.CHANGE_FIELD_SIZE, newSize)
    },
    clearField: (store) => {
      store.commit(MUTATIONS.CLEAR_FIELD)
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
    setNumber: (store, {position, number}) => {
        store.commit(MUTATIONS.SET_NUMBER, {position: position, number: number})
    },
    clearPieceFromField: (store) => {
        if (!store.state.currentPiece || !store.state.field) return
        const fieldSize = store.state.size
        const piece = store.state.currentPiece
        const { shape, x, y } = piece
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[0].length; c++) {
                if (shape[r][c] === 1) {
                    const nx = x + c
                    const ny = y + r
                    if (nx >= 0 && nx < fieldSize && ny >= 0 && ny < fieldSize)
                        if (store.state.field[ny][nx] === OBJECTS.EXTERNAL_FIGURE)
                            store.dispatch('clearCell', {x: nx, y: ny})
                }
            }
        }
    },
    clearCell: (store, position) => {
        store.commit(MUTATIONS.SET_NUMBER, { position: position, number: OBJECTS.NONE })
    },
    drawPieceOnField: (store) => {
        if (!store.state.currentPiece || !store.state.field) return
        const fieldSize = store.state.size
        const piece = state.currentPiece
        const { shape, x, y } = piece
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[0].length; c++) {
                if (shape[r][c] === 1) {
                    const nx = x + c
                    const ny = y + r
                    if (nx >= 0 && nx < fieldSize && ny >= 0 && ny < fieldSize)
                        store.commit(MUTATIONS.SET_NUMBER, { position: {x: nx, y: ny}, number: OBJECTS.EXTERNAL_FIGURE })
                }
            }
        }
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
      const realOldPosition = {x: oldPosition.x - 1, y: oldPosition.y - 1}
      const realPosition = {x: newPosition.x - 1, y: newPosition.y - 1}
      const attachedPieces = store.rootGetters['cube/getAttachedPieces']
      attachedPieces.forEach(piece => {
        store.commit(MUTATIONS.SET_NUMBER, { position: {x: realOldPosition.x + piece.x, y: realOldPosition.y + piece.y},
            number: OBJECTS.NONE })
      })
      store.commit(MUTATIONS.SET_NUMBER, { position: realPosition, number: OBJECTS.CENTRAL_CUBE })
      store.commit(MUTATIONS.SET_NUMBER, { position: realOldPosition, number: OBJECTS.NONE })
      attachedPieces.forEach(piece => {
        store.commit(MUTATIONS.SET_NUMBER, { position: {x: realPosition.x + piece.x, y: realPosition.y + piece.y},
            number: OBJECTS.ATTACHED_CUBE })
      })
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
    clearPieceFromField: (store) => {
        if (!store.state.currentPiece || !store.state.field) return
        const fieldSize = store.state.size
        const piece = store.state.currentPiece
        const { shape, x, y } = piece
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[0].length; c++) {
                if (shape[r][c] === 1) {
                    const nx = x + c
                    const ny = y + r
                    if (nx >= 0 && nx < fieldSize && ny >= 0 && ny < fieldSize) {
                        if (store.state.field[ny][nx] === 2) {
                            store.commit(MUTATIONS.SET_NUMBER, { position: {x: nx, y: ny}, number: OBJECTS.NONE })
                        }
                    }
                }
            }
        }
    },
    drawPieceOnField: (store) => {
        if (!store.state.currentPiece || !store.state.field) return
        const fieldSize = store.state.size
        const piece = store.state.currentPiece
        const { shape, x, y } = piece

        const figureCoords = []

        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[0].length; c++) {
                if (shape[r][c] === 1) {
                    const nx = x + c
                    const ny = y + r
                    if (nx >= 0 && nx < fieldSize && ny >= 0 && ny < fieldSize) {
                        store.commit(MUTATIONS.SET_NUMBER, { position: {x: nx, y: ny}, number: OBJECTS.EXTERNAL_FIGURE })

                        figureCoords.push({
                            x: nx,
                            y: ny
                        })
                    }
                }
            }
        }
        store.commit(MUTATIONS.SET_CURRENT_FIGURE_COORDS, figureCoords)
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

        const fieldSize = store.state.size
        let x, y, direction
        switch (side) {
            case 0:
                x = getPosition(0, fieldSize - width)
                y = -height
                direction = 0
                break
            case 1:
                x = fieldSize
                y = getPosition(0, fieldSize - height)
                direction = 1
                break
            case 2:
                x = getPosition(0, fieldSize - width)
                y = fieldSize
                direction = 2
                break
            case 3:
                x = -width
                y = getPosition(0, fieldSize - height)
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

        const fieldSize = store.state.size
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

        let outside = (direction === 0 && y >= fieldSize) || (direction === 1 && x + width <= 0) ||
        (direction === 2 && y + height <= 0) || (direction === 3 && x >= fieldSize)

        if (outside) {
            store.commit(MUTATIONS.SET_CURRENT_PIECE, null)
            if (store.state.gameActive) {
                store.dispatch('game/addScore', -10, { root: true }).then(
                    () => store.dispatch('spawnPiece')
                )
            }
        } else {
            const updatedPiece = { ...piece, x, y }
            store.commit(MUTATIONS.SET_CURRENT_PIECE, updatedPiece)
            store.dispatch('drawPieceOnField').then(
                () => store.dispatch('checkFigureAttachment')
            )
        }
    },
    isHomogeneousLevel: (store, {level, number}) => {
      if (level < 0) return true
      if (level == 0) return number == OBJECTS.CENTRAL_CUBE
      let { x, y } = store.rootGetters['cube/getCentralCubePosition']
      x--
      y--
      let fieldSize = store.state.size
      let isHomogeneous = true
      if (x + level < fieldSize && y + level < fieldSize && x - level >= 0 && y - level >= 0) {
        for (let up = -level; up <= level && isHomogeneous; up++)
            isHomogeneous &&= store.state.field[y - level][x + up] == number
        
        for (let down = -level; down <= level && isHomogeneous; down++)
            isHomogeneous &&= store.state.field[y + level][x + down] == number

        for (let right = -level; right <= level && isHomogeneous; right++)
            isHomogeneous &&= store.state.field[y + right][x + level] == number
        
        for (let left = -level; left <= level && isHomogeneous; left++)
            isHomogeneous &&= store.state.field[y + left][x - level] == number
      }
      else {
        isHomogeneous = false
      }
      return isHomogeneous
    },
    setLevelValues: (store, level, value) => {
      if (level <= 0) return
      let { x, y } = store.rootGetters['cube/getCentralCubePosition']
      x--
      y--
      let fieldSize = store.state.size
      if (y - level >= 0)
        for (let up = -level; up <= level; up++)
            if (x + up >= 0 && x + up < fieldSize)
                store.commit(MUTATIONS.SET_NUMBER, { position: {x: x + up, y: y - level}, number: value })
        
      if (y + level < fieldSize)
        for (let down = -level; down <= level; down++)
            if (x + down >= 0 && x + down < fieldSize)
                store.commit(MUTATIONS.SET_NUMBER, { position: { x: x + down, y: y + level }, number: value })

      if (x + level < fieldSize)
        for (let right = -level; right <= level; right++)
            if (y + right >= 0 && y + right < fieldSize)
                store.commit(MUTATIONS.SET_NUMBER, { position: { x: x + level, y: y + right }, number: value })
        
      if (x - level >= 0)
        for (let left = -level; left <= level; left++)
            if (y + left >= 0 && y + left < fieldSize)
                store.commit(MUTATIONS.SET_NUMBER, { position: { x: x - level, y: y + left }, number: value })
    },
    countLevelValues: (store, {level, value}) => {
      if (level < 0) return 0
      let { x, y } = store.rootGetters['cube/getCentralCubePosition']
      x--
      y--
      let fieldSize = store.state.size
      let count = 0
      if (y - level >= 0)
        for (let up = -level; up <= level; up++)
            if (x + up >= 0 && x + up < fieldSize)
                count += store.state.field[y - level][x + up] == value
        
      if (y + level < fieldSize)
        for (let down = -level; down <= level; down++)
            if (x + down >= 0 && x + down < fieldSize)
                count += store.state.field[y + level][x + down] == value

      if (x + level < fieldSize)
        for (let right = -level; right <= level; right++)
            if (y + right >= 0 && y + right < fieldSize)
                count += store.state.field[y + right][x + level] == value
        
      if (x - level >= 0)
        for (let left = -level; left <= level; left++)
            if (y + left >= 0 && y + left < fieldSize)
                count += store.state.field[y + left][x - level] == value
      return count
    },
    scoreSquareLevels: (store) => {
        let minDisappearLevel = -1
        
        for (let level = 0; level < store.state.size; level++)
            store.dispatch('isHomogeneousLevel', { level: level, number: 3}).then(
                value => {
                    if (value) {
                        minDisappearLevel = level
                        store.dispatch('game/addScore', level * 8 * 5, { root: true }).then(
                            () => store.dispatch('cube/removeLevelPieces', level, { root: true })
                        ).then(
                            () => store.dispatch('game/updateTimer', {
                                isIncrease: true,
                                decreaseValue: DECREASE_TIMER_VALUE_DEFAULT,
                                increaseValue: INCREASE_TIMER_VALUE_DEFAULT
                            }, { root: true })
                        )
                        
                    }
                    else if (minDisappearLevel != -1) {
                        store.dispatch('countLevelValues', {level: level, value: 3}).then(
                            count => {
                                store.dispatch('game/addScore', count, { root: true })
                            }
                        ).then(
                            () => store.dispatch('cube/removeLevelPieces', level, { root: true })
                        )
                    }
                }
            )
    },
    checkFigureAttachment: (store) => {
        const fieldSize = store.state.size
        for (let level = 0; level < fieldSize; level++)
            store.dispatch('checkLevel', level)
            
        store.dispatch('scoreSquareLevels').then(
            () => store.dispatch('game/checkGameEnd', null, { root: true })
        )
        
        const shape = store.state.currentPiece.shape
        if (store.state.currentPiece != null) {
            let isSpawn = false
            for (let r = 0; r < shape.length && !isSpawn; r++) {
                for (let c = 0; c < shape[0].length && !isSpawn; c++) {
                    if (shape[r][c] === 1) {
                        const nx = store.state.currentPiece.x + c
                        const ny = store.state.currentPiece.y + r
                        if (0 <= ny && ny < fieldSize && 0 <= nx && nx < fieldSize &&
                            store.state.field[ny][nx] == OBJECTS.ATTACHED_CUBE) {
                                store.dispatch('spawnPiece')
                                isSpawn = true
                            }
                    }
                }
            }
        }
    },
    checkLevel: (store, level) => {
      if (level < 0) return
      let { x, y } = store.rootGetters['cube/getCentralCubePosition']
      x--
      y--
      const fieldSize = store.state.size
      if (y - level >= 0)
        for (let up = -level; up <= level; up++)
            if (x + up >= 0 && x + up < fieldSize)
                store.dispatch('checkCell', { x: x + up, y: y - level })
        
      if (y + level < fieldSize)
        for (let down = -level; down <= level; down++)
            if (x + down >= 0 && x + down < fieldSize)
                store.dispatch('checkCell', { x: x + down, y: y + level })

      if (x + level < fieldSize)
        for (let right = -level; right <= level; right++)
            if (y + right >= 0 && y + right < fieldSize)
                store.dispatch('checkCell', { x: x + level, y: y + right })
        
      if (x - level >= 0)
        for (let left = -level; left <= level; left++)
            if (y + left >= 0 && y + left < fieldSize)
                store.dispatch('checkCell', { x: x - level, y: y + left })
    },
    checkCell: (store, {x, y}) => {
      let cur_cell = store.state.field[y][x]
      if (cur_cell != OBJECTS.NONE && cur_cell != OBJECTS.EXTERNAL_FIGURE) {
        const queue = []
        store.dispatch('checkNeighboringCells', {queue: queue, x: x, y: y})
        while (queue.length > 0) {
          const { x, y } = queue.shift()
          store.dispatch('checkNeighboringCells', {queue: queue, x: x, y: y})
        }
      }
    },
    checkNeighboringCells: (store, {queue, x, y}) => {
        const fieldSize = store.state.size
        if (y > 0 && store.state.field[y - 1][x] == OBJECTS.EXTERNAL_FIGURE)
          store.dispatch('attachNeighboringCell', {queue: queue, x: x, y: y - 1})
        if (y < fieldSize - 1 && store.state.field[y + 1][x] == OBJECTS.EXTERNAL_FIGURE)
          store.dispatch('attachNeighboringCell', {queue: queue, x: x, y: y + 1})
        if (x > 0 && store.state.field[y][x - 1] == OBJECTS.EXTERNAL_FIGURE)
          store.dispatch('attachNeighboringCell', {queue: queue, x: x - 1, y: y})
        if (x < fieldSize - 1 && store.state.field[y][x + 1] == OBJECTS.EXTERNAL_FIGURE)
          store.dispatch('attachNeighboringCell', {queue: queue, x: x + 1, y: y})
    },
    attachNeighboringCell: (store, {queue, x, y}) => {
          let centralCubePosition = store.rootGetters['cube/getCentralCubePosition']
          centralCubePosition = { x: centralCubePosition.x - 1, y: centralCubePosition.y - 1}
          store.commit(MUTATIONS.SET_NUMBER, {position: {x: x, y: y}, number: OBJECTS.ATTACHED_CUBE})
          queue.push({x: x, y: y})
          store.dispatch('cube/addPiece', {x: x - centralCubePosition.x, y: y - centralCubePosition.y}, { root: true })
    }
  }
}