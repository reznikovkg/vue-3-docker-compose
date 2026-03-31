const MUTATIONS = {
  ADD_FIGURE: 'ADD_FIGURE',
  REMOVE_FIGURE: 'REMOVE_FIGURE',
  UPDATE_FIGURE_POSITION:'UPDATE_FIGURE_POSITION',
  SET_GAME_ACTIVE:'SET_GAME_ACTIVE',
  ADD_SCORE:'ADD_SCORE',
  RESET_GAME:'RESET_GAME',
  SET_SPAWN_INTERVAL: 'SET_SPAWN_INTERVAL',
  SET_FIGURE_SPEED: 'SET_FIGURE_SPEED',
  SET_HIGH_SCORE: 'SET_HIGH_SCORE',
  SET_BEST_TIME: 'SET_BEST_TIME',
  SET_SPEED_BOOST_NEXT: 'SET_SPEED_BOOST_NEXT'
}

export default {
  namespaced: true,
  state () {
    return {
      figures: [],
      isGameActive: true,
      score: 0,
      figureSpeed: 1,
      lastSpawnSide: undefined,
      highScore: parseInt(localStorage.getItem('islandHighScore')??'0', 10) || 0,
      bestTime: parseInt(localStorage.getItem('islandBestTime')??'0', 10) || 0,
      speedBoostNextFigure: false
    }
  },
  getters: {
    getFigures: (state) => state.figures,
    isGameActive: (state) => state.isGameActive,
    getScore: (state) => state.score,
    getSpawnInterval: (state) => state.spawnInterval,
    getFiguresCount: (state) => state.figures.length,
  },
  mutations: {
    [MUTATIONS.ADD_FIGURE]: (state, payload) => {
      state.figures.push(payload)
    },
    [MUTATIONS.REMOVE_FIGURE]: (state, payload) => {
      state.figures = state.figures.filter(figure => figure.id !== payload)
    },
    [MUTATIONS.UPDATE_FIGURE_POSITION]: (state, {id, row, col}) => {
      const figure = state.figures.find(f => f.id === id)
      if (figure){
        figure.row = row,
        figure.col = col
      }
    },
    [MUTATIONS.SET_GAME_ACTIVE]: (state, payload) => {
      state.isGameActive = payload
    },
    [MUTATIONS.ADD_SCORE]: (state, payload) => {
      state.score += payload
    },
    [MUTATIONS.RESET_GAME]: (state, payload) => {
      state.figures = [],
      state.isGameActive = false,
      state.score = 0
    },
    [MUTATIONS.SET_SPAWN_INTERVAL]: (state, payload) => {
      state.spawnInterval = payload
    },
    [MUTATIONS.SET_FIGURE_SPEED]: (state, payload) =>{
      const speed = payload;
      console.log(`Устанавливаем глобальную скорость = ${speed}`);
      state.figureSpeed = speed;
    },
    [MUTATIONS.SET_HIGH_SCORE]: (state, payload) =>{
      state.highScore = payload;
    },
    [MUTATIONS.SET_BEST_TIME]:(state, payload) =>{
      state.bestTime = payload;
    },
    [MUTATIONS.SET_SPEED_BOOST_NEXT]: (state, payload) =>{
      state.speedBoostNextFigure = payload;
      console.log(`Флаг ускорения следующей фигуры = ${payload}`);
    }
  },
  actions: {
    spawnFigure: ({state, commit}, {fieldSize}) => {
      console.log('=== SPAWN_FIGURE START ===')
      console.log('fieldSize:', fieldSize)
      console.log('isGameActive:', state.isGameActive)

      if (!state.isGameActive) return

      let side = Math.floor(Math.random() * 4)
      if (state.lastSpawnSide !== undefined){
        while (side === state.lastSpawnSide){
          side = Math.floor(Math.random() * 4)
        }
      }
      state.lastSpawnSide = side
      let row, col, direction
      switch (side){
        case 0: //вниз
          row = 0
          col = Math.floor(Math.random() * fieldSize)
          direction = 'down'
          break
        case 1://вверх
          row = fieldSize - 1
          col = Math.floor(Math.random() * fieldSize)
          direction = 'up'
          break
        case 2://вправо
          row = Math.floor(Math.random() * fieldSize)
          col = 0
          direction = 'right'
          break
        case 3://влево
          row = Math.floor(Math.random() * fieldSize)
          col = fieldSize - 1
          direction = 'left'
          break
      }
      const speedForThisFigure = state.speedBoostNextFigure ? 2: state.figureSpeed;
      const figure = {
        id: Date.now() + '-' + Math.random(),
        row,
        col,
        direction,
        speed: speedForThisFigure
      }
      if (state.speedBoostNextFigure){
        console.log(`Ускорена ОДНА  следующая фигура (speed = 2)`)
        state.speedBoostNextFigure = false
      }
      console.log(`Created figure from side ${['top', 'bottom', 'left', 'right'][side]}`)
      commit(MUTATIONS.ADD_FIGURE, figure)
      console.log('=== SPAWN_FIGURE END ===')
    },

    moveFigures: ({commit, state}, {fieldSize}) =>{
      return new Promise ((resolve) => {
        console.log('=== MOVE_FIGURES START ===')
        console.log('Figures count:', state.figures.length)
        if (!state.isGameActive) { 
          resolve(); 
          return
        }
        state.figures.forEach(figure => {
          console.log('Moving figure:', figure.id, 'from', figure.row, figure.col)
          let newRow = figure.row
          let newCol = figure.col
          switch(figure.direction){
            case 'up':
              newRow = figure.row - figure.speed
              break
            case 'down':
              newRow = figure.row + figure.speed
              break
            case 'left':
              newCol = figure.col - figure.speed
              break
            case 'right':
              newCol = figure.col + figure.speed
              break
          }
          console.log('New position:', newRow, newCol)
          const isOutBounds = newRow < 0 || newRow >= fieldSize || newCol < 0 || newCol >= fieldSize
          if (isOutBounds){
            console.log('Figure out of bounds, removing')
            commit(MUTATIONS.REMOVE_FIGURE, figure.id)
          }else{
            console.log('Updating position')
            commit(MUTATIONS.UPDATE_FIGURE_POSITION, {id: figure.id, row: newRow, col: newCol})
          }
        })
        console.log('=== MOVE_FIGURES END ===')
        resolve()
      })
    },

    checkCollisions: ({ state, commit }, { islandPosition }) => {
      return new Promise ((resolve) => {
        console.log('=== CHECK_COLLISIONS START === island cells:', islandPosition.length)

        if (!Array.isArray(islandPosition)) {
          console.log('ERROR: islandPosition is not array!')
          resolve([])
          return
        }

        const newCells = []
        const figuresCopy = [...state.figures]

        figuresCopy.forEach(figure => {
          const speed = figure.speed || 1
          let currentRow = figure.row
          let currentCol = figure.col

          for (let step = 1; step <= speed; step++){
            let targetRow = currentRow
            let targetCol = currentCol

            switch (figure.direction) {
              case 'up': targetRow = figure.row - step; break
              case 'down': targetRow = figure.row + step; break
              case 'left': targetCol = figure.col - step; break
              case 'right': targetCol = figure.col + step; break
            }

            const willHitIsland = islandPosition.some(cell =>
              cell.row === targetRow && cell.col === targetCol
            )

            if (willHitIsland) {
              const attachCell = { row: currentRow, col: currentCol }

              const alreadyExists = islandPosition.some(c => c.row === attachCell.row && c.col === attachCell.col) ||
                                    newCells.some(c => c.row === attachCell.row && c.col === attachCell.col)

              if (!alreadyExists) {
                newCells.push(attachCell)
                console.log(` HIT! Attaching at (${attachCell.row}, ${attachCell.col}) | speed=${speed}, step=${step} from direction ${figure.direction}`)
              }

              commit(MUTATIONS.REMOVE_FIGURE, figure.id)
              break
            }
            currentRow = targetRow
            currentCol = targetCol
          }
        })

        console.log('=== CHECK_COLLISIONS END === added:', newCells.length)
        resolve(newCells)
      })
    },

    startSpawning: ({state, commit, dispatch}, {fieldSize, interval = 2000}) =>{
      console.log('=== START_SPAWNING ===')
      console.log('fieldSize:', fieldSize)
      console.log('interval:', interval)  
      if (state.spawnInterval){
        clearInterval(state.spawnInterval)
      }
      const intervalId = setInterval(() =>{
        console.log('!!! SPAWNING NEW FIGURE !!!')
        dispatch(ACTIONS.SPAWN_FIGURE,{fieldSize})
      }, interval)
      commit(MUTATIONS.SET_SPAWN_INTERVAL, intervalId)
    },

    stopSpawning: ({state, commit}) =>{
      if (state.spawnInterval){
        clearInterval(state.spawnInterval)
        commit(MUTATIONS.SET_SPAWN_INTERVAL, null)
      }
    },

    checkGameOver: ({state, commit}, { islandPosition, fieldSize }) => {
      return new Promise ((resolve) => {
        if (!Array.isArray(islandPosition) || islandPosition.length === 0) {
          resolve(false)
          return
        }
        const isTouchingWall = islandPosition.some(cell =>{
          return (
            cell.row === 0 ||
            cell.row  === fieldSize - 1 ||
            cell.col === 0 ||
            cell.col === fieldSize - 1
          )
        })
        if (isTouchingWall){
          console.log('GAME OVER! Island touched the wall!')
          commit(MUTATIONS.SET_GAME_ACTIVE, false)
          resolve(true)
        }
        resolve(false)
      })
    },

    checkLayers: ({state, commit}, {islandPosition, fieldSize }) => {
      return new Promise ((resolve) => {
        if (!Array.isArray(islandPosition) || islandPosition.length <= 1){
          resolve({cleared: 0, fallen: 0, newIsland: islandPosition, timeBonus: 0});
          return
        } 
        const core = islandPosition[0];
        const centerRow = core.row;
        const centerCol = core.col;

        let newIsland = [...islandPosition];
        let totalScore = 0;
        let clearedCount = 0;
        let fallenCount = 0;
        let timeBonus = 0;

        let maxLayer = 0;
        islandPosition.forEach( cell => {
          const dist = Math.max(
            Math.abs(cell.row - centerRow),
            Math.abs(cell.col - centerCol)
          )
          if (dist > maxLayer) maxLayer = dist;
        })

        for (let layer = 1; layer<= maxLayer; layer++){
          const cellsInLayer = islandPosition.filter( cell =>{
            const dist = Math.max(
              Math.abs(cell.row - centerRow),
              Math.abs(cell.col - centerCol)
            )
            return dist === layer
          })

          const expectedCount = layer === 0 ? 1 : layer * 8

          if (cellsInLayer.length === expectedCount){
            console.log(`Слой ${layer} полностью заполнен! Остров сбрасывается до ядра!`)

            totalScore += cellsInLayer.length * 5;
            clearedCount += cellsInLayer.length;

            const outerCells = islandPosition.filter(cell => {
              const dist = Math.max(
                Math.abs(cell.row - centerRow),
                Math.abs(cell.col - centerCol)
              )
              return dist > layer;
            })

            fallenCount += outerCells.length;
            totalScore += outerCells.length * 1;
            timeBonus = 60;

            newIsland = [{ row: centerRow, col: centerCol}];
            commit(MUTATIONS.ADD_SCORE, totalScore);
            console.log(`+${cellsInLayer.length * 5} (слой) + ${outerCells.length * 1} (отвалившиеся) | +60 сек к таймеру`)
            break;
          }
        }
        resolve({
          cleared: clearedCount,
          fallen: fallenCount,
          newIsland: newIsland,
          timeBonus: timeBonus
        })
      })
    },

    setSpeed: ({state, commit}, speed = 2) => {
      console.log(`Запрошено ускорение фигур до speed = ${speed}`);
      commit(MUTATIONS.SET_FIGURE_SPEED, speed);
    },

    setHighScore: ({state, commit}, score) =>{
      if (score > state.highScore){
        commit(MUTATIONS.SET_HIGH_SCORE, score);
        localStorage.setItem('islandHighScore', score);
      }
    },

    setBestTime: ({state, commit}, time) =>{
      if (time > state.bestTime){
        commit(MUTATIONS.SET_BEST_TIME, time);
        localStorage.setItem('islandBestTime', time);
      }
    },

    setSpeedBoostNext: ({state, commit}, value) =>{
      commit(MUTATIONS.SET_SPEED_BOOST_NEXT, value);
    },

    setGameActive: ({state, commit}, payload) =>{
      commit(MUTATIONS.SET_GAME_ACTIVE, payload);
    },

    resetGame: ({state, commit}) =>{
      commit(MUTATIONS.RESET_GAME);
    }
  }
}