const MIN_GRID = 6
const MAX_GRID = 10
const COLORS = [
  { color: '#FF4444', bonus: 'bomb' }, // Красный - взрыв 3x3
  { color: '#44FF44', bonus: 'crystal_hunter' }, // Зеленый - кристаллы
  { color: '#4444FF', bonus: 'vertical' }, // Синий - вертикаль
  { color: '#FFFF44', bonus: 'horizontal' }, // Желтый - горизонталь
  { color: '#FF44FF', bonus: 'random' }, // Фиолетовый - случайный бонус
  { color: '#44FFFF', bonus: 'time' } // Голубой - время
]

const BONUS_TYPES = {
  BOMB: 'bomb',
  VERTICAL: 'vertical', 
  HORIZONTAL: 'horizontal',
  RANDOM: 'random',
  TIME: 'time',
  CRYSTAL_HUNTER: 'crystal_hunter'
}

const state = {
  gridSize: 8,
  grid: [],
  selectedCell: null,
  matchedSet: new Set(),
  animatingRevert: false,
  revertIds: null,
  score: 0,
  isProcessing: false,
  level: 1,
  targetScore: 10000,
  timeLeft: 120,
  combo: {
    active: false,
    color: null,
    count: 0,
    multiplier: 1
  },
  crystals: {
    collected: 0,
    total: 0,
    max: 8
  },
  bonuses: [],
  moveCount: 0,
  lastMatchColor: null,
  comboChain: 0
}

const mutations = {
  SET_GRID_SIZE(state, size) {
    state.gridSize = Math.max(MIN_GRID, Math.min(MAX_GRID, size))
  },
  SET_GRID(state, grid) {
    state.grid = JSON.parse(JSON.stringify(grid))
  },
  SET_SELECTED_CELL(state, cell) {
    state.selectedCell = cell
  },
  SET_MATCHED_SET(state, set) {
    state.matchedSet = new Set(set)
  },
  SET_ANIMATING_REVERT(state, value) {
    state.animatingRevert = value
  },
  SET_REVERT_IDS(state, ids) {
    state.revertIds = ids
  },
  SET_IS_PROCESSING(state, value) {
    state.isProcessing = value
  },
  UPDATE_CELL(state, { x, y, updates }) {
    if (state.grid[y] && state.grid[y][x]) {
      state.grid[y][x] = { ...state.grid[y][x], ...updates }
    }
  },
  SWAP_CELLS(state, { cell1, cell2 }) {
    const tempColor = state.grid[cell1.y][cell1.x].color
    const tempBonus = state.grid[cell1.y][cell1.x].bonus
    const tempHasCrystal = state.grid[cell1.y][cell1.x].hasCrystal
    
    state.grid[cell1.y][cell1.x].color = state.grid[cell2.y][cell2.x].color
    state.grid[cell1.y][cell1.x].bonus = state.grid[cell2.y][cell2.x].bonus
    state.grid[cell1.y][cell1.x].hasCrystal = state.grid[cell2.y][cell2.x].hasCrystal
    
    state.grid[cell2.y][cell2.x].color = tempColor
    state.grid[cell2.y][cell2.x].bonus = tempBonus
    state.grid[cell2.y][cell2.x].hasCrystal = tempHasCrystal
  },
  INCREMENT_SCORE(state, points) {
    state.score += points
  },
  RESET_SCORE(state) {
    state.score = 0
  },
  SET_COMBO(state, combo) {
    state.combo = { ...state.combo, ...combo }
  },
  RESET_COMBO(state) {
    state.combo = {
      active: false,
      color: null,
      count: 0,
      multiplier: 1
    }
    state.lastMatchColor = null
    state.comboChain = 0
  },
  SET_LAST_MATCH_COLOR(state, color) {
    state.lastMatchColor = color
  },
  INCREMENT_COMBO_CHAIN(state) {
    state.comboChain++
  },
  RESET_COMBO_CHAIN(state) {
    state.comboChain = 0
  },
  ADD_CRYSTAL(state) {
    state.crystals.collected++
  },
  SET_TIME_LEFT(state, time) {
    state.timeLeft = time
  },
  DECREMENT_TIME(state) {
    state.timeLeft = Math.max(0, state.timeLeft - 1)
  },
  ADD_BONUS(state, bonus) {
    state.bonuses.push(bonus)
  },
  REMOVE_BONUS(state, index) {
    state.bonuses.splice(index, 1)
  },
  INCREMENT_MOVE_COUNT(state) {
    state.moveCount++
  },
  RESET_MOVE_COUNT(state) {
    state.moveCount = 0
  }
}

