const MUTATIONS = {
  SET_ISLAND: 'SET_ISLAND', //обновить все клетки острова
  SET_FIGURE: 'SET_FIGURE', //обновить позицию летящей фигуры
  ATTACH_FIGURE: 'ATTACH_FIGURE', //прикрепление фигуры к острову
  SET_LAST_SIDE: 'SET_LAST_SIDE', //последняя сторона вылета фигуры
  ADD_SCORE: 'ADD_SCORE', //добавление очков
  SET_SPEED_BOOST: 'SET_SPEED_BOOST', //ускорение фигуры
  SET_TIME: 'SET_TIME', //обновление таймера
  SET_BASE_POSITION: 'SET_BASE_POSITION', //обновление координат базовой клетки
  RESET_GAME: 'RESET_GAME' //сброс игры
}

export default {
  namespaced: true,
  state: {
    gridSize: 7, //размер поля
    island: {
      cells: [[3, 3]], //клетки острова
      baseRow: 3, //ряд базовой клетки
      baseCol: 3  //столбец базовой клетки
    },
    figure: {
      row: -1,
      col: -1,
      direction: null
    },
    lastSide: -1,
    score: 0,
    speedBoost: false,
    timeLeft: 60
  },
  getters: {
    islandCells: (state) => state.island.cells,
    baseRow: (state) => state.island.baseRow,
    baseCol: (state) => state.island.baseCol,
    figureRow: (state) => state.figure.row,
    figureCol: (state) => state.figure.col,
    figureDirection: (state) => state.figure.direction,
    lastSide: (state) => state.lastSide,
    gridSize: (state) => state.gridSize,
    score: (state) => state.score,
    speedBoost: (state) => state.speedBoost,
    figureSpeed: (state) => state.speedBoost ? 300 : 1000,
    timeLeft: (state) => state.timeLeft
  },
  mutations: {
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
      }
      state.figure = {
        row: -1,
        col: -1,
        direction: null
      }
      state.lastSide = -1
      state.score = 0
      state.speedBoost = false
      state.timeLeft = 60
    }
  },
  actions: {
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
    //создание новой фигуры
    spawnFigure: ({ commit, state }) => {
      let side
      do {
        side = Math.floor(Math.random() * 4)
      } while (side === state.lastSide && state.lastSide !== -1)
      
      commit(MUTATIONS.SET_LAST_SIDE, side)
      
      let row, col, direction
      
      switch(side) {
        case 0:
          row = 0
          col = Math.floor(Math.random() * state.gridSize)
          direction = 'down'
          break
        case 1:
          row = state.gridSize - 1
          col = Math.floor(Math.random() * state.gridSize)
          direction = 'up'
          break
        case 2:
          row = Math.floor(Math.random() * state.gridSize)
          col = 0
          direction = 'right'
          break
        case 3:
          row = Math.floor(Math.random() * state.gridSize)
          col = state.gridSize - 1
          direction = 'left'
          break
      }
      commit(MUTATIONS.SET_FIGURE, { row, col, direction })
      //если было ускорение - сбрасываем (тк на 1 фигуру действует)
      if (state.speedBoost) {
        commit(MUTATIONS.SET_SPEED_BOOST, false)
      }
    },
    //движение летящей фигуры
    moveFigure: ({ commit, state, dispatch }) => {
      if (state.figure.row === -1) {
        dispatch('spawnFigure')
        return
      }
      
      const currentRow = state.figure.row
      const currentCol = state.figure.col
      
      let nextRow = currentRow
      let nextCol = currentCol
      
      if (state.figure.direction === 'down') nextRow++
      else if (state.figure.direction === 'up') nextRow--
      else if (state.figure.direction === 'right') nextCol++
      else if (state.figure.direction === 'left') nextCol--
      
      const islandAhead = state.island.cells.some(cell => 
        cell[0] === nextRow && cell[1] === nextCol
      )
      
      if (islandAhead) {
        commit(MUTATIONS.ATTACH_FIGURE, { row: currentRow, col: currentCol })
        commit(MUTATIONS.SET_FIGURE, { row: -1, col: -1, direction: null })
        dispatch('checkLayer')
        return
      }
      //проверка границ
      if (nextRow < 0 || nextRow >= state.gridSize || nextCol < 0 || nextCol >= state.gridSize) {
        commit(MUTATIONS.SET_FIGURE, { row: -1, col: -1, direction: null })
        return
      }
      commit(MUTATIONS.SET_FIGURE, { row: nextRow, col: nextCol, direction: state.figure.direction })
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
        //если слой заполнился начисляем очки и увеличиваем время
        if (layerCells > 0) commit(MUTATIONS.ADD_SCORE, layerCells * 5)
        if (otherCells > 0) commit(MUTATIONS.ADD_SCORE, otherCells)
        
        commit(MUTATIONS.SET_TIME, state.timeLeft + 60)
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
