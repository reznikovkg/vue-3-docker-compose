export const baseElements = [
  { id: 1, name: 'Огонь', icon: '🔥', level: 1 },
  { id: 2, name: 'Вода', icon: '💧', level: 1 },
  { id: 3, name: 'Земля', icon: '🌍', level: 1 },
  { id: 4, name: 'Воздух', icon: '💨', level: 1 }
]

export const elementsMap = {
  1: { id: 1, name: 'Огонь', icon: '🔥', level: 1 },
  2: { id: 2, name: 'Вода', icon: '💧', level: 1 },
  3: { id: 3, name: 'Земля', icon: '🌍', level: 1},
  4: { id: 4, name: 'Воздух', icon: '💨', level: 1 },
  5: { id: 5, name: 'Пар', icon: '💨', level: 2 },
  6: { id: 6, name: 'Грязь', icon: '💩', level: 2 },
  7: { id: 7, name: 'Лава', icon: '🌋', level: 2 },
  8: { id: 8, name: 'Туман', icon: '🌫️', level: 2 },
  10: { id: 10, name: 'Пыль', icon: '🏜️', level: 2 },
  11: { id: 11, name: 'Глина', icon: '🏺', level: 3 },
  13: { id: 13, name: 'Гейзер', icon: '⛲', level: 3 },
  14: { id: 14, name: 'Камень', icon: '🪨', level: 3 },
  15: { id: 15, name: 'Спирт', icon: '🥃', level: 3 },
  17: { id: 17, name: 'Облако', icon: '☁️', level: 3 },
  18: { id: 18, name: 'Кремень', icon: '🔪', level: 4 },
  19: { id: 19, name: 'Керамика', icon: '🍶', level: 4 },
  20: { id: 20, name: 'Лекарство', icon: '💊', level: 4 },
  22: { id: 22, name: 'Инструменты', icon: '🔧', level: 4 },
  23: { id: 23, name: 'Бактерии', icon: '🦠', level: 4 },

  //элементы через крафт 3х3
  9: { id: 9, name: 'Энергия', icon: '⚡', level: 2 },
  12: { id: 12, name: 'Дождь', icon: '🌧️', level: 2 },
  16: { id: 16, name: 'Жизнь', icon: '🧬', level: 3 },
  21: { id: 21, name: 'Душа', icon: '👻', level: 4 },
}

export const recipes = [
  {
    id: 1,
    inputs: [1, 2], // Огонь + Вода
    output: 5 // Пар
  },
  {
    id: 2,
    inputs: [3, 2], // Земля + Вода
    output: 6 // Грязь
  },
  {
    id: 3,
    inputs: [1, 3], // Огонь + Земля
    output: 7 // Лава
  },
  {
    id: 4,
    inputs: [4, 2], // Воздух + Вода
    output: 8 // Туман
  },
  {
    id: 6,
    inputs: [3, 4], // Земля + Воздух
    output: 10 // Пыль
  },
  {
    id: 7,
    inputs: [1, 2, 3], // Огонь + Вода + Земля
    output: 11 // Глина
  },
  {
    id: 9,
    inputs: [5, 3], // Пар + Земля
    output: 13 // Гейзер
  },
  {
    id: 10,
    inputs: [7, 2], // Лава + Вода
    output: 14 // Камень
  },
  {
    id: 11,
    inputs: [9, 2], // Энергия + Вода
    output: 15 // Спирт
  },
  {
    id: 13,
    inputs: [5, 8, 10], // Пар + Туман + Пыль
    output: 17 // Облако
  },
  {
    id: 14,
    inputs: [14, 9], // Камень + Энергия
    output: 18 // Кремень
  },
  {
    id: 15,
    inputs: [11, 9], // Глина + Энергия
    output: 19 // Керамика
  },
  {
    id: 16,
    inputs: [15, 6], // Спирт + Грязь
    output: 20 // Лекарство
  },
  {
    id: 18,
    inputs: [14, 18], // Камень + Кремень
    output: 22 // Инструменты
  },
  {
    id: 19,
    inputs: [16, 15], // Жизнь + Спирт
    output: 23 // Бактерии
  },
]

export const craftRecipes = [
  {
    id: 1001,
    pattern: [
      [1, null, null],
      [null, 2, null],
      [null, null, 3]
    ],
    output: 9 // Энергия
  },
  {
    id: 1002,
    pattern: [
      [1, 4, 2],
      [4, null, 4],
      [2, 4, 1]
    ],
    output: 12 // Дождь
  },
  {
    id: 1003,
    pattern: [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 1]
    ],
    output: 16 // Жизнь
  },
  {
    id: 1004,
    pattern: [
      [16, null, 16],
      [null, 9, null],
      [16, null, 16]
    ],
    output: 21 // Душа
  },
]

export const findRecipeByInputs = (inputIds) => {
  const sortedInputs = [...inputIds].sort((a, b) => a - b)
  
  return recipes.find(recipe => {
    const sortedRecipeInputs = [...recipe.inputs].sort((a, b) => a - b)
    
    return sortedInputs.length === sortedRecipeInputs.length &&
           sortedInputs.every((id, index) => id === sortedRecipeInputs[index])
  })
}

export const getAvailableRecipes = (discoveredIds) => {
  return recipes.filter(recipe => {
    return recipe.inputs.every(id => discoveredIds.includes(id))
  })
}

export const canCreateElement = (recipe, availableIds) => {
  return recipe.inputs.every(id => availableIds.includes(id))
}

export const getElementById = (id) => {
  return elementsMap[id]
}

export const getAllElements = () => {
  return Object.values(elementsMap)
}

export const findCraftRecipeByPattern = (slots) => {
  if (!slots || slots.length !== 9) {
    return null
  }
  
  const pattern = []
  
  for (let i = 0; i < 3; i++) {
    const row = []
    for (let j = 0; j < 3; j++) {
      const index = i * 3 + j
      row.push(slots[index] ? slots[index].id : null)
    }
    pattern.push(row)
  }
  
  const recipe = craftRecipes.find(recipe => {
    if (!recipe.pattern) {
      return false
    }
    
    for (let i = 0; i < 3; i++) {
      if (!recipe.pattern[i]) {
        return false
      }
      
      for (let j = 0; j < 3; j++) {
        if (recipe.pattern[i][j] !== pattern[i][j]) {
          return false
        }
      }
    }
    return true
  })
  
  if (recipe) {
    const outputElement = elementsMap[recipe.output]
    if (!outputElement) {
      return false
    }
    
    return {
      ...recipe,
      outputElement
    }
  }
  
  return false
}

const BASE_TIME = 5

export const getCraftTimeByLevel = (level) => {
  return BASE_TIME * Math.pow(3, level - 1)
}

export const getMiningTime = (level) => {
  return Math.max(1, Math.floor(BASE_TIME * Math.pow(3, level - 1)))
}

export const getCraftingTime = (level) => {
  return Math.max(1, Math.floor(BASE_TIME * Math.pow(3, level - 1)))
}

export const getElementLevel = (id) => {
  return elementsMap[id]?.level || 1
}