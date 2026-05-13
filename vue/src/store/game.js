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
  SET_CURRENT_FIGURE_CELLS: 'SET_CURRENT_FIGURE_CELLS',// установка клеток редактируемой фигуры
  SET_CURRENT_FIGURE_COLOR: 'SET_CURRENT_FIGURE_COLOR',//установка цвета редактируемой фигуры
  ADD_CUSTOM_FIGURE: 'ADD_CUSTOM_FIGURE',//добавление в список моих фигур
  UPDATE_CUSTOM_FIGURE: 'UPDATE_CUSTOM_FIGURE',//обновление фигуры
  REMOVE_CUSTOM_FIGURE: 'REMOVE_CUSTOM_FIGURE',//удаление фигуры
  SET_CUSTOM_FIGURES: 'SET_CUSTOM_FIGURES',//замена списка фигур
  SET_CURRENT_EDITING_FIGURE_ID: 'SET_CURRENT_EDITING_FIGURE_ID',//запоминаем ID фигуры, которую сейчас редактируем
  RESET_CURRENT_FIGURE: 'RESET_CURRENT_FIGURE',//сброс редактора (очистить сетку, сбросить цвет, ID фигуры)
  SET_SELECTED_FIGURES: 'SET_SELECTED_FIGURES',//сохранение выбранных 3 фигур для игры
  SET_EMPTY_FIGURE_CELLS: 'SET_EMPTY_FIGURE_CELLS'//создание пустой матрицы
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
const BASE_FIGURES = [
  {
    id: 'base_single',
    name: 'Квадратик',
    cells: FIGURE_SHAPES[FIGURE_TYPES.SINGLE],
    color: '#333333',
    isBase: true
  },
  {
    id: 'base_stick',
    name: 'Палочка',
    cells: FIGURE_SHAPES[FIGURE_TYPES.STICK],
    color: '#333333',
    isBase: true
  },
  {
    id: 'base_lshape',
    name: 'Уголок',
    cells: FIGURE_SHAPES[FIGURE_TYPES.L_SHAPE],
    color: '#333333',
    isBase: true
  }
]
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
    },
    // Редактор фигур
    customFigures: [],        // пользовательские фигуры
    currentFigureCells: Array(4).fill().map(() => Array(4).fill(false)),  // текущая сетка 4x4
    currentFigureColor: '#333333',  
    currentEditingFigureId: null,   // id фигуры, которую редактируем
    selectedFigures: []
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
    bombs: (state) => state.bombs,
    allFigures: (state) => {
      return [...BASE_FIGURES, ...state.customFigures]
    },
    currentFigureCells: (state) => state.currentFigureCells,
    currentFigureColor: (state) => state.currentFigureColor,
    customFigures: (state) => state.customFigures,
    currentEditingFigureId: (state) => state.currentEditingFigureId,
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
    // Редактор
    [MUTATIONS.SET_CURRENT_FIGURE_CELLS]: (state, cells) => {
      state.currentFigureCells = cells
    },
    [MUTATIONS.SET_CURRENT_FIGURE_COLOR]: (state, color) => {
      state.currentFigureColor = color
    },
    [MUTATIONS.ADD_CUSTOM_FIGURE]: (state, figure) => {
      state.customFigures.push({
        ...figure,
        cells: figure.cells
      })
    },
    [MUTATIONS.UPDATE_CUSTOM_FIGURE]: (state, { id, cells, color }) => {
      const index = state.customFigures.findIndex(f => f.id === id)
      if (index !== -1) {
        state.customFigures[index] = {
          ...state.customFigures[index],
          cells: cells,
          color: color
        }
      }
    },
    [MUTATIONS.REMOVE_CUSTOM_FIGURE]: (state, id) => {
      const index = state.customFigures.findIndex(f => f.id === id)
      if (index !== -1) state.customFigures.splice(index, 1)
    },
    [MUTATIONS.SET_CUSTOM_FIGURES]: (state, figures) => {
      state.customFigures = figures
    },
    [MUTATIONS.SET_CURRENT_EDITING_FIGURE_ID]: (state, id) => {
      state.currentEditingFigureId = id
    },
    [MUTATIONS.RESET_CURRENT_FIGURE]: (state) => {
      state.currentFigureColor = '#333333'
      state.currentEditingFigureId = null
    },
    [MUTATIONS.SET_SELECTED_FIGURES]: (state, figures) => {
      state.selectedFigures = figures
    },
    [MUTATIONS.SET_EMPTY_FIGURE_CELLS]: (state) => {
      state.currentFigureCells = Array(4).fill().map(() => Array(4).fill(false))
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
              const removedCount = state.island.cells.length - 1
              commit(MUTATIONS.SET_ISLAND, [[state.island.baseRow, state.island.baseCol]])
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

      // выбор из выбранных пользователем
      let cells = []
      let color = '#333333'  
      const selected = state.selectedFigures

      if (selected.length === 0) {
        const types = [FIGURE_TYPES.SINGLE, FIGURE_TYPES.STICK, FIGURE_TYPES.L_SHAPE]
        const type = types[Math.floor(Math.random() * types.length)]
        cells = [...FIGURE_SHAPES[type]]
      } else {
        const figure = selected[Math.floor(Math.random() * selected.length)]
        cells = [...figure.cells]  
        color = figure.color  
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
        //type,
        cells,
        color,
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
    },
    toggleCellInCurrentFigure: ({ commit, state }, { row, col }) => {
      const newCells = []
      for (let i = 0; i < state.currentFigureCells.length; i++) {
        const newRow = []
        for (let j = 0; j < state.currentFigureCells[i].length; j++) {
          if (i === row && j === col) {
            newRow.push(!state.currentFigureCells[i][j])
          } else {
            newRow.push(state.currentFigureCells[i][j])
          }
        }
        newCells.push(newRow)
      }
      commit(MUTATIONS.SET_CURRENT_FIGURE_CELLS, newCells)
    },
    saveCurrentFigure: ({ commit, state }) => {
      const isConnected = (grid) => {
        const rows = 4
        const cols = 4

        let startRow = -1
        let startCol = -1

        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            if (grid[i][j]) {
              startRow = i
              startCol = j
              break
            }
          }
          if (startRow !== -1) break
        }

        if (startRow === -1) return false

        const visited = Array(rows).fill().map(() => Array(cols).fill(false))
        const queue = [[startRow, startCol]]

        while (queue.length) {
          const [x, y] = queue.shift()
          if (visited[x][y]) continue
          visited[x][y] = true

          const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]
          for (const [dx, dy] of dirs) {
            const nx = x + dx
            const ny = y + dy
            if (nx >= 0 && nx < rows && ny >= 0 && ny < cols) {
              if (grid[nx][ny] && !visited[nx][ny]) {
                queue.push([nx, ny])
              }
            }
          }
        }

        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            if (grid[i][j] && !visited[i][j]) return false
          }
        }

        return true
      }

      const matrixToCoordinates = (matrix) => {
        const coords = []
        for (let i = 0; i < matrix.length; i++) {
          for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j]) {
              coords.push([i, j])
            }
          }
        }
        return coords
      }

      if (!isConnected(state.currentFigureCells)) {
        alert('Фигура должна быть единым целым')
        return false
      }

      const cellsCoords = matrixToCoordinates(state.currentFigureCells)

      if (state.currentEditingFigureId) {
        commit(MUTATIONS.UPDATE_CUSTOM_FIGURE, {
          id: state.currentEditingFigureId,
          cells: cellsCoords,
          color: state.currentFigureColor
        })
      } else {
        const newFigure = {
          id: Date.now(),
          cells: cellsCoords,
          color: state.currentFigureColor,
          isBase: false,
          selected: false
        }
        commit(MUTATIONS.ADD_CUSTOM_FIGURE, newFigure)
      }

      commit(MUTATIONS.SET_EMPTY_FIGURE_CELLS)
      commit(MUTATIONS.RESET_CURRENT_FIGURE)
      return true
    },
    loadBaseFigureToEditor: ({ commit }, figure) => {
      let cellsList = figure.cells

      //центрирование только для базовых фигур 
      if (figure.isBase && cellsList.length > 0) {
        // найти минимальные координаты
        let minRow = cellsList[0][0]
        let minCol = cellsList[0][1]
        let maxRow = cellsList[0][0]
        let maxCol = cellsList[0][1]

        for (let i = 0; i < cellsList.length; i++) {
          const r = cellsList[i][0]
          const c = cellsList[i][1]
          if (r < minRow) minRow = r
          if (r > maxRow) maxRow = r
          if (c < minCol) minCol = c
          if (c > maxCol) maxCol = c
        }

        const height = maxRow - minRow + 1
        const width = maxCol - minCol + 1
        const offsetRow = Math.floor((4 - height) / 2) - minRow
        const offsetCol = Math.floor((4 - width) / 2) - minCol

        const newCells = []
        for (let i = 0; i < cellsList.length; i++) {
          newCells.push([
            cellsList[i][0] + offsetRow,
            cellsList[i][1] + offsetCol
          ])
        }
        cellsList = newCells
      }

      //преобразуем координаты в матрицу 4×4
      const matrix = Array(4).fill().map(() => Array(4).fill(false))
      for (let i = 0; i < cellsList.length; i++) {
        const row = cellsList[i][0]
        const col = cellsList[i][1]
        if (row >= 0 && row < 4 && col >= 0 && col < 4) {
          matrix[row][col] = true
        }
      }

      commit(MUTATIONS.SET_CURRENT_FIGURE_CELLS, matrix)
      commit(MUTATIONS.SET_CURRENT_FIGURE_COLOR, figure.color)
      commit(MUTATIONS.SET_CURRENT_EDITING_FIGURE_ID, figure.isBase ? null : figure.id)
    },

    resetCurrentFigure: ({ commit }) => {
      commit(MUTATIONS.SET_EMPTY_FIGURE_CELLS)
      commit(MUTATIONS.RESET_CURRENT_FIGURE)
    },

    setSelectedFigures: ({ commit }, figures) => {
      commit(MUTATIONS.SET_SELECTED_FIGURES, figures)
    },

    setCurrentFigureColor: ({ commit }, color) => {
      commit(MUTATIONS.SET_CURRENT_FIGURE_COLOR, color)
    },

    setCustomFigures: ({ commit }, figures) => {
      commit(MUTATIONS.SET_CUSTOM_FIGURES, figures)
    },
    
    removeCustomFigure: ({ commit }, id) => {
      commit(MUTATIONS.REMOVE_CUSTOM_FIGURE, id)
    },
  }
}
