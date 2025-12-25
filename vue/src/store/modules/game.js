// vue/src/store/modules/game.js
import { reactive, readonly } from 'vue'

// Цвета для комбо-эффектов
const COMBO_COLORS = {
  RED: '#FF4444',
  BLUE: '#4444FF',
  YELLOW: '#FFFF44',
  PURPLE: '#FF44FF',
  GREEN: '#44FF44'
}

// Конфигурация бонусов
const BONUS_CONFIG = {
  BOMB: { 
    type: 'bomb',
    symbol: 'B',
    name: 'Bomb',
    description: 'Взрыв 3x3 вокруг клетки'
  },
  VERTICAL: {
    type: 'vertical',
    symbol: 'V',
    name: 'Vertical',
    description: 'Очищает всю колонку'
  },
  HORIZONTAL: {
    type: 'horizontal',
    symbol: 'H',
    name: 'Horizontal',
    description: 'Очищает всю строку'
  },
  RANDOM: {
    type: 'random',
    symbol: '?',
    name: 'Random',
    description: 'Случайный эффект'
  },
  TIME_MINUS: {
    type: 'time_minus',
    symbol: 'T-',
    name: 'Time-',
    description: '-10 секунд'
  },
  TIME_PLUS: {
    type: 'time_plus',
    symbol: 'T+',
    name: 'Time+',
    description: '+10 секунд'
  },
  CRYSTAL_HUNTER: {
    type: 'crystal_hunter',
    symbol: 'C',
    name: 'Crystal Hunter',
    description: 'Уничтожает кристаллы'
  }
}

// Конфигурация комбо-эффектов для цветов
const COMBO_EFFECTS = {
  [COMBO_COLORS.RED]: {
    name: 'Random Bomb',
    description: 'Случайный взрыв 3x3',
    apply: (grid, count) => applyRandomBombEffect(grid, count)
  },
  [COMBO_COLORS.BLUE]: {
    name: 'Vertical Stripe',
    description: 'Вертикальная полоса',
    apply: (grid, count) => applyVerticalStripeEffect(grid, count)
  },
  [COMBO_COLORS.YELLOW]: {
    name: 'Horizontal Stripe',
    description: 'Горизонтальная полоса',
    apply: (grid, count) => applyHorizontalStripeEffect(grid, count)
  },
  [COMBO_COLORS.PURPLE]: {
    name: 'Bonus Gift',
    description: 'Случайный бонус',
    apply: (grid, count, state) => applyBonusGiftEffect(grid, count, state)
  },
  [COMBO_COLORS.GREEN]: {
    name: 'Crystal Hunter',
    description: 'Уничтожение кристаллов',
    apply: (grid, count) => applyCrystalHunterEffect(grid, count)
  }
}

// Начальное состояние
const createInitialState = () => ({
  grid: [],
  gridSize: 8,
  selectedCell: null,
  matchedSet: new Set(),
  score: 0,
  level: 1,
  crystalsTotal: 8,
  crystalsCollected: 0,
  moveCount: 0,
  isProcessing: false,
  
  // Новые поля для комбо и бонусов
  combo: {
    active: false,
    color: null,
    count: 0,
    multiplier: 1,
    bonusType: null
  },
  bonuses: [],
  timeLeft: 120,
  targetScore: 10000,
  isGameActive: true
})

// Доступные цвета
const COLORS = ['#FF4444', '#4444FF', '#FFFF44', '#FF44FF', '#44FF44', '#FF8844', '#8844FF']

// ============== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==============

// Случайный цвет
function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)]
}

// Создание сетки
function createGrid(gridSize, crystalsTotal) {
  const grid = []
  let crystalCounter = 0
  
  for (let y = 0; y < gridSize; y++) {
    const row = []
    for (let x = 0; x < gridSize; x++) {
      const spawnCrystal = crystalCounter < crystalsTotal && Math.random() < 0.03
      if (spawnCrystal) crystalCounter++
      
      // Случайный бонус (5% вероятность)
      let bonus = null
      if (Math.random() < 0.05) {
        const bonusTypes = Object.values(BONUS_CONFIG)
        const randomBonus = bonusTypes[Math.floor(Math.random() * bonusTypes.length)]
        bonus = randomBonus.type
      }
      
      row.push({
        x,
        y,
        color: getRandomColor(),
        crystal: spawnCrystal,
        bonus,
        id: `${x}-${y}`
      })
    }
    grid.push(row)
  }
  
  return { grid, crystalsPlaced: crystalCounter }
}