const actions = {
  initializeGame({ commit, getters }) {
    commit('SET_IS_PROCESSING', true)
    
    return new Promise((resolve) => {
      const gridSize = getters.gridSize
      let idCounter = 0
      const newGrid = []
      let crystalCount = 0
      
      for (let y = 0; y < gridSize; y++) {
        const row = []
        for (let x = 0; x < gridSize; x++) {
          const colorInfo = getRandomColor()
          const hasCrystal = crystalCount < getters.crystalsMax && Math.random() < 0.1
          
          if (hasCrystal) crystalCount++
          
          row.push({ 
            id: idCounter++, 
            x, 
            y, 
            color: colorInfo.color,
            bonus: null,
            hasCrystal: hasCrystal
          })
        }
        newGrid.push(row)
      }
      
      commit('SET_GRID', newGrid)
      commit('SET_SELECTED_CELL', null)
      commit('SET_MATCHED_SET', new Set())
      commit('RESET_SCORE')
      commit('RESET_COMBO')
      commit('SET_TIME_LEFT', 120)
      commit('RESET_MOVE_COUNT')
      
      const removeInitialMatches = () => {
        const matches = findMatchesSimple(newGrid)
        if (matches.length === 0) {
          commit('SET_IS_PROCESSING', false)
          resolve()
          return
        }
        
        matches.forEach(match => {
          const availableColors = COLORS.filter(c => c.color !== match.color)
          const newColor = availableColors[Math.floor(Math.random() * availableColors.length)]
          newGrid[match.y][match.x].color = newColor.color
        })
        
        commit('SET_GRID', newGrid)
        setTimeout(removeInitialMatches, 10)
      }
      
      removeInitialMatches()
    })
  },

  selectCell({ commit, getters, dispatch }, cell) {
    if (getters.isProcessing || getters.animatingRevert) return
    
    if (!getters.selectedCell) {
      commit('SET_SELECTED_CELL', cell)
      return
    }
    
    if (getters.selectedCell.id === cell.id) {
      commit('SET_SELECTED_CELL', null)
      return
    }
    
    if (isAdjacent(getters.selectedCell, cell)) {
      const sourceCell = getters.selectedCell
      commit('SET_SELECTED_CELL', null)
      commit('INCREMENT_MOVE_COUNT')
      dispatch('attemptSwap', { sourceCell, targetCell: cell })
    } else {
      commit('SET_SELECTED_CELL', cell)
    }
  },

  attemptSwap({ commit, getters, dispatch }, { sourceCell, targetCell }) {
    if (!sourceCell || !targetCell || getters.isProcessing) return
    
    commit('SET_IS_PROCESSING', true)
    
    const originalSource = { ...getters.grid[sourceCell.y][sourceCell.x] }
    const originalTarget = { ...getters.grid[targetCell.y][targetCell.x] }
    
    commit('SWAP_CELLS', { cell1: sourceCell, cell2: targetCell })
    
    delay(200).then(() => {
      const matches = findMatchesSimple(getters.grid)
      
      if (matches.length === 0) {
        commit('SET_ANIMATING_REVERT', true)
        commit('SET_REVERT_IDS', [sourceCell.id, targetCell.id])
        
        return delay(300).then(() => {
          commit('UPDATE_CELL', { 
            x: sourceCell.x, y: sourceCell.y, 
            updates: originalSource 
          })
          commit('UPDATE_CELL', { 
            x: targetCell.x, y: targetCell.y, 
            updates: originalTarget 
          })
          
          return delay(200)
        }).then(() => {
          commit('SET_ANIMATING_REVERT', false)
          commit('SET_REVERT_IDS', null)
          commit('SET_IS_PROCESSING', false)
        })
      } else {
        return dispatch('processMatches', matches)
      }
    })
  },

  processMatches({ commit, getters, dispatch }, matches) {
    if (matches.length === 0) {
      commit('SET_IS_PROCESSING', false)
      return Promise.resolve()
    }
    
    commit('SET_MATCHED_SET', new Set(matches.map(m => m.id)))
    
    // Обработка комбо
    const mainColor = getMainMatchColor(matches)
    const comboResult = processComboSystem(mainColor, getters.lastMatchColor, getters.comboChain)
    
    if (comboResult.activated) {
      commit('SET_COMBO', comboResult.combo)
      commit('INCREMENT_COMBO_CHAIN')
      // Активируем бонус комбо
      activateComboBonus(comboResult.color, getters.grid, commit)
    }
    
    commit('SET_LAST_MATCH_COLOR', mainColor)
    
    // Обработка бонусов за комбинации
    const bonusResult = processCombinationBonuses(matches, getters.grid)
    
    // Расчет очков
    const basePoints = calculateMatchPoints(matches)
    const crystalMultiplier = matches.some(m => m.hasCrystal) ? 3 : 1
    const comboMultiplier = comboResult.multiplier
    const totalPoints = basePoints * crystalMultiplier * comboMultiplier
    
    commit('INCREMENT_SCORE', totalPoints)
    
    // Добавляем бонусы
    bonusResult.newBonuses.forEach(bonus => {
      commit('ADD_BONUS', bonus)
    })
    
    return delay(500).then(() => {
      const cellsToRemove = [...matches, ...bonusResult.extraCells]
      
      cellsToRemove.forEach(cell => {
        if (cell.hasCrystal) {
          commit('ADD_CRYSTAL')
        }
        commit('UPDATE_CELL', { 
          x: cell.x, y: cell.y, 
          updates: { color: null, bonus: null, hasCrystal: false }
        })
      })
      
      commit('SET_MATCHED_SET', new Set())
      return delay(200)
    }).then(() => {
      return dispatch('applyGravity')
    }).then(() => {
      return dispatch('refillEmptyCells')
    }).then(() => {
      return delay(200)
    }).then(() => {
      const newMatches = findMatchesSimple(getters.grid)
      if (newMatches.length > 0) {
        return dispatch('processMatches', newMatches)
      } else {
        commit('RESET_COMBO')
        commit('SET_IS_PROCESSING', false)
        return Promise.resolve()
      }
    })
  },

  applyGravity({ commit, getters }) {
    return new Promise((resolve) => {
      const gridSize = getters.gridSize
      let moved = true
      
      const gravityStep = () => {
        moved = false
        
        for (let x = 0; x < gridSize; x++) {
          for (let y = gridSize - 1; y > 0; y--) {
            if (!getters.grid[y][x].color && getters.grid[y - 1][x].color) {
              commit('SWAP_CELLS', { 
                cell1: getters.grid[y][x], 
                cell2: getters.grid[y - 1][x] 
              })
              moved = true
            }
          }
        }
        
        if (moved) {
          delay(100).then(gravityStep)
        } else {
          resolve()
        }
      }
      
      gravityStep()
    })
  },

  refillEmptyCells({ commit, getters }) {
    return new Promise((resolve) => {
      const gridSize = getters.gridSize
      
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          if (!getters.grid[y][x].color) {
            const colorInfo = getRandomColor()
            const hasCrystal = getters.crystalsTotal < getters.crystalsMax && 
                             Math.random() < 0.05
            
            commit('UPDATE_CELL', {
              x, y,
              updates: { 
                color: colorInfo.color,
                bonus: null,
                hasCrystal: hasCrystal
              }
            })
          }
        }
      }
      
      delay(100).then(resolve)
    })
  },

  activateBonus({ commit, getters, dispatch }, bonusIndex) {
    const bonus = getters.bonuses[bonusIndex]
    if (!bonus) return
    
    commit('SET_IS_PROCESSING', true)
    
    let cellsToRemove = []
    
    switch (bonus.type) {
      case BONUS_TYPES.BOMB:
        cellsToRemove = getBombCells(bonus.x, bonus.y, getters.grid)
        break
      case BONUS_TYPES.VERTICAL:
        cellsToRemove = getVerticalLine(bonus.x, getters.grid)
        break
      case BONUS_TYPES.HORIZONTAL:
        cellsToRemove = getHorizontalLine(bonus.y, getters.grid)
        break
      case BONUS_TYPES.TIME:
        commit('SET_TIME_LEFT', getters.timeLeft + 30)
        break
      case BONUS_TYPES.CRYSTAL_HUNTER:
        cellsToRemove = getCrystalCells(getters.grid)
        break
      case BONUS_TYPES.RANDOM:
        const randomTypes = [BONUS_TYPES.BOMB, BONUS_TYPES.VERTICAL, BONUS_TYPES.HORIZONTAL]
        const randomType = randomTypes[Math.floor(Math.random() * randomTypes.length)]
        bonus.type = randomType
        return dispatch('activateBonus', bonusIndex)
    }
    
    commit('REMOVE_BONUS', bonusIndex)
    
    if (cellsToRemove.length > 0) {
      commit('SET_MATCHED_SET', new Set(cellsToRemove.map(c => c.id)))
      
      delay(500).then(() => {
        cellsToRemove.forEach(cell => {
          if (cell.hasCrystal) {
            commit('ADD_CRYSTAL')
          }
          commit('UPDATE_CELL', { 
            x: cell.x, y: cell.y, 
            updates: { color: null, bonus: null, hasCrystal: false }
          })
        })
        
        commit('SET_MATCHED_SET', new Set())
        return delay(200)
      }).then(() => {
        return dispatch('applyGravity')
      }).then(() => {
        return dispatch('refillEmptyCells')
      }).then(() => {
        commit('SET_IS_PROCESSING', false)
      })
    } else {
      commit('SET_IS_PROCESSING', false)
    }
  },

  updateTimer({ commit, getters }) {
    if (getters.timeLeft > 0) {
      commit('DECREMENT_TIME')
    }
  }
}

