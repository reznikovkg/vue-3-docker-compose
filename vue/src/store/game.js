const MUTATIONS = {
  SET_ISLAND: 'SET_ISLAND', //обновить все клетки острова
  SET_FIGURE: 'SET_FIGURE', //обновить позицию летящей фигуры
  ATTACH_FIGURE: 'ATTACH_FIGURE', //прикрепление фигуры к острову
  SET_LAST_SIDE: 'SET_LAST_SIDE', //последняя сторона вылета фигуры
  ADD_SCORE: 'ADD_SCORE', //добавление очков
  SET_SPEED_BOOST: 'SET_SPEED_BOOST', //ускорение фигуры
  SET_TIME: 'SET_TIME', //обновление таймера
  SET_BASE_POSITION: 'SET_BASE_POSITION', //обновление координат базовой клетки
  SET_GAME_MODE: 'SET_GAME_MODE', //установка режима игры
  INCREMENT_FIGURES_SPAWNED: 'INCREMENT_FIGURES_SPAWNED', //счетчик появившихся объектов
  SET_CURRENT_SPEED: 'SET_CURRENT_SPEED', //текущая скорость
  RESET_SPEED: 'RESET_SPEED', //сброс скорости
  RESET_GAME: 'RESET_GAME', //сброс игры,
  RESET_FIGURE: 'RESET_FIGURE', //сброс фигуры
  ADD_BOMB: 'ADD_BOMB', //добавить бомбу
  REMOVE_BOMB: 'REMOVE_BOMB', //удалить бомбу
}
const FIGURE_TYPES = {
  SINGLE: 'SINGLE',      // одна клетка 
  STICK: 'STICK',        // палочка из 3 клеток
  L_SHAPE: 'L_SHAPE'     // уголок из 3 клеток
}
const FIGURE_SHAPES = {
  [FIGURE_TYPES.SINGLE]: [[0, 0]],
  [FIGURE_TYPES.STICK]: [[0, 0], [1, 0], [2, 0]],      
  [FIGURE_TYPES.L_SHAPE]: [[0, 0], [0, 1], [1, 0]]     
}
export default {
  namespaced: true,
  state: {
    gridSize: 11, //размер поля
    gameMode: 'normal',  
    baseSpeed: 1000,
    currentSpeed: 1000,
    speedIncreaseStep: 100,
    figuresSpawned: 0,
    figuresPerSpeedUp: 2,
    minSpeed: 200,
    island: {
      cells: [[5, 5]], //клетки острова
      baseRow: 5, //ряд базовой клетки
      baseCol: 5  //столбец базовой клетки
    },
    figure: {
      type: null,
      cells: [],
      position: {
        row: -1,
        col: -1
      },
      direction: null
    },
    lastSide: -1,
    score: 0,
    speedBoost: false,
    timeLeft: 60,
    bombs: {
      black: [],   // чёрные бомбы (сбрасывают остров)
      red: [],     // красные бомбы (-30 секунд)
      green: []    // зелёные бонусы (+10 секунд)
    }
  },
  getters: {
    islandCells: (state) => state.island.cells,
    baseRow: (state) => state.island.baseRow,
    baseCol: (state) => state.island.baseCol,
    currentFigure: (state) => {
      if (state.figure.position.row === -1) return null
      return state.figure
    },
    lastSide: (state) => state.lastSide,
    gridSize: (state) => state.gridSize,
    score: (state) => state.score,
    speedBoost: (state) => state.speedBoost,
    timeLeft: (state) => state.timeLeft,
    figureSpeed: (state) => {
      if (state.speedBoost) return 300
      if (state.gameMode === 'speed') return state.currentSpeed
      return state.baseSpeed
    },
    bombs: (state) => state.bombs 
  },
  mutations: {
    [MUTATIONS.SET_GAME_MODE]: (state, mode) => {
      state.gameMode = mode
    },

    [MUTATIONS.INCREMENT_FIGURES_SPAWNED]: (state) => {
      state.figuresSpawned++
    },

    [MUTATIONS.SET_CURRENT_SPEED]: (state, speed) => {
      state.currentSpeed = speed
    },

    [MUTATIONS.RESET_SPEED]: (state) => {
      state.currentSpeed = state.baseSpeed
      state.figuresSpawned = 0
      state.bombs = { black: [], red: [], green: [] }
    },
    [MUTATIONS.RESET_FIGURE]: (state) => {
      state.figure = {
        type: null,
        cells: [],
        position: { row: -1, col: -1 },
        direction: null
      }
    },
    [MUTATIONS.SET_ISLAND]: (state, cells) => {
      state.island.cells = cells
    },
    [MUTATIONS.SET_FIGURE]: (state, figure) => {
      state.figure = figure
    },
    [MUTATIONS.ATTACH_FIGURE]: (state, position) => {
      state.island.cells.push([position.row, position.col])
    },
    [MUTATIONS.SET_LAST_SIDE]: (state, side) => {
      state.lastSide = side
    },
    [MUTATIONS.ADD_SCORE]: (state, points) => {
      state.score += points
    },
    [MUTATIONS.SET_SPEED_BOOST]: (state, active) => {
      state.speedBoost = active
    },
    [MUTATIONS.SET_TIME]: (state, time) => {
      state.timeLeft = time
    },
    [MUTATIONS.SET_BASE_POSITION]: (state, { row, col }) => {
      state.island.baseRow = row
      state.island.baseCol = col
    },
    [MUTATIONS.RESET_GAME]: (state) => {
      const center = Math.floor(state.gridSize / 2)
      state.island = {
        cells: [[center, center]],
        baseRow: center,
        baseCol: center
      },
      state.figure = {
        type: null,
        cells: [],
        position: {
          row: -1,
          col: -1
        },
        direction: null
      },
      state.lastSide = -1
      state.score = 0
      state.speedBoost = false
      state.timeLeft = 60
      state.bombs = { black: [], red: [], green: [] }
    },
    [MUTATIONS.ADD_BOMB]: (state, { type, bomb }) => {
      state.bombs[type].push(bomb)
    },
    [MUTATIONS.REMOVE_BOMB]: (state, { type, index }) => {
      state.bombs[type].splice(index, 1)
    },
  },
  actions: {
    setGameMode: ({ commit }, mode) => {
      commit(MUTATIONS.SET_GAME_MODE, mode)
    },
    //перемещение острова по стрелочкам
    moveIsland: ({ commit, state }, direction) => {
      const oldRow = state.island.baseRow
      const oldCol = state.island.baseCol
      
      let newRow = oldRow
      let newCol = oldCol
      
      if (direction === 'up') newRow--
      if (direction === 'down') newRow++
      if (direction === 'left') newCol--
      if (direction === 'right') newCol++
      
      const deltaRow = newRow - oldRow
      const deltaCol = newCol - oldCol
      
      const willCollide = state.island.cells.some(cell => {
        const newCellRow = cell[0] + deltaRow
        const newCellCol = cell[1] + deltaCol
        return newCellRow < 0 || newCellRow >= state.gridSize || 
               newCellCol < 0 || newCellCol >= state.gridSize
      })
      
      if (willCollide) {
        alert('Game Over! Набрано очков: ' + state.score)
        commit(MUTATIONS.RESET_GAME)
        return
      }
      
      const newCells = state.island.cells.map(cell => [
        cell[0] + deltaRow,
        cell[1] + deltaCol
      ])
      
      commit(MUTATIONS.SET_ISLAND, newCells)
      commit(MUTATIONS.SET_BASE_POSITION, { row: newRow, col: newCol })
    },
    //создание бомбы
    createBomb({ commit }, { type, row, col, direction }) {
      commit(MUTATIONS.ADD_BOMB, {
        type,
        bomb: { row, col, direction, type }
      })
    },
    //движение бомбы
    moveBombs: ({ commit, state }) => {
      const bombTypes = ['black', 'red', 'green']

      for (const type of bombTypes) {
        for (let i = 0; i < state.bombs[type].length; i++) {
          const bomb = state.bombs[type][i]

          const oldRow = bomb.row
          const oldCol = bomb.col

          let newRow = oldRow
          let newCol = oldCol

          if (bomb.direction === 'down') newRow++
          else if (bomb.direction === 'up') newRow--
          else if (bomb.direction === 'right') newCol++
          else if (bomb.direction === 'left') newCol--

          // проверка столкновения с островом
          const hitIsland = state.island.cells.some(cell =>
            cell[0] === newRow && cell[1] === newCol
          )

          if (hitIsland) {
            if (type === 'black') {
              // чёрная: сбрасываем остров до одной клетки
              const baseOnly = [[state.island.baseRow, state.island.baseCol]]
              const removedCount = state.island.cells.length - 1
              commit(MUTATIONS.SET_ISLAND, baseOnly)
              commit(MUTATIONS.ADD_SCORE, -removedCount * 5)
            }
            else if (type === 'red') {
              // красная: минус 30 секунд
              const newTime = Math.max(0, state.timeLeft - 30)
              commit(MUTATIONS.SET_TIME, newTime)
            }
            else if (type === 'green') {
              // зелёная: плюс 10 секунд
              commit(MUTATIONS.SET_TIME, state.timeLeft + 10)
            }

            commit(MUTATIONS.REMOVE_BOMB, { type, index: i })
            i-- 
            continue
          }

          // проверка выхода за границы
          if (newRow < 0 || newRow >= state.gridSize ||
            newCol < 0 || newCol >= state.gridSize) {
            commit(MUTATIONS.REMOVE_BOMB, { type, index: i })
            i--
            continue
          }

          // обновляем позицию бомбы
          state.bombs[type][i].row = newRow
          state.bombs[type][i].col = newCol
        }
      }
    },
    //создание новой фигуры
    spawnFigure: ({ commit, state, dispatch }) => {
      let side
      do {
        side = Math.floor(Math.random() * 4)
      }   while (side === state.lastSide && state.lastSide !== -1)
  
      commit(MUTATIONS.SET_LAST_SIDE, side)
  
      // выбираем случайный тип фигуры
      const types = [FIGURE_TYPES.SINGLE, FIGURE_TYPES.STICK, FIGURE_TYPES.L_SHAPE]
      const type = types[Math.floor(Math.random() * types.length)]

      let cells = [...FIGURE_SHAPES[type]]

      if (type === FIGURE_TYPES.STICK) {
        switch (side) {
          case 2: // вылет слева - горизонтально
            cells = [[0, 0], [0, 1], [0, 2]]
            break
          case 3: // вылет справа - горизонтально
            cells = [[0, 0], [0, -1], [0, -2]]
            break
        }
      }
  
      let row, col, direction
  
      switch(side) {
        case 0: // сверху
          row = 0
          col = Math.floor(Math.random() * state.gridSize)
          direction = 'down'
          break
        case 1: // снизу
          row = state.gridSize - 1
          col = Math.floor(Math.random() * state.gridSize)
          direction = 'up'
          break
        case 2: // слева
          row = Math.floor(Math.random() * state.gridSize)
          col = 0
          direction = 'right'
          break
        case 3: // справа
          row = Math.floor(Math.random() * state.gridSize)
          col = state.gridSize - 1
          direction = 'left'
          break
      }

      // все ли клетки фигуры в пределах поля?
      const allValid = cells.every(offset => {
        const newRow = row + offset[0]
        const newCol = col + offset[1]
        return newRow >= 0 && newRow < state.gridSize &&
          newCol >= 0 && newCol < state.gridSize
      })

      // не касается ли фигура острова?
      const collidesWithIsland = cells.some(offset => {
        const newRow = row + offset[0]
        const newCol = col + offset[1]
        return state.island.cells.some(islandCell =>
          islandCell[0] === newRow && islandCell[1] === newCol
        )
      })

      // если позиция невалидная — пробуем снова
      if (!allValid || collidesWithIsland) {
        dispatch('spawnFigure')
        return
      }
  
      const figure = {
        type,
        cells,
        position: { row, col },
        direction
      }

      if (state.gameMode === 'bomb') {
        commit(MUTATIONS.INCREMENT_FIGURES_SPAWNED)

        // зелёный бонус вылетает каждую 10 фигуру
        if (state.figuresSpawned % 10 === 0) {
          dispatch('createBomb', { type: 'green', row: row, col: col, direction: direction })
          return
        }

        // обычные бомбы (30% шанс)
        const isBomb = Math.random() < 0.3
        if (isBomb) {
          const bombType = Math.random() < 0.5 ? 'black' : 'red'
          dispatch('createBomb', { type: bombType, row: row, col: col, direction: direction })
          return
        }
      }
  
      commit(MUTATIONS.SET_FIGURE, figure)
  
      if (state.speedBoost) {
        commit(MUTATIONS.SET_SPEED_BOOST, false)
      }

      if (state.gameMode === 'speed') {
        commit(MUTATIONS.INCREMENT_FIGURES_SPAWNED)

        if (state.figuresSpawned % state.figuresPerSpeedUp === 0) {
          const newSpeed = Math.max(state.minSpeed, state.currentSpeed - state.speedIncreaseStep)
          commit(MUTATIONS.SET_CURRENT_SPEED, newSpeed)
        }
      }


    },
    //движение летящей фигуры
    moveFigure: ({ commit, state, dispatch }) => {
      // если фигуры нет — создаём
      if (state.figure.position.row === -1) {
        dispatch('spawnFigure')
        return
      }

      const currentPos = state.figure.position
      const cells = state.figure.cells

      // вычисляем следующую позицию для главной клетки
      let nextRow = currentPos.row
      let nextCol = currentPos.col

      if (state.figure.direction === 'down') nextRow++
      else if (state.figure.direction === 'up') nextRow--
      else if (state.figure.direction === 'right') nextCol++
      else if (state.figure.direction === 'left') nextCol--

      // проверяем столкновение с островом (любой клеткой фигуры)
      const willCollide = cells.some(offset => {
        const cellRow = nextRow + offset[0]
        const cellCol = nextCol + offset[1]
        return state.island.cells.some(islandCell =>
          islandCell[0] === cellRow && islandCell[1] === cellCol
        )
      })

      if (willCollide) {
        // прикрепляем все клетки фигуры к острову
        cells.forEach(offset => {
          const attachRow = currentPos.row + offset[0]
          const attachCol = currentPos.col + offset[1]
          commit(MUTATIONS.ATTACH_FIGURE, { row: attachRow, col: attachCol })
        })

        // удаляем фигуру
        commit(MUTATIONS.RESET_FIGURE)

        dispatch('checkLayer')
        return
      }

      // проверяем, не выходят ли клетки за границы
      const allValid = cells.every(offset => {
        const newRow = nextRow + offset[0]
        const newCol = nextCol + offset[1]
        return newRow >= 0 && newRow < state.gridSize && newCol >= 0 && newCol < state.gridSize
      })

      if (!allValid) {
        // штраф: минус 5 очков за пропуск
        commit(MUTATIONS.ADD_SCORE, -5)
        commit(MUTATIONS.RESET_FIGURE)
        return
      }

      // Двигаем фигуру
      commit(MUTATIONS.SET_FIGURE, {
        ...state.figure,
        position: { row: nextRow, col: nextCol }
      })
    },
    //проверка на заполнения слоя вокруг базовой клетки
    checkLayer: ({ commit, state }) => {
      const around = [
        [state.island.baseRow - 1, state.island.baseCol - 1],
        [state.island.baseRow - 1, state.island.baseCol],
        [state.island.baseRow - 1, state.island.baseCol + 1],
        [state.island.baseRow, state.island.baseCol - 1],
        [state.island.baseRow, state.island.baseCol + 1],
        [state.island.baseRow + 1, state.island.baseCol - 1],
        [state.island.baseRow + 1, state.island.baseCol],
        [state.island.baseRow + 1, state.island.baseCol + 1]
      ]

      const allFilled = around.every(pos =>
        state.island.cells.some(cell => cell[0] === pos[0] && cell[1] === pos[1])
      )

      if (allFilled) {
        const cellsBefore = state.island.cells.length
        const baseOnly = 1
        const layerCells = 8
        const otherCells = cellsBefore - baseOnly - layerCells

        // Начисляем очки
        if (layerCells > 0) commit(MUTATIONS.ADD_SCORE, layerCells * 5)
        if (otherCells > 0) commit(MUTATIONS.ADD_SCORE, otherCells)

        // Добавляем время
        commit(MUTATIONS.SET_TIME, state.timeLeft + 60)

        // Оставляем только базовую клетку
        commit(MUTATIONS.SET_ISLAND, [[state.island.baseRow, state.island.baseCol]])
      }
    },
    //активация ускорения
    activateSpeedBoost: ({ commit }) => {
      commit(MUTATIONS.SET_SPEED_BOOST, true)
    },
    consumeSpeedBoost: ({ commit }) => {
      commit(MUTATIONS.SET_SPEED_BOOST, false)
    },
    //поворот на 90 градусов острова
    rotateIsland: ({ commit, state }, direction) => {
      const otherCells = state.island.cells.filter(cell => 
        !(cell[0] === state.island.baseRow && cell[1] === state.island.baseCol)
      )
      
      const rotatedCells = otherCells.map(cell => {
        const relRow = cell[0] - state.island.baseRow
        const relCol = cell[1] - state.island.baseCol
        
        if (direction === 'clockwise') {
          return [
            state.island.baseRow + relCol,
            state.island.baseCol - relRow
          ]
        } else {
          return [
            state.island.baseRow - relCol,
            state.island.baseCol + relRow
          ]
        }
      })
      
      const wouldCollide = rotatedCells.some(cell => 
        cell[0] < 0 || cell[0] >= state.gridSize || 
        cell[1] < 0 || cell[1] >= state.gridSize
      )
      
      if (wouldCollide) {
        alert('Game Over! Остров коснулся границы при повороте. Набрано очков: ' + state.score)
        commit(MUTATIONS.RESET_GAME)  
        return
      }
      
      commit(MUTATIONS.SET_ISLAND, [
        [state.island.baseRow, state.island.baseCol],
        ...rotatedCells
      ])
    },
    //обновление таймера(вызов каждую секунду)
    updateTime: ({ commit, state }) => {
      const newTime = state.timeLeft - 1
      
      if (newTime <= 0) {
        alert('Время вышло! Game Over! Набрано очков: ' + state.score)
        commit(MUTATIONS.RESET_GAME)
      } else {
        commit(MUTATIONS.SET_TIME, newTime)
      }
    }
  }
}
