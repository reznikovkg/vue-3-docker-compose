import { 
  baseElements, 
  recipes, 
  findRecipeByInputs, 
  elementsMap,
  getElementById 
} from '../data/alchemyData.js'


const MUTATIONS = {
  ADD_DISCOVERED_ELEMENT: 'ADD_DISCOVERED_ELEMENT',
  ADD_TO_TABLE: 'ADD_TO_TABLE',
  REMOVE_ITEMS_FROM_TABLE: 'REMOVE_ITEMS_FROM_TABLE',
  CLEAR_TABLE: 'CLEAR_TABLE',
  SET_SELECTED_ELEMENT: 'SET_SELECTED_ELEMENT',
  SET_MESSAGE: 'SET_MESSAGE',
  UPDATE_ITEM_QUANTITY: 'UPDATE_ITEM_QUANTITY',
}

export default {
  namespaced: true,
  state () {
    return {
      discoveredElements: [...baseElements],
      tableItems: [],
      selectedElement: null,
      recipes: [...recipes],
      message: null
    }
  },
  getters: {
    discoveredElements: (state) => state.discoveredElements,
    discoveredIds: (state) => state.discoveredElements.map(e => e.id),
    tableItems: (state) => state.tableItems,
    selectedElement: (state) => state.selectedElement,

    totalItems: (state) => state.tableItems.reduce((sum, item) => sum + item.quantity, 0),
    message: (state) => state.message,
    
    isSelected: (state) => (element) => {
      return state.selectedElement?.id === element.id
    },
    
    getElementById: (state) => (id) => {
      return state.discoveredElements.find(e => e.id === id) || elementsMap[id]
    },
    
    isDiscovered: (state) => (id) => {
      return state.discoveredElements.some(e => e.id === id)
    },
    
    availableRecipes: (state, getters) => {
      const discoveredIds = getters.discoveredIds
      return recipes.filter(recipe => 
          recipe.inputs.every(id => discoveredIds.includes(id))
        ).map(recipe => ({
          ...recipe,
          outputElement: getters.getElementById(recipe.output)
        }))
    },
  },
  mutations: {
    [MUTATIONS.ADD_DISCOVERED_ELEMENT](state, element) {
      if (!state.discoveredElements.some(e => e.id === element.id)) {
        state.discoveredElements.push(element)
      }
    },
    
    [MUTATIONS.ADD_TO_TABLE](state, element) {
      const existingItem = state.tableItems.find(item => item.id === element.id)
        
      if (existingItem) {
        existingItem.quantity++
      } else {
        state.tableItems.push({
          ...element,
          quantity: 1
        })
      }
    },
    
    [MUTATIONS.REMOVE_ITEMS_FROM_TABLE](state, itemsToRemove) {
      itemsToRemove.forEach(({ id, quantity }) => {
        const index = state.tableItems.findIndex(item => item.id === id)
            
        if (index !== -1) {
            if (state.tableItems[index].quantity > quantity) {
            state.tableItems[index].quantity -= quantity
            } else {
            state.tableItems.splice(index, 1)
            }
        }
      })
    },
    
    [MUTATIONS.CLEAR_TABLE](state) {
      state.tableItems = []
    },
    
    [MUTATIONS.SET_SELECTED_ELEMENT](state, element) {
      state.selectedElement = element
    },
    
    [MUTATIONS.SET_MESSAGE](state, message) {
      state.message = message
    },
    
    [MUTATIONS.UPDATE_ITEM_QUANTITY](state, { id, change }) {
      const item = state.tableItems.find(item => item.id === id)
      if (item) {
        const newQuantity = item.quantity + change
        if (newQuantity > 0) {
          item.quantity = newQuantity
        } else {
          const index = state.tableItems.findIndex(item => item.id === id)
          state.tableItems.splice(index, 1)
        }
      }
    }
  },
  actions: {
    selectElement({ commit, getters }, element) {
      commit(MUTATIONS.SET_SELECTED_ELEMENT, element)
      commit(MUTATIONS.ADD_TO_TABLE, element)
      commit(MUTATIONS.SET_MESSAGE, null)
    },
    
    increaseQuantity({ commit }, { id }) {
      commit(MUTATIONS.UPDATE_ITEM_QUANTITY, { id, change: 1 })
    },
    
    decreaseQuantity({ commit }, { id }) {
      commit(MUTATIONS.UPDATE_ITEM_QUANTITY, { id, change: -1 })
    },
    
    resetTable({ commit }) {
      commit(MUTATIONS.CLEAR_TABLE)
      commit(MUTATIONS.SET_SELECTED_ELEMENT, null)
      commit(MUTATIONS.SET_MESSAGE, null)
    },
    
    mixElements({ state, commit, getters, dispatch }) {
      if (state.tableItems.length < 2) {
        commit(MUTATIONS.SET_MESSAGE, 'Нужно хотя бы 2 элемента для смешивания!')
        return
      }

      const allElementIds = []
      state.tableItems.forEach(item => {
        for (let i = 0; i < item.quantity; i++) {
          allElementIds.push(item.id)
        }
      })

      let foundRecipe = null
      let usedIndices = []
      const maxSize = Math.min(allElementIds.length, 4)

      for (let size = maxSize; size >= 2; size--) {
        const combinations = getCombinations(allElementIds, size)
        
        for (const combo of combinations) {
          const recipe = findRecipeByInputs(combo)
            
          if (recipe) {
            const isDiscovered = getters.isDiscovered(recipe.output)
                
            if (!isDiscovered) {
              foundRecipe = recipe
              usedIndices = findIndicesForCombination(allElementIds, combo)
              break
            } else {
              commit(MUTATIONS.SET_MESSAGE, `Элемент ${getters.getElementById(recipe.output)?.name} уже открыт!`)
              return
            }
          }
        }
        
        if (foundRecipe) 
            break
      }

      if (foundRecipe) {
        const newElement = elementsMap[foundRecipe.output]
        
        if (!newElement) {
          commit(MUTATIONS.SET_MESSAGE, 'Ошибка: элемент не найден!')
          return
        }
        
        commit(MUTATIONS.ADD_DISCOVERED_ELEMENT, newElement)
        
        const itemsToRemove = countItemsToRemove(usedIndices, allElementIds)
        commit(MUTATIONS.REMOVE_ITEMS_FROM_TABLE, itemsToRemove)
        
        commit(MUTATIONS.ADD_TO_TABLE, newElement)
        
        commit(MUTATIONS.SET_MESSAGE, `Открыт новый элемент: ${newElement.name}!`)
      } else {
        commit(MUTATIONS.SET_MESSAGE, 'Ничего не получилось... Попробуйте другую комбинацию!')
      }
    },
    
    clearMessage({ commit }) {
      commit(MUTATIONS.SET_MESSAGE, null)
    },
  }
}


const getCombinations = (array, size) => {
  const combinations = []
  
  function combine(start, current) {
    if (current.length === size) {
      combinations.push([...current])
      return
    }
    
    for (let i = start; i < array.length; i++) {
      current.push(array[i])
      combine(i + 1, current)
      current.pop()
    }
  }
  
  combine(0, [])
  return combinations
}

const findIndicesForCombination = (allIds, combination) => {
  const indices = []
  const used = new Set()
  
  for (const targetId of combination) {
    for (let i = 0; i < allIds.length; i++) {
      if (!used.has(i) && allIds[i] === targetId) {
        indices.push(i)
        used.add(i)
        break
      }
    }
  }
  
  return indices
}

const countItemsToRemove = (usedIndices, allIds) => {
  const removeMap = new Map()
  
  usedIndices.forEach(index => {
    const id = allIds[index]
    removeMap.set(id, (removeMap.get(id) || 0) + 1)
  })
  
  return Array.from(removeMap.entries()).map(([id, quantity]) => ({
    id,
    quantity
  }))
}