// Вспомогательные функции (стрелочные)
const getRandomColor = () => {
  return COLORS[Math.floor(Math.random() * COLORS.length)]
}

const isAdjacent = (cell1, cell2) => {
  if (!cell1 || !cell2) return false
  const dx = Math.abs(cell1.x - cell2.x)
  const dy = Math.abs(cell1.y - cell2.y)
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1)
}

const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const findMatchesSimple = (grid) => {
  const matches = new Set()
  const gridSize = grid.length

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x <= gridSize - 3; x++) {
      const color = grid[y][x].color
      if (!color) continue
      
      if (grid[y][x + 1].color === color && 
          grid[y][x + 2].color === color) {
        matches.add(grid[y][x])
        matches.add(grid[y][x + 1])
        matches.add(grid[y][x + 2])
        
        for (let i = x + 3; i < gridSize; i++) {
          if (grid[y][i].color === color) {
            matches.add(grid[y][i])
          } else {
            break
          }
        }
      }
    }
  }

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y <= gridSize - 3; y++) {
      const color = grid[y][x].color
      if (!color) continue
      
      if (grid[y + 1][x].color === color && 
          grid[y + 2][x].color === color) {
        matches.add(grid[y][x])
        matches.add(grid[y + 1][x])
        matches.add(grid[y + 2][x])
        
        for (let i = y + 3; i < gridSize; i++) {
          if (grid[i][x].color === color) {
            matches.add(grid[i][x])
          } else {
            break
          }
        }
      }
    }
  }

  return Array.from(matches)
}