// Поиск совпадений
function findMatches(grid) {
  const matches = []
  const processed = new Set()
  
  // Проверка по горизонтали
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length - 2; x++) {
      const cell1 = grid[y][x]
      const cell2 = grid[y][x + 1]
      const cell3 = grid[y][x + 2]
      
      if (cell1.color && cell1.color === cell2.color && cell2.color === cell3.color) {
        if (!processed.has(cell1.id)) matches.push(cell1)
        if (!processed.has(cell2.id)) matches.push(cell2)
        if (!processed.has(cell3.id)) matches.push(cell3)
        
        processed.add(cell1.id)
        processed.add(cell2.id)
        processed.add(cell3.id)
        
        // Проверяем продолжение комбинации
        for (let i = x + 3; i < grid[y].length; i++) {
          const nextCell = grid[y][i]
          if (nextCell.color === cell1.color && !processed.has(nextCell.id)) {
            matches.push(nextCell)
            processed.add(nextCell.id)
          } else {
            break
          }
        }
      }
    }
  }
  
  // Проверка по вертикали
  for (let x = 0; x < grid[0].length; x++) {
    for (let y = 0; y < grid.length - 2; y++) {
      const cell1 = grid[y][x]
      const cell2 = grid[y + 1][x]
      const cell3 = grid[y + 2][x]
      
      if (cell1.color && cell1.color === cell2.color && cell2.color === cell3.color) {
        if (!processed.has(cell1.id)) matches.push(cell1)
        if (!processed.has(cell2.id)) matches.push(cell2)
        if (!processed.has(cell3.id)) matches.push(cell3)
        
        processed.add(cell1.id)
        processed.add(cell2.id)
        processed.add(cell3.id)
        
        // Проверяем продолжение комбинации
        for (let i = y + 3; i < grid.length; i++) {
          const nextCell = grid[i][x]
          if (nextCell.color === cell1.color && !processed.has(nextCell.id)) {
            matches.push(nextCell)
            processed.add(nextCell.id)
          } else {
            break
          }
        }
      }
    }
  }
  
  return matches
}

// Гравитация
function applyGravity(grid) {
  const gridSize = grid.length
  const newGrid = JSON.parse(JSON.stringify(grid))
  
  for (let x = 0; x < gridSize; x++) {
    let emptySpaces = 0
    
    for (let y = gridSize - 1; y >= 0; y--) {
      if (!newGrid[y][x].color) {
        emptySpaces++
      } else if (emptySpaces > 0) {
        // Перемещаем клетку вниз
        newGrid[y + emptySpaces][x].color = newGrid[y][x].color
        newGrid[y + emptySpaces][x].crystal = newGrid[y][x].crystal
        newGrid[y + emptySpaces][x].bonus = newGrid[y][x].bonus
        
        // Очищаем исходную клетку
        newGrid[y][x].color = null
        newGrid[y][x].crystal = false
        newGrid[y][x].bonus = null
      }
    }
  }
  
  return newGrid
}

// Заполнение пустых клеток
function refillEmptyCells(grid) {
  const newGrid = JSON.parse(JSON.stringify(grid))
  const gridSize = newGrid.length
  
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (!newGrid[y][x].color) {
        newGrid[y][x].color = getRandomColor()
      }
    }
  }
  
  return newGrid
}

// ============== КОМБО ЭФФЕКТЫ ==============

// Случайный взрыв 3x3
function applyRandomBombEffect(grid, count) {
  const affectedCells = []
  const bombCount = Math.min(count, 3)
  const gridSize = grid.length
  
  for (let i = 0; i < bombCount; i++) {
    const centerX = Math.floor(Math.random() * (gridSize - 2)) + 1
    const centerY = Math.floor(Math.random() * (gridSize - 2)) + 1
    
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const x = centerX + dx
        const y = centerY + dy
        
        if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
          if (!affectedCells.some(cell => cell.x === x && cell.y === y)) {
            affectedCells.push({ x, y })
          }
        }
      }
    }
  }
  
  return affectedCells
}

