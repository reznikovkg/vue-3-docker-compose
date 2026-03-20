import { 
  baseElements, 
  recipes, 
  findRecipeByInputs, 
  elementsMap,
  getElementById,
  findCraftRecipeByPattern,
  getCraftingTime,
  getMiningTime
} from '../data/alchemyData.js'


const MUTATIONS = {
  ADD_DISCOVERED_ELEMENT: 'ADD_DISCOVERED_ELEMENT',
  ADD_TO_TABLE: 'ADD_TO_TABLE',
  REMOVE_ITEMS_FROM_TABLE: 'REMOVE_ITEMS_FROM_TABLE',
  CLEAR_TABLE: 'CLEAR_TABLE',
  SET_SELECTED_ELEMENT: 'SET_SELECTED_ELEMENT',
  SET_MESSAGE: 'SET_MESSAGE',
  UPDATE_ITEM_QUANTITY: 'UPDATE_ITEM_QUANTITY',
  SET_CRAFT_SLOT: 'SET_CRAFT_SLOT',
  CLEAR_CRAFT_SLOTS: 'CLEAR_CRAFT_SLOTS',
  SET_CRAFT_MODE: 'SET_CRAFT_MODE',
  SET_ELEMENT_FOR_CRAFT: 'SET_ELEMENT_FOR_CRAFT',

  ASSIGN_WORKER: 'ASSIGN_WORKER',
  UNASSIGN_WORKER: 'UNASSIGN_WORKER',
  START_MINING: 'START_MINING',
  UPDATE_MINING_PROGRESS: 'UPDATE_MINING_PROGRESS',
  COMPLETE_MINING: 'COMPLETE_MINING',
  START_CRAFTING: 'START_CRAFTING',
  UPDATE_CRAFTING_PROGRESS: 'UPDATE_CRAFTING_PROGRESS',
  COMPLETE_CRAFTING: 'COMPLETE_CRAFTING',
  UPDATE_ELEMENT_QUANTITY: 'UPDATE_ELEMENT_QUANTITY'
}