const calculateMatchPoints = (matches) => {
  const colorGroups = {}
  
  matches.forEach(cell => {
    if (!colorGroups[cell.color]) {
      colorGroups[cell.color] = []
    }
    colorGroups[cell.color].push(cell)
  })
  
  let totalPoints = 0
  
  Object.values(colorGroups).forEach(group => {
    const count = group.length
    let points = 0
    
    if (count === 3) points = 30
    else if (count === 4) points = 60
    else if (count === 5) points = 120
    else if (count >= 6) points = 120 + (count - 5) * 50
    
    totalPoints += points
  })
  
  return totalPoints
}

const getMainMatchColor = (matches) => {
  const colorCount = {}
  matches.forEach(cell => {
    colorCount[cell.color] = (colorCount[cell.color] || 0) + 1
  })
  
  return Object.keys(colorCount).reduce((a, b) => 
    colorCount[a] > colorCount[b] ? a : b
  )
}

const processComboSystem = (currentColor, lastColor, comboChain) => {
  if (lastColor && currentColor === lastColor) {
    // Продолжение комбо
    const newChain = comboChain + 1
    const multiplier = 1 + (newChain * 0.5)
    
    return {
      activated: true,
      color: currentColor,
      multiplier: multiplier,
      combo: {
        active: true,
        color: currentColor,
        count: newChain,
        multiplier: multiplier
      }
    }
  } else if (comboChain >= 2) {
    // Новое комбо после цепочки
    return {
      activated: true,
      color: currentColor,
      multiplier: 1.5,
      combo: {
        active: true,
        color: currentColor,
        count: 1,
        multiplier: 1.5
      }
    }
  }
  
  return {
    activated: false,
    color: currentColor,
    multiplier: 1,
    combo: {
      active: false,
      color: null,
      count: 0,
      multiplier: 1
    }
  }
}