// Вертикальная полоса
function applyVerticalStripeEffect(grid, count) {
  const affectedCells = []
  const columns = new Set()
  const gridSize = grid.length
  
  // Выбираем случайные колонки
  while (columns.size < Math.min(count, gridSize)) {
    columns.add(Math.floor(Math.random() * gridSize))
  }
  
  for (const x of columns) {
    for (let y = 0; y < gridSize; y++) {
      affectedCells.push({ x, y })
    }
  }
  
  return affectedCells
}

// Горизонтальная полоса
function applyHorizontalStripeEffect(grid, count) {
  const affectedCells = []
  const rows = new Set()
  const gridSize = grid.length
  
  // Выбираем случайные строки
  while (rows.size < Math.min(count, gridSize)) {
    rows.add(Math.floor(Math.random() * gridSize))
  }
  
  for (const y of rows) {
    for (let x = 0; x < gridSize; x++) {
      affectedCells.push({ x, y })
    }
  }
  
  return affectedCells
}

// Случайный бонус
function applyBonusGiftEffect(grid, count, gameState) {
  const bonuses = []
  const bonusTypes = Object.values(BONUS_CONFIG)
  
  for (let i = 0; i < Math.min(count, 3); i++) {
    const randomBonus = bonusTypes[Math.floor(Math.random() * bonusTypes.length)]
    bonuses.push({
      type: randomBonus.type,
      symbol: randomBonus.symbol,
      name: randomBonus.name
    })
  }
  
  return { bonuses, affectedCells: [] }
}

// Охота на кристаллы
function applyCrystalHunterEffect(grid, count) {
  const affectedCells = []
  const gridSize = grid.length
  
  // Ищем все клетки с кристаллами
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (grid[y][x].crystal) {
        affectedCells.push({ x, y })
      }
    }
  }
  
  // Если кристаллов мало, добавляем случайные клетки
  if (affectedCells.length < count) {
    const remaining = count - affectedCells.length
    const availableCells = []
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (!grid[y][x].crystal && !affectedCells.some(c => c.x === x && c.y === y)) {
          availableCells.push({ x, y })
        }
      }
    }
    
    // Перемешиваем и берем нужное количество
    for (let i = 0; i < Math.min(remaining, availableCells.length); i++) {
      const randomIndex = Math.floor(Math.random() * availableCells.length)
      affectedCells.push(availableCells[randomIndex])
      availableCells.splice(randomIndex, 1)
    }
  }
  
  return affectedCells
}

// ============== ОБРАБОТКА БОНУСОВ ==============

function activateBonusEffect(bonusType, x, y, grid) {
  const affectedCells = []
  const gridSize = grid.length
  
  switch (bonusType) {
    case 'bomb':
      // Взрыв 3x3
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const nx = x + dx
          const ny = y + dy
          if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
            affectedCells.push({ x: nx, y: ny })
          }
        }
      }
      break
      
    case 'vertical':
      // Вертикальная полоса
      for (let ny = 0; ny < gridSize; ny++) {
        affectedCells.push({ x, y: ny })
      }
      break
      
    case 'horizontal':
      // Горизонтальная полоса
      for (let nx = 0; nx < gridSize; nx++) {
        affectedCells.push({ x: nx, y })
      }
      break
      
    case 'random':
      // Случайный эффект
      const effects = [
        () => applyRandomBombEffect(grid, 1),
        () => applyVerticalStripeEffect(grid, 1),
        () => applyHorizontalStripeEffect(grid, 1)
      ]
      const randomEffect = effects[Math.floor(Math.random() * effects.length)]
      return randomEffect()
      
    case 'time_minus':
      // Обрабатывается отдельно
      break
      
    case 'time_plus':
      // Обрабатывается отдельно
      break
      
    case 'crystal_hunter':
      return applyCrystalHunterEffect(grid, 5)
  }
  
  return affectedCells
}

// ============== СОЗДАЕМ МОДУЛЬ ==============

