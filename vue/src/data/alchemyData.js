export const startElements = [
  { id: 1, name: 'Огонь', icon: '🔥' },
  { id: 2, name: 'Вода', icon: '💧' },
  { id: 3, name: 'Земля', icon: '🌍' },
  { id: 4, name: 'Воздух', icon: '💨' },
]

export const elementsById = {
  1: { id: 1, name: 'Огонь', icon: '🔥' },
  2: { id: 2, name: 'Вода', icon: '💧' },
  3: { id: 3, name: 'Земля', icon: '🌍' },
  4: { id: 4, name: 'Воздух', icon: '💨' },
  5: { id: 5, name: 'Пар', icon: '♨️' },
  6: { id: 6, name: 'Грязь', icon: '🟤' },
  7: { id: 7, name: 'Лава', icon: '🌋' },
  8: { id: 8, name: 'Туман', icon: '🌫️' },
  9: { id: 9, name: 'Пыль', icon: '🏜️' },
  10: { id: 10, name: 'Глина', icon: '🏺' },
  11: { id: 11, name: 'Камень', icon: '🪨' },
  12: { id: 12, name: 'Дерево', icon: '🌳' },
  13: { id: 13, name: 'Металл', icon: '⚙️' },
  14: { id: 14, name: 'Стекло', icon: '🧊' },

  15: { id: 15, name: 'Энергия', icon: '⚡' },
  16: { id: 16, name: 'Жизнь', icon: '🧬' },
  17: { id: 17, name: 'Кристалл', icon: '💎' },
  18: { id: 18, name: 'Артефакт', icon: '🏆' },
}

export const mixRecipes = [
  { id: 101, ids: [1, 2], result: 5 },     
  { id: 102, ids: [2, 3], result: 6 },     
  { id: 103, ids: [1, 3], result: 7 },     
  { id: 104, ids: [2, 4], result: 8 },     
  { id: 105, ids: [3, 4], result: 9 },     
  { id: 106, ids: [1, 2, 3], result: 10 }, 
  { id: 107, ids: [7, 2], result: 11 },    
  { id: 108, ids: [6, 4], result: 12 },    
  { id: 109, ids: [11, 1], result: 13 },   
  { id: 110, ids: [9, 1], result: 14 },    
]

export const craftRecipes = [
  { id: 201, ids: [1, 1, 4], result: 15 },          
  { id: 202, ids: [1, 2, 3, 4], result: 16 },       
  { id: 203, ids: [13, 13, 9], result: 17 },        
  { id: 204, ids: [16, 17, 15], result: 18 },       
]

export function findMixRecipe(ids) {
  const sorted = [...ids].sort((a, b) => a - b)
  return mixRecipes.find((recipe) => {
    const recipeSorted = [...recipe.ids].sort((a, b) => a - b)
    return (
      sorted.length === recipeSorted.length &&
      sorted.every((id, i) => id === recipeSorted[i])
    )
  })
}

export function findCraftRecipe(slotElementIds) {
  const filled = slotElementIds.filter((id) => id !== null && id !== undefined)
  const sorted = [...filled].sort((a, b) => a - b)
  return craftRecipes.find((recipe) => {
    const recipeSorted = [...recipe.ids].sort((a, b) => a - b)
    return (
      sorted.length === recipeSorted.length &&
      sorted.every((id, i) => id === recipeSorted[i])
    )
  })
}

export function getElementById(id) {
  return elementsById[id]
}