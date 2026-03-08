export const baseElements = [
  { id: 1, name: 'Огонь', icon: '🔥' },
  { id: 2, name: 'Вода', icon: '💧' },
  { id: 3, name: 'Земля', icon: '🌍' },
  { id: 4, name: 'Воздух', icon: '💨' }
]

export const elementsMap = {
  1: { id: 1, name: 'Огонь', icon: '🔥' },
  2: { id: 2, name: 'Вода', icon: '💧' },
  3: { id: 3, name: 'Земля', icon: '🌍' },
  4: { id: 4, name: 'Воздух', icon: '💨' },
  5: { id: 5, name: 'Пар', icon: '💨' },
  6: { id: 6, name: 'Грязь', icon: '💩' },
  7: { id: 7, name: 'Лава', icon: '🌋' },
  8: { id: 8, name: 'Туман', icon: '🌫️' },
  9: { id: 9, name: 'Энергия', icon: '⚡' },
  10: { id: 10, name: 'Пыль', icon: '🏜️' },
  11: { id: 11, name: 'Глина', icon: '🏺' },
  12: { id: 12, name: 'Дождь', icon: '🌧️' },
  13: { id: 13, name: 'Гейзер', icon: '⛲' },
  14: { id: 14, name: 'Камень', icon: '🪨' },
  15: { id: 15, name: 'Спирт', icon: '🥃' },
  16: { id: 16, name: 'Жизнь', icon: '🧬' },
  17: { id: 17, name: 'Облако', icon: '☁️' },
  18: { id: 18, name: 'Кремень', icon: '🔪' },
  19: { id: 19, name: 'Керамика', icon: '🍶' },
  20: { id: 20, name: 'Лекарство', icon: '💊' },
  21: { id: 21, name: 'Душа', icon: '👻' },
  22: { id: 22, name: 'Инструменты', icon: '🔧' },
  23: { id: 23, name: 'Бактерии', icon: '🦠' },
  24: { id: 24, name: 'Дождь', icon: '🌧️' }
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
    id: 5,
    inputs: [1, 4], // Огонь + Воздух
    output: 9 // Энергия
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
    id: 8,
    inputs: [1, 4, 2], // Огонь + Воздух + Вода
    output: 12 // Дождь
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
    id: 12,
    inputs: [1, 2, 3, 4], // Все базовые элементы
    output: 16 // Жизнь
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
    id: 17,
    inputs: [16, 9], // Жизнь + Энергия
    output: 21 // Душа
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