export default {
  namespaced: true,
  
  state: createInitialState,
  
  getters: {
    grid: (state) => state.grid,
    selectedCell: (state) => state.selectedCell,
    matchedSet: (state) => state.matchedSet,
    score: (state) => state.score,
    level: (state) => state.level,
    crystalsCollected: (state) => state.crystalsCollected,
    crystalsTotal: (state) => state.crystalsTotal,
    moveCount: (state) => state.moveCount,
    isProcessing: (state) => state.isProcessing,
    combo: (state) => state.combo,
    bonuses: (state) => state.bonuses,
    timeLeft: (state) => state.timeLeft,
    targetScore: (state) => state.targetScore,
    isGameActive: (state) => state.isGameActive
  },
  
  mutations: {
    SET_GRID(state, grid) {
      state.grid = grid
    },
    
    SET_SELECTED_CELL(state, cell) {
      state.selectedCell = cell
    },
    
    SET_MATCHED_SET(state, matchedSet) {
      state.matchedSet = matchedSet
    },
    
    SET_SCORE(state, score) {
      state.score = score
    },
    
    INCREMENT_SCORE(state, points) {
      state.score += points
    },
    
    SET_LEVEL(state, level) {
      state.level = level
    },
    
    SET_CRYSTALS_COLLECTED(state, count) {
      state.crystalsCollected = count
    },
    
    INCREMENT_CRYSTALS_COLLECTED(state) {
      state.crystalsCollected++
    },
    
    SET_MOVE_COUNT(state, count) {
      state.moveCount = count
    },
    
    INCREMENT_MOVE_COUNT(state) {
      state.moveCount++
    },
    
    SET_IS_PROCESSING(state, isProcessing) {
      state.isProcessing = isProcessing
    },
    
    SET_COMBO(state, combo) {
      state.combo = { ...state.combo, ...combo }
    },
    
    RESET_COMBO(state) {
      state.combo = {
        active: false,
        color: null,
        count: 0,
        multiplier: 1,
        bonusType: null
      }
    },
    
    INCREMENT_COMBO_COUNT(state) {
      if (state.combo.active) {
        state.combo.count++
        state.combo.multiplier = 1 + (state.combo.count * 0.5)
      }
    },
    
    SET_BONUSES(state, bonuses) {
      state.bonuses = bonuses
    },
    
    ADD_BONUS(state, bonus) {
      state.bonuses.push(bonus)
    },
    
    REMOVE_BONUS(state, index) {
      if (index >= 0 && index < state.bonuses.length) {
        state.bonuses.splice(index, 1)
      }
    },
    
    SET_TIME_LEFT(state, time) {
      state.timeLeft = time
    },
    
    DECREMENT_TIME(state) {
      if (state.timeLeft > 0) {
        state.timeLeft--
      }
      if (state.timeLeft <= 0) {
        state.isGameActive = false
      }
    },
    
    ADD_TIME(state, seconds) {
      state.timeLeft += seconds
    },
    
    SET_TARGET_SCORE(state, score) {
      state.targetScore = score
    },
    
    SET_GAME_ACTIVE(state, isActive) {
      state.isGameActive = isActive
    },
    
    UPDATE_CELL_COLOR(state, { x, y, color }) {
      if (state.grid[y] && state.grid[y][x]) {
        state.grid[y][x].color = color
      }
    },
    
    UPDATE_CELL_BONUS(state, { x, y, bonus }) {
      if (state.grid[y] && state.grid[y][x]) {
        state.grid[y][x].bonus = bonus
      }
    },
    
    UPDATE_CELL_CRYSTAL(state, { x, y, crystal }) {
      if (state.grid[y] && state.grid[y][x]) {
        state.grid[y][x].crystal = crystal
      }
    }
  },
  
  actions: {
    // Инициализация игры
    async initializeGame({ commit, dispatch }) {
      return new Promise((resolve) => {
        commit('SET_IS_PROCESSING', true)
        
        const state = createInitialState()
        const { grid, crystalsPlaced } = createGrid(state.gridSize, state.crystalsTotal)
        
        commit('SET_GRID', grid)
        commit('SET_CRYSTALS_COLLECTED', 0)
        commit('SET_SCORE', 0)
        commit('SET_MOVE_COUNT', 0)
        commit('SET_TIME_LEFT', 120)
        commit('SET_TARGET_SCORE', 10000)
        commit('SET_BONUSES', [])
        commit('RESET_COMBO')
        commit('SET_GAME_ACTIVE', true)
        
        // Убеждаемся, что нет начальных совпадений
        const processInitialMatches = () => {
          const matches = findMatches(grid)
          if (matches.length === 0) {
            commit('SET_IS_PROCESSING', false)
            resolve()
            return
          }
          
          // Заменяем цвета в совпадающих клетках
          matches.forEach(match => {
            const availableColors = COLORS.filter(c => c !== match.color)
            const newColor = availableColors[Math.floor(Math.random() * availableColors.length)]
            commit('UPDATE_CELL_COLOR', { x: match.x, y: match.y, color: newColor })
          })
          
          setTimeout(processInitialMatches, 10)
        }
        
        processInitialMatches()
      })
    },
    
    // Выбор клетки
    selectCell({ commit, state, dispatch }, cell) {
      if (state.isProcessing || !state.isGameActive) return
      
      if (!state.selectedCell) {
        commit('SET_SELECTED_CELL', cell)
      } else {
        const dx = Math.abs(cell.x - state.selectedCell.x)
        const dy = Math.abs(cell.y - state.selectedCell.y)
        
        // Проверяем, являются ли клетки соседними
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
          commit('SET_IS_PROCESSING', true)
          
          // Сохраняем исходные цвета
          const tempColor = state.grid[cell.y][cell.x].color
          const selectedColor = state.grid[state.selectedCell.y][state.selectedCell.x].color
          
          // Меняем клетки местами
          commit('UPDATE_CELL_COLOR', { 
            x: cell.x, 
            y: cell.y, 
            color: selectedColor
          })
          commit('UPDATE_CELL_COLOR', { 
            x: state.selectedCell.x, 
            y: state.selectedCell.y, 
            color: tempColor
          })
          
          commit('INCREMENT_MOVE_COUNT')
          
          // Проверяем совпадения после обмена
          setTimeout(() => {
            const matches = findMatches(state.grid)
            if (matches.length > 0) {
              dispatch('processMatches', matches)
            } else {
              // Возвращаем клетки обратно, если нет совпадений
              commit('UPDATE_CELL_COLOR', { 
                x: cell.x, 
                y: cell.y, 
                color: tempColor
              })
              commit('UPDATE_CELL_COLOR', { 
                x: state.selectedCell.x, 
                y: state.selectedCell.y, 
                color: selectedColor
              })
              commit('SET_SELECTED_CELL', null)
              commit('SET_IS_PROCESSING', false)
            }
          }, 300)
        } else {
          // Выбираем новую клетку
          commit('SET_SELECTED_CELL', cell)
        }
      }
    },
    
    // Обработка совпадений
    async processMatches({ commit, state, dispatch }, matches) {
      if (matches.length === 0) {
        commit('SET_IS_PROCESSING', false)
        return
      }
      
      // Подсчитываем статистику по совпадениям
      const colorGroups = {}
      let totalScore = 0
      let crystalsFound = 0
      
      matches.forEach(cell => {
        const color = cell.color
        if (!colorGroups[color]) colorGroups[color] = []
        colorGroups[color].push(cell)
        
        if (cell.crystal) {
          crystalsFound++
        }
      })
      
      // Проверяем комбо (2+ группы одного цвета)
      let comboColor = null
      let comboCount = 0
      
      for (const [color, group] of Object.entries(colorGroups)) {
        if (group.length >= 2) {
          comboColor = color
          comboCount = group.length
          break
        }
      }
      
      // Обработка комбо
      if (comboColor && COMBO_EFFECTS[comboColor]) {
        if (state.combo.active && state.combo.color === comboColor) {
          // Повторное комбо того же цвета
          commit('INCREMENT_COMBO_COUNT')
        } else {
          // Новое комбо
          commit('SET_COMBO', {
            active: true,
            color: comboColor,
            count: 1,
            multiplier: 1.5,
            bonusType: COMBO_EFFECTS[comboColor].name
          })
        }
        
        // Применяем эффект комбо
        const effect = COMBO_EFFECTS[comboColor]
        const comboResult = effect.apply(state.grid, comboCount, state)
        
        if (comboResult.bonuses) {
          // Добавляем бонусы
          comboResult.bonuses.forEach(bonus => {
            commit('ADD_BONUS', bonus)
          })
        }
        
        if (comboResult.affectedCells && comboResult.affectedCells.length > 0) {
          // Уничтожаем клетки, затронутые комбо
          comboResult.affectedCells.forEach(({ x, y }) => {
            if (state.grid[y][x].crystal) {
              crystalsFound++
            }
            commit('UPDATE_CELL_COLOR', { x, y, color: null })
            commit('UPDATE_CELL_CRYSTAL', { x, y, crystal: false })
          })
          
          // Очки за комбо
          const comboScore = 100 * state.combo.count * state.combo.multiplier
          totalScore += comboScore
        }
      }
      
      // Обработка бонусов в совпадениях
      matches.forEach(cell => {
        if (cell.bonus) {
          const affectedCells = activateBonusEffect(cell.bonus, cell.x, cell.y, state.grid)
          affectedCells.forEach(({ x, y }) => {
            commit('UPDATE_CELL_COLOR', { x, y, color: null })
            if (state.grid[y][x].crystal) {
              crystalsFound++
            }
          })
          
          // Удаляем бонус из клетки
          commit('UPDATE_CELL_BONUS', { x: cell.x, y: cell.y, bonus: null })
          
          // Обработка временных бонусов
          if (cell.bonus === 'time_minus') {
            commit('ADD_TIME', -10)
          } else if (cell.bonus === 'time_plus') {
            commit('ADD_TIME', 10)
          }
        }
      })
      
      // Базовые очки за совпадения
      const baseScore = matches.length * 10
      const crystalBonus = crystalsFound * 50
      totalScore += baseScore + crystalBonus
      
      // Увеличиваем счет
      commit('INCREMENT_SCORE', totalScore)
      
      // Обновляем счетчик кристаллов
      for (let i = 0; i < crystalsFound; i++) {
        commit('INCREMENT_CRYSTALS_COLLECTED')
      }
      
      // Проверяем завершение уровня
      if (state.score >= state.targetScore) {
        commit('SET_GAME_ACTIVE', false)
      }
      
      // Удаляем совпавшие клетки
      matches.forEach(cell => {
        commit('UPDATE_CELL_COLOR', { x: cell.x, y: cell.y, color: null })
        commit('UPDATE_CELL_CRYSTAL', { x: cell.x, y: cell.y, crystal: false })
      })
      
      // Применяем гравитацию
      const gridAfterGravity = applyGravity(state.grid)
      commit('SET_GRID', gridAfterGravity)
      
      // Заполняем пустые клетки
      const gridAfterRefill = refillEmptyCells(gridAfterGravity)
      commit('SET_GRID', gridAfterRefill)
      
      // Проверяем новые совпадения
      setTimeout(() => {
        const newMatches = findMatches(gridAfterRefill)
        if (newMatches.length > 0) {
          dispatch('processMatches', newMatches)
        } else {
          // Сбрасываем комбо, если новых совпадений нет
          if (state.combo.active) {
            setTimeout(() => {
              commit('RESET_COMBO')
              commit('SET_SELECTED_CELL', null)
              commit('SET_IS_PROCESSING', false)
            }, 1000)
          } else {
            commit('SET_SELECTED_CELL', null)
            commit('SET_IS_PROCESSING', false)
          }
        }
      }, 500)
    },
    
    // Активация бонуса из интерфейса
    async activateBonus({ commit, state, dispatch }, bonusIndex) {
      if (state.isProcessing || !state.isGameActive) return
      
      const bonus = state.bonuses[bonusIndex]
      if (!bonus) return
      
      commit('SET_IS_PROCESSING', true)
      
      // Выбираем случайную клетку для активации бонуса
      const x = Math.floor(Math.random() * state.gridSize)
      const y = Math.floor(Math.random() * state.gridSize)
      
      const affectedCells = activateBonusEffect(bonus.type, x, y, state.grid)
      
      // Уничтожаем затронутые клетки
      affectedCells.forEach(({ x, y }) => {
        commit('UPDATE_CELL_COLOR', { x, y, color: null })
      })
      
      // Удаляем бонус из списка
      commit('REMOVE_BONUS', bonusIndex)
      
      // Обработка временных бонусов
      if (bonus.type === 'time_minus') {
        commit('ADD_TIME', -10)
      } else if (bonus.type === 'time_plus') {
        commit('ADD_TIME', 10)
      }
      
      // Применяем гравитацию и заполняем
      const gridAfterGravity = applyGravity(state.grid)
      commit('SET_GRID', gridAfterGravity)
      
      const gridAfterRefill = refillEmptyCells(gridAfterGravity)
      commit('SET_GRID', gridAfterRefill)
      
      // Проверяем новые совпадения
      setTimeout(() => {
        const matches = findMatches(gridAfterRefill)
        if (matches.length > 0) {
          dispatch('processMatches', matches)
        } else {
          commit('SET_IS_PROCESSING', false)
        }
      }, 500)
    },
    
    // Сброс игры
    async resetGame({ dispatch }) {
      await dispatch('initializeGame')
    }
  }
}