export default {
  namespaced: true,
  state () {
    return {
      discoveredElements: [
        { id: 1, name: 'Огонь', icon: '🔥', quantity: 1, level: 1 },
        { id: 2, name: 'Вода', icon: '💧', quantity: 1, level: 1 },
        { id: 3, name: 'Земля', icon: '🌍', quantity: 1, level: 1 },
        { id: 4, name: 'Воздух', icon: '💨', quantity: 1, level: 1 }
      ],
      tableItems: [],
      selectedElement: null,
      recipes: [...recipes],
      message: null,
      craftSlots: new Array(9).fill(null),
      craftMode: false,
      elementForCraft: null,
      
      workers: {
        total: 5,
        free: 5,
        assigned: {}
      },
      miningProcesses: [],
      craftingProcesses: []
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

    craftSlots: (state) => state.craftSlots,
    
    craftMode: (state) => state.craftMode,
    
    elementForCraft: (state) => state.elementForCraft,
    
    craftRecipe: (state) => {
      if (!state.craftSlots) {
        return null
      }
      return findCraftRecipeByPattern(state.craftSlots)
    },
    
    craftResult: (state) => {
      if (!state.craftSlots) {
        return null
      }
      const recipe = findCraftRecipeByPattern(state.craftSlots)
      return recipe ? recipe.outputElement : null
    },
    
    canCraft: (state, getters) => {
      const recipe = getters.craftRecipe
      if (!recipe) {
        return false
      }
      
      if (!recipe.pattern) {
        return false
      }
      
      const requiredIds = []
      
      for (let i = 0; i < recipe.pattern.length; i++) {
        const row = recipe.pattern[i]
        
        if (!row) {
          return false
        }
        
        for (let j = 0; j < row.length; j++) {
          const elementId = row[j]
          if (elementId !== null && elementId !== undefined) {
            requiredIds.push(elementId)
          }
        }
      }
      
      const requiredMap = new Map()
      requiredIds.forEach(id => {
        requiredMap.set(id, (requiredMap.get(id) || 0) + 1)
      })
      
      for (const [id, quantity] of requiredMap) {
        const tableItem = state.discoveredElements.find(item => item.id === id)
        
        if (!tableItem) {
          return false
        }
        
        if (tableItem.quantity < quantity) {
          return false
        }
      }
      
      return true
    },
    
    craftResult: (state, getters) => {
      const recipe = getters.craftRecipe
      
      if (!recipe) 
        return null
      
      return getters.getElementById(recipe.output)
    },


    discoveredElements: (state) => state.discoveredElements,

    getDiscoveredElement: (state) => (id) => {
      return state.discoveredElements.find(r => r.id === id)
    },

    isDiscovered: (state) => (id) => {
      return state.discoveredElements.some(d => d.id === id)
    },

    totalWorkers: (state) => state.workers.total,
    freeWorkers: (state) => state.workers.free,
    assignedWorkers: (state) => state.workers.assigned,

    miningProcesses: (state) => state.miningProcesses,
    craftingProcesses: (state) => state.craftingProcesses
  },
  mutations: {
    [MUTATIONS.ADD_DISCOVERED_ELEMENT](state, element) {
      if (!state.discoveredElements.some(e => e.id === element.id)) {
        state.discoveredElements.push({
          ...element,
          quantity: 1
        })
      } else {
        state.discoveredElements.find(e => e.id === element.id).quantity++
      }
    },
    
    [MUTATIONS.ADD_TO_TABLE](state, element) {
      const existingItem = state.tableItems.find(item => item.id === element.id)
        
      if (existingItem) {
        if (element.quantity > existingItem.quantity) {
          existingItem.quantity++
        }
      } else {
        if (element.quantity > 0) {
          state.tableItems.push({
            ...element,
            quantity: 1
          })
        }
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
      const element = state.discoveredElements.find(item => item.id === id)
      if (item && element) {
        const newQuantity = item.quantity + change
        if (newQuantity > 0) {
          if (newQuantity <= element.quantity) {
            item.quantity = newQuantity
          }
        } else {
          const index = state.tableItems.findIndex(item => item.id === id)
          state.tableItems.splice(index, 1)
        }
      }
    },

    [MUTATIONS.SET_CRAFT_SLOT](state, { index, element }) {
      if (index >= 0 && index < 9) {
        state.craftSlots[index] = element
      }
    },
    
    [MUTATIONS.CLEAR_CRAFT_SLOTS](state) {
      state.craftSlots = new Array(9).fill(null)
    },
    
    [MUTATIONS.SET_CRAFT_MODE](state, mode) {
      state.craftMode = mode
      
      if (!mode) {
        state.elementForCraft = null
      }
    },
    
    [MUTATIONS.SET_ELEMENT_FOR_CRAFT](state, element) {
      state.elementForCraft = element
    },

    [MUTATIONS.ASSIGN_WORKER](state, resourceId) {
      if (state.workers.free > 0) {
        state.workers.free--
        state.workers.assigned[resourceId] = (state.workers.assigned[resourceId] || 0) + 1
      }
    },

    [MUTATIONS.UNASSIGN_WORKER](state, resourceId) {
      if (state.workers.assigned[resourceId] > 0) {
        state.workers.assigned[resourceId]--
        state.workers.free++
        if (state.workers.assigned[resourceId] === 0) {
          delete state.workers.assigned[resourceId]
        }
      }
    },

    [MUTATIONS.START_MINING](state, process) {
      state.miningProcesses.push(process)
    },

    [MUTATIONS.UPDATE_MINING_PROGRESS](state, { id, progress }) {
      const process = state.miningProcesses.find(p => p.id === id)
      if (process) process.progress = progress
    },

    [MUTATIONS.COMPLETE_MINING](state, processId) {
      const index = state.miningProcesses.findIndex(p => p.id === processId)
      if (index !== -1) {
        state.miningProcesses.splice(index, 1)
      }
    },

    [MUTATIONS.START_CRAFTING](state, process) {
      state.craftingProcesses.push(process)
    },

    [MUTATIONS.UPDATE_CRAFTING_PROGRESS](state, { id, progress }) {
      const process = state.craftingProcesses.find(p => p.id === id)
      if (process) process.progress = progress
    },

    [MUTATIONS.COMPLETE_CRAFTING](state, processId) {
      const index = state.craftingProcesses.findIndex(p => p.id === processId)
      if (index !== -1) {
        state.craftingProcesses.splice(index, 1)
      }
    },

    [MUTATIONS.UPDATE_ELEMENT_QUANTITY](state, { id, quantity }) {
      const item = state.discoveredElements.find(item => item.id === id)
      if (item) {
        item.quantity += quantity
        if (item.quantity < 0) {
          item.quantity = 0
        }
      } else if (quantity > 0) {
        const elementData = elementsMap[id]
        if (elementData) {
          state.discoveredElements.push({
            ...elementData,
            quantity
          })
        }
      }
    },

  },
  actions: {
    selectElement({ commit, getters, state }, element) {
      commit(MUTATIONS.SET_SELECTED_ELEMENT, element)
      if (state.craftMode) {
        commit(MUTATIONS.SET_ELEMENT_FOR_CRAFT, element)
        commit(MUTATIONS.SET_MESSAGE, `Выберите слот для ${element.name}`)
      } else {
        commit(MUTATIONS.ADD_TO_TABLE, element)
        commit(MUTATIONS.SET_MESSAGE, null)
      }
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

      if (!foundRecipe) {
        commit(MUTATIONS.SET_MESSAGE, 'Ничего не получилось... Попробуйте другую комбинацию!')
        return
      }

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

      commit(MUTATIONS.SET_SELECTED_ELEMENT, null)
    },
    
    clearMessage({ commit }) {
      commit(MUTATIONS.SET_MESSAGE, null)
    },

    toggleCraftMode({ commit, state }) {
      commit(MUTATIONS.SET_SELECTED_ELEMENT, null)
      commit(MUTATIONS.SET_CRAFT_MODE, !state.craftMode)
      commit(MUTATIONS.SET_MESSAGE, state.craftMode ? 'Режим крафта включен' : 'Режим крафта выключен')
    },
    
    handleCraftSlotClick({ commit, state, getters }, slotIndex) {
      if (state.elementForCraft && !state.craftSlots[slotIndex]) {
        commit(MUTATIONS.SET_CRAFT_SLOT, { 
          index: slotIndex, 
          element: state.elementForCraft 
        })
        commit(MUTATIONS.SET_SELECTED_ELEMENT, null)
        commit(MUTATIONS.SET_ELEMENT_FOR_CRAFT, null)
        commit(MUTATIONS.SET_MESSAGE, 'Элемент размещен в слоте')
      } 
      else if (state.craftSlots[slotIndex]) {
        commit(MUTATIONS.SET_CRAFT_SLOT, { 
          index: slotIndex, 
          element: null 
        })
        commit(MUTATIONS.SET_MESSAGE, 'Слот очищен')
      }
    },
    
    craftElement({ commit, state, getters }) {
      const recipe = getters.craftRecipe
      const canCraft = getters.canCraft
      
      if (!recipe) {
        commit(MUTATIONS.SET_MESSAGE, 'Неправильная комбинация для крафта')
        return
      }
      
      if (!canCraft) {
        commit(MUTATIONS.SET_MESSAGE, 'Не хватает элементов для крафта')
        return
      }
      
      const outputElement = getters.getElementById(recipe.output)
      
      if (!outputElement) {
        commit(MUTATIONS.SET_MESSAGE, 'Ошибка: результат не найден')
        return
      }
      
      const itemsToRemove = []
      const removeMap = new Map()
      
      recipe.pattern.forEach(row => {
        row.forEach(elementId => {
          if (elementId !== null) {
            removeMap.set(elementId, (removeMap.get(elementId) || 0) + 1)
          }
        })
      })
      
      removeMap.forEach((quantity, id) => {
        itemsToRemove.push({ id, quantity })
      })
      
      commit(MUTATIONS.REMOVE_ITEMS_FROM_TABLE, itemsToRemove)
      commit(MUTATIONS.ADD_DISCOVERED_ELEMENT, outputElement)
      commit(MUTATIONS.CLEAR_CRAFT_SLOTS)
      commit(MUTATIONS.SET_MESSAGE, `Создан новый элемент: ${outputElement.name}!`)
    },
    
    clearCraftSlots({ commit }) {
      commit(MUTATIONS.CLEAR_CRAFT_SLOTS)
      commit(MUTATIONS.SET_ELEMENT_FOR_CRAFT, null)
      commit(MUTATIONS.SET_MESSAGE, 'Слоты крафта очищены')
    },
    
    exitCraftMode({ commit }) {
      commit(MUTATIONS.SET_CRAFT_MODE, false)
      commit(MUTATIONS.SET_ELEMENT_FOR_CRAFT, null)
      commit(MUTATIONS.SET_MESSAGE, null)
    },

    startMining({ commit, state, getters, dispatch }, resourceId) {
      const resource = state.discoveredElements.find(r => r.id === resourceId)
      if (!resource) {
        commit(MUTATIONS.SET_MESSAGE, 'Ресурс не найден')
        return
      }
      
      if (state.workers.free === 0) {
        commit(MUTATIONS.SET_MESSAGE, 'Нет свободных рабочих')
        return
      }

      commit(MUTATIONS.ASSIGN_WORKER, resourceId)

      const activeProcess = state.miningProcesses.find(p => p.resourceId === resourceId)
      if (activeProcess) {
          activeProcess.workers +=1
          return
      }
      
      const totalTime = getMiningTime(resource.level)
      
      const processId = Date.now()
      const process = {
        id: processId,
        resourceId,
        workers: 1,
        progress: 0,
        progressScore: 0,
        lastProgressAdd: 0,
        totalTime
      }
      
      commit(MUTATIONS.START_MINING, process)
      commit(MUTATIONS.SET_MESSAGE, `Начата добыча ${resource.name}. Время: ${totalTime}с (уровень ${resource.level})`)
      
      const interval = setInterval(() => {
        const currentProcess = state.miningProcesses.find(p => p.id === processId)
        if (!currentProcess) {
          clearInterval(interval)
          return
        }
        
        currentProcess.lastProgressAdd = 100 * currentProcess.workers
        currentProcess.progressScore += currentProcess.lastProgressAdd
        const progressTime = currentProcess.progressScore / 1000
        const progress = Math.min(100, (progressTime / currentProcess.totalTime) * 100)
        
        commit(MUTATIONS.UPDATE_MINING_PROGRESS, { id: processId, progress })
        
        if (progressTime >= currentProcess.totalTime) {
          dispatch('completeMining', processId)
          process.progress = 0
          process.progressScore = 0
        }
      }, 100)
      
      process.interval = interval
    },

    completeMining({ commit, state, getters }, processId) {
      const process = state.miningProcesses.find(p => p.id === processId)
      if (!process) return
      
      const element = getters.getElementById(process.resourceId)
      
      commit(MUTATIONS.SET_MESSAGE, `Добыт ресурс: ${element.name}`)

      commit(MUTATIONS.UPDATE_ELEMENT_QUANTITY, { id: element.id, quantity: 1})
    },

    cancelMining({ commit, state, getters }, processId) {
      const process = state.miningProcesses.find(p => p.id === processId)
      if (!process) return
      if (!process.interval) return

      clearInterval(process.interval)
      
      for (let i = 0; i < process.workers; i++) {
        commit(MUTATIONS.UNASSIGN_WORKER, process.resourceId)
      }
      commit(MUTATIONS.COMPLETE_MINING, processId)

      commit(MUTATIONS.SET_MESSAGE, 'Добыча отменена')
    },
    
    startCrafting({ commit, state, getters, dispatch }) {

      if (state.tableItems.length < 2) {
        commit(MUTATIONS.SET_MESSAGE, 'Нужно хотя бы 2 элемента для смешивания!')
        return
      }

      if (state.workers.free === 0) {
        commit(MUTATIONS.SET_MESSAGE, 'Нет свободных рабочих')
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
        
        if (foundRecipe) {
            break
        }
      }
      
      if (!foundRecipe) {
        commit(MUTATIONS.SET_MESSAGE, 'Ничего не получилось... Попробуйте другую комбинацию!')
        return
      }

      const newElement = elementsMap[foundRecipe.output]
      
      if (!newElement) {
        commit(MUTATIONS.SET_MESSAGE, 'Ошибка: элемент не найден!')
        return
      }

      const requiredIds = [...foundRecipe.inputs]
      const requiredMap = new Map()
      requiredIds.forEach(id => {
        requiredMap.set(id, (requiredMap.get(id) || 0) + 1)
      })
    
      for (const [id, quantity] of requiredMap) {
        if (!getters.discoveredElements.some(e => e.id === id && e.quantity >= quantity)) {
          commit(MUTATIONS.SET_MESSAGE, 'Недостаточно ресурсов для крафта!')
          return
        }
      }

      for (const [id, quantity] of requiredMap) {
        const element = getters.getDiscoveredElement(id)
        if (element) {
          commit(MUTATIONS.UPDATE_ELEMENT_QUANTITY, { id: element.id, quantity: -quantity})
        }
      }
      commit(MUTATIONS.REMOVE_ITEMS_FROM_TABLE, Array.from(requiredMap.entries()).map(([id, quantity]) => ({
        id,
        quantity
      })))

      commit(MUTATIONS.ASSIGN_WORKER, 'crafting')
      
      const totalTime = getCraftingTime(newElement.level)
      
      const processId = Date.now()
      const process = {
        id: processId,
        recipe: foundRecipe,
        outputLevel: newElement.level,
        output: newElement,
        workers: 1,
        progress: 0,
        progressScore: 0,
        lastProgressAdd: 0,
        totalTime
      }
      
      commit(MUTATIONS.START_CRAFTING, process)
      commit(MUTATIONS.SET_MESSAGE, `Начат крафт ${newElement.name}. Время: ${totalTime}с (уровень ${newElement.level})`)
      commit(MUTATIONS.SET_SELECTED_ELEMENT, null)
      commit(MUTATIONS.CLEAR_CRAFT_SLOTS)
      
      const interval = setInterval(() => {
        const currentProcess = state.craftingProcesses.find(p => p.id === processId)
        if (!currentProcess) {
          clearInterval(interval)
          return
        }
        
        currentProcess.lastProgressAdd = 100 * currentProcess.workers
        currentProcess.progressScore += currentProcess.lastProgressAdd
        const progressTime = currentProcess.progressScore / 1000
        const progress = Math.min(100, (progressTime / currentProcess.totalTime) * 100)
        
        commit(MUTATIONS.UPDATE_CRAFTING_PROGRESS, { id: processId, progress })
        
        if (progressTime >= currentProcess.totalTime) {
          clearInterval(interval)
          dispatch('completeCrafting', processId)
        }
      }, 100)
      
      process.interval = interval
    },

    completeCrafting({ commit, state }, processId) {
      const process = state.craftingProcesses.find(p => p.id === processId)
      if (!process) return
      
      const outputElement = elementsMap[process.recipe.output]
      
      commit(MUTATIONS.UNASSIGN_WORKER, 'crafting')
      
      commit(MUTATIONS.COMPLETE_CRAFTING, processId)
      commit(MUTATIONS.SET_MESSAGE, `Создан ресурс: ${outputElement.name}`)
      
      commit(MUTATIONS.ADD_DISCOVERED_ELEMENT, outputElement)
    },
    
    startCraft3x3({ commit, state, getters, dispatch }) {
      const recipe = getters.craftRecipe
      const canCraft = getters.canCraft
      const workers = 3
      
      if (!recipe) {
        commit(MUTATIONS.SET_MESSAGE, 'Неправильная комбинация для крафта')
        return
      }
      
      if (!canCraft) {
        commit(MUTATIONS.SET_MESSAGE, 'Не хватает элементов для крафта')
        return
      }

      if (state.workers.free < workers) {
        commit(MUTATIONS.SET_MESSAGE, 'Нет свободных рабочих')
        return
      }
      
      const outputElement = getters.getElementById(recipe.output)
      
      if (!outputElement) {
        commit(MUTATIONS.SET_MESSAGE, 'Ошибка: результат не найден')
        return
      }
      
      const requiredMap = new Map()
      
      recipe.pattern.forEach(row => {
        row.forEach(elementId => {
          if (elementId !== null) {
            requiredMap.set(elementId, (requiredMap.get(elementId) || 0) + 1)
          }
        })
      })
      
      for (const [id, quantity] of requiredMap) {
        if (!getters.discoveredElements.some(e => e.id === id && e.quantity >= quantity)) {
          commit(MUTATIONS.SET_MESSAGE, 'Недостаточно ресурсов для крафта!')
          return
        }
      }

      for (const [id, quantity] of requiredMap) {
        const element = getters.getDiscoveredElement(id)
        if (element) {
          commit(MUTATIONS.UPDATE_ELEMENT_QUANTITY, { id: element.id, quantity: -quantity})
        }
      }
      commit(MUTATIONS.REMOVE_ITEMS_FROM_TABLE, Array.from(requiredMap.entries()).map(([id, quantity]) => ({
        id,
        quantity
      })))

      for (let i = 0; i < workers; i++) {
        commit(MUTATIONS.ASSIGN_WORKER, 'craft3x3')
      }

      const totalTime = getCraftingTime(outputElement.level)
      
      const processId = Date.now()
      const process = {
        id: processId,
        recipe: recipe,
        outputLevel: outputElement.level,
        output: outputElement,
        workers: workers,
        progress: 0,
        progressScore: 0,
        lastProgressAdd: 0,
        totalTime
      }

      commit(MUTATIONS.START_CRAFTING, process)
      commit(MUTATIONS.SET_MESSAGE, `Начат крафт ${outputElement.name}. Время: ${totalTime}с (уровень ${outputElement.level})`)
      commit(MUTATIONS.SET_SELECTED_ELEMENT, null)
      commit(MUTATIONS.CLEAR_CRAFT_SLOTS)
      
      const interval = setInterval(() => {
        const currentProcess = state.craftingProcesses.find(p => p.id === processId)
        if (!currentProcess) {
          clearInterval(interval)
          return
        }
        
        currentProcess.lastProgressAdd = 100
        currentProcess.progressScore += currentProcess.lastProgressAdd
        const progressTime = currentProcess.progressScore / 1000
        const progress = Math.min(100, (progressTime / currentProcess.totalTime) * 100)
        
        commit(MUTATIONS.UPDATE_CRAFTING_PROGRESS, { id: processId, progress })
        
        if (progressTime >= currentProcess.totalTime) {
          clearInterval(interval)
          dispatch('completeCrafting3x3', processId)
        }
      }, 100)
      
      process.interval = interval
    },

    completeCrafting3x3({ commit, state, getters, dispatch }, processId) {
      const process = state.craftingProcesses.find(p => p.id === processId)
      if (!process) return

      const outputElement = elementsMap[process.recipe.output]

      for (let i = 0; i < process.workers; i++) {
        commit(MUTATIONS.UNASSIGN_WORKER, 'craft3x3')
      }

      commit(MUTATIONS.COMPLETE_CRAFTING, processId)

      commit(MUTATIONS.ADD_DISCOVERED_ELEMENT, outputElement)
      commit(MUTATIONS.SET_MESSAGE, `Создан новый элемент: ${outputElement.name}!`)
    }
  }
}


const getCombinations = (array, size) => {
  const combinations = []
  
  const combine = (start, current) => {
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