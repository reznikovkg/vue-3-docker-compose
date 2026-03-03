const GRID_SIZE = 8
const INITIAL_ITEMS_COUNT = 7
const STORAGE_KEY = 'puzzleGameState'

const ITEM_ICONS = ['🌱', '🌿', '🍀', '🌳', '🌲', '🏔️', '🌋', '⭐', '💎', '👑']

const SPAWN_PROBABILITIES = [
{ level: 1, probability: 0.70 },  
{ level: 2, probability: 0.20 }, 
{ level: 3, probability: 0.10 }   
]

const state = () => ({
gridSize: GRID_SIZE,
grid: Array(GRID_SIZE * GRID_SIZE).fill(null),
score: 0,
moves: 0,
gameOver: false,
message: '',
messageType: 'info',
itemIcons: ITEM_ICONS,
spawnProbabilities: SPAWN_PROBABILITIES
})

const getters = {

isFull: (state) => {
    return state.grid.every(cell => cell !== null)
},

emptyCells: (state) => {
    return state.grid
      .map((cell, index) => cell === null ? index : null)
      .filter(index => index !== null)
},

getItemIcon: (state) => (level) => {
    return state.itemIcons[Math.min(level - 1, state.itemIcons.length - 1)]
},

getCell: (state) => (index) => {
    return state.grid[index]
},

gameStats: (state) => {
    return {
      score: state.score,
      moves: state.moves,
      occupiedCells: state.grid.filter(cell => cell !== null).length,
      totalCells: state.grid.length
    }
}
}

const mutations = {

SET_CELL(state, { index, value }) {
    state.grid[index] = value
},

CLEAR_CELL(state, index) {
    state.grid[index] = null
},

SET_GRID(state, grid) {
    state.grid = grid
},

ADD_SCORE(state, points) {
    state.score += points
},

SET_SCORE(state, score) {
    state.score = score
},

INCREMENT_MOVES(state) {
    state.moves++
},

SET_MOVES(state, moves) {
    state.moves = moves
},

SET_GAME_OVER(state, value) {
    state.gameOver = value
},

SET_MESSAGE(state, { text, type }) {
    state.message = text
    state.messageType = type
},

CLEAR_MESSAGE(state) {
    state.message = ''
    state.messageType = 'info'
},

SET_CELL_NEW(state, { index, isNew }) {
    if (state.grid[index]) {
      state.grid[index].isNew = isNew
    }
},

RESET_GAME(state) {
    state.grid = Array(GRID_SIZE * GRID_SIZE).fill(null)
    state.score = 0
    state.moves = 0
    state.gameOver = false
    state.message = ''
    state.messageType = 'info'
}
}

const actions = {
initGame({ commit, dispatch }) {
    commit('RESET_GAME')
    
    for (let i = 0; i < INITIAL_ITEMS_COUNT; i++) {
      dispatch('addRandomItem', { countAsMove: false, showAnimation: false })
    }
    
    dispatch('saveGame')
},

addRandomItem({ state, commit, getters, dispatch }, { countAsMove = true, showAnimation = true } = {}) {
    const emptyCells = getters.emptyCells

    if (emptyCells.length === 0) {
      if (countAsMove) {
        commit('SET_GAME_OVER', true)
        dispatch('showMessage', { text: 'Игра окончена! Нет свободных ячеек!', type: 'error' })
      }
      return false
    }

    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    
    const rand = Math.random()
    let randomLevel = 1
    let cumulativeProbability = 0

    for (const config of state.spawnProbabilities) {
      cumulativeProbability += config.probability
      if (rand < cumulativeProbability) {
        randomLevel = config.level
        break
      }
    }

    commit('SET_CELL', {
      index: randomIndex,
      value: {
        level: randomLevel,
        isNew: showAnimation
      }
    })

    if (showAnimation) {
      setTimeout(() => {
        commit('SET_CELL_NEW', { index: randomIndex, isNew: false })
      }, 500)
    }

    dispatch('saveGame')
    return true
},

mergeItems({ state, commit, getters, dispatch }, { fromIndex, toIndex }) {
    const fromItem = getters.getCell(fromIndex)
    const toItem = getters.getCell(toIndex)

    if (toItem === null) {
      commit('SET_CELL', { index: toIndex, value: fromItem })
      commit('CLEAR_CELL', fromIndex)
      commit('INCREMENT_MOVES')
      
      dispatch('showMessage', { text: 'Предмет перемещен', type: 'info' })
      
      setTimeout(() => {
        const added = dispatch('addRandomItem', { countAsMove: false, showAnimation: true })
        if (added) {
          dispatch('showMessage', { text: 'Появился новый предмет!', type: 'success' })
        }
      }, 300)
      
      dispatch('saveGame')
      return true
    }

    if (fromItem.level === toItem.level) {
      const newLevel = toItem.level + 1
      
      commit('SET_CELL', {
        index: toIndex,
        value: { level: newLevel, isNew: false }
      })
      commit('CLEAR_CELL', fromIndex)

      const points = Math.pow(2, newLevel) * 10
      commit('ADD_SCORE', points)
      commit('INCREMENT_MOVES')

      dispatch('showMessage', { 
        text: `+${points} очков! Уровень ${newLevel}!`, 
        type: 'success' 
      })

      setTimeout(() => {
        const added = dispatch('addRandomItem', { countAsMove: false, showAnimation: true })
        if (added) {
          dispatch('showMessage', { text: 'Появился новый предмет!', type: 'success' })
        }
      }, 300)
      
      dispatch('saveGame')
      return true
    } else {
      dispatch('showMessage', { 
        text: 'Можно объединять только одинаковые предметы!', 
        type: 'warning' 
      })
      return false
    }
},

showMessage({ commit }, { text, type = 'info' }) {
    commit('SET_MESSAGE', { text, type })
    
    setTimeout(() => {
      commit('CLEAR_MESSAGE')
    }, 2000)
},

saveGame({ state }) {
    const gameState = {
      grid: state.grid.map(cell => {
        if (cell === null) return null
        return { level: cell.level } 
      }),
      score: state.score,
      moves: state.moves,
      gameOver: state.gameOver
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState))
    } catch (e) {
      console.error('Ошибка сохранения игры:', e)
    }
},

loadGame({ commit, dispatch }) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      
      if (saved) {
        const gameState = JSON.parse(saved)
        
        commit('SET_GRID', gameState.grid || Array(GRID_SIZE * GRID_SIZE).fill(null))
        commit('SET_SCORE', gameState.score || 0)
        commit('SET_MOVES', gameState.moves || 0)
        commit('SET_GAME_OVER', gameState.gameOver || false)
        
        return true
      }
      
      return false
    } catch (e) {
      console.error('Ошибка загрузки игры:', e)
      return false
    }
},

resetGame({ commit, dispatch }) {
    localStorage.removeItem(STORAGE_KEY)
    dispatch('initGame')
    dispatch('showMessage', { text: 'Новая игра начата!', type: 'success' })
}
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}