const activateComboBonus = (color, grid, commit) => {
  const colorInfo = COLORS.find(c => c.color === color)
  if (!colorInfo) return
  
  let cellsToRemove = []
  
  switch (colorInfo.bonus) {
    case BONUS_TYPES.BOMB:
      // Случайный взрыв 3x3
      const randomX = Math.floor(Math.random() * grid[0].length)
      const randomY = Math.floor(Math.random() * grid.length)
      cellsToRemove = getBombCells(randomX, randomY, grid)
      break
    case BONUS_TYPES.VERTICAL:
      // Взрыв по вертикали
      const randomCol = Math.floor(Math.random() * grid[0].length)
      cellsToRemove = getVerticalLine(randomCol, grid)
      break
    case BONUS_TYPES.HORIZONTAL:
      // Взрыв по горизонтали
      const randomRow = Math.floor(Math.random() * grid.length)
      cellsToRemove = getHorizontalLine(randomRow, grid)
      break
    case BONUS_TYPES.RANDOM:
      // Случайный бонус
      const bonusTypes = [BONUS_TYPES.BOMB, BONUS_TYPES.VERTICAL, BONUS_TYPES.HORIZONTAL, BONUS_TYPES.TIME]
      const randomBonus = bonusTypes[Math.floor(Math.random() * bonusTypes.length)]
      commit('ADD_BONUS', {
        type: randomBonus,
        x: Math.floor(Math.random() * grid[0].length),
        y: Math.floor(Math.random() * grid.length)
      })
      break
    case BONUS_TYPES.CRYSTAL_HUNTER:
      // Уничтожение кристаллов
      cellsToRemove = getCrystalCells(grid)
      break
    case BONUS_TYPES.TIME:
      // Добавление времени
      commit('SET_TIME_LEFT', 30) // Добавляем 30 секунд
      break
  }
  
  // Удаляем клетки от бонуса комбо
  cellsToRemove.forEach(cell => {
    commit('UPDATE_CELL', { 
      x: cell.x, y: cell.y, 
      updates: { color: null, bonus: null, hasCrystal: false }
    })
  })
}

const processCombinationBonuses = (matches, grid) => {
  const newBonuses = []
  const extraCells = []
  
  // Создаем бонусы за комбинации 4+ в ряд
  matches.forEach(cell => {
    const horizontalCount = countHorizontalMatches(cell, grid)
    const verticalCount = countVerticalMatches(cell, grid)
    
    if (horizontalCount >= 4 || verticalCount >= 4) {
      // Случайный бонус с вероятностью 30%
      if (Math.random() < 0.3) {
        const bonusTypes = [BONUS_TYPES.BOMB, BONUS_TYPES.VERTICAL, BONUS_TYPES.HORIZONTAL]
        const randomBonus = bonusTypes[Math.floor(Math.random() * bonusTypes.length)]
        
        newBonuses.push({
          type: randomBonus,
          x: cell.x,
          y: cell.y
        })
      }
    }
  })
  
  return { newBonuses, extraCells }
}

const countHorizontalMatches = (cell, grid) => {
  let count = 1
  const color = cell.color
  const x = cell.x
  const y = cell.y
  
  for (let i = x - 1; i >= 0; i--) {
    if (grid[y][i].color === color) count++
    else break
  }
  
  for (let i = x + 1; i < grid.length; i++) {
    if (grid[y][i].color === color) count++
    else break
  }
  
  return count
}

const countVerticalMatches = (cell, grid) => {
  let count = 1
  const color = cell.color
  const x = cell.x
  const y = cell.y
  
  for (let i = y - 1; i >= 0; i--) {
    if (grid[i][x].color === color) count++
    else break
  }
  
  for (let i = y + 1; i < grid.length; i++) {
    if (grid[i][x].color === color) count++
    else break
  }
  
  return count
}

const getBombCells = (x, y, grid) => {
  const cells = []
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const newX = x + dx
      const newY = y + dy
      if (newX >= 0 && newX < grid[0].length && newY >= 0 && newY < grid.length) {
        cells.push(grid[newY][newX])
      }
    }
  }
  return cells
}

const getVerticalLine = (x, grid) => {
  const cells = []
  for (let y = 0; y < grid.length; y++) {
    cells.push(grid[y][x])
  }
  return cells
}

const getHorizontalLine = (y, grid) => {
  const cells = []
  for (let x = 0; x < grid[0].length; x++) {
    cells.push(grid[y][x])
  }
  return cells
}

const getCrystalCells = (grid) => {
  const cells = []
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      if (grid[y][x].hasCrystal) {
        cells.push(grid[y][x])
      }
    }
  }
  return cells
}

// В разделе getters добавьте:
const getters = {
  grid: (state) => state.grid || [],
  gridSize: (state) => state.gridSize || 8,
  selectedCell: (state) => state.selectedCell || null,
  matchedSet: (state) => state.matchedSet || new Set(),
  matchedCount: (state) => (state.matchedSet || new Set()).size,
  score: (state) => state.score || 0,
  animatingRevert: (state) => state.animatingRevert || false,
  revertIds: (state) => state.revertIds || null,
  isProcessing: (state) => state.isProcessing || false,
  combo: (state) => state.combo || { 
    active: false, 
    color: null, 
    count: 0, 
    multiplier: 1,
    bonusType: null
  },
  lastMatchColor: (state) => state.lastMatchColor || null,
  comboChain: (state) => state.comboChain || 0,
  crystals: (state) => state.crystals || { collected: 0, total: 0, max: 8 },
  crystalsCollected: (state) => (state.crystals || {}).collected || 0,
  crystalsTotal: (state) => (state.crystals || {}).total || 0,
  crystalsMax: (state) => (state.crystals || {}).max || 8,
  bonuses: (state) => state.bonuses || [],
  timeLeft: (state) => state.timeLeft || 120,
  targetScore: (state) => state.targetScore || 10000,
  moveCount: (state) => state.moveCount || 0,
  level: (state) => state.level || 1
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}