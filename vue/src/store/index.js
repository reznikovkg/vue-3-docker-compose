import { createStore } from 'vuex'
import { SLOT_RECIPES, TABLE_RECIPES } from '../config/recipes'
import { ELEMENTS } from '../config/elements'

export const MUTATIONS = {
  ADD_TO_TABLE: 'ADD_TO_TABLE',
  DECREASE_FROM_TABLE: 'DECREASE_FROM_TABLE',
  REMOVE_ELEMENT_COMPLETELY: 'REMOVE_ELEMENT_COMPLETELY',
  CLEAR_TABLE: 'CLEAR_TABLE',
  SET_SLOT: 'SET_SLOT',
  CLEAR_SLOTS: 'CLEAR_SLOTS',
  ADD_DISCOVERED: 'ADD_DISCOVERED',
  START_MINING: 'START_MINING',
  UPDATE_MINING: 'UPDATE_MINING',
  COMPLETE_MINING: 'COMPLETE_MINING',
  ASSIGN_WORKER: 'ASSIGN_WORKER',
  UNASSIGN_WORKER: 'UNASSIGN_WORKER',
  START_CRAFTING: 'START_CRAFTING',
  UPDATE_CRAFTING: 'UPDATE_CRAFTING',
  COMPLETE_CRAFTING: 'COMPLETE_CRAFTING',
  START_TABLE_CRAFTING: 'START_TABLE_CRAFTING',
  UPDATE_TABLE_CRAFTING: 'UPDATE_TABLE_CRAFTING',
  COMPLETE_TABLE_CRAFTING: 'COMPLETE_TABLE_CRAFTING',
  ASSIGN_WORKER_TO_TABLE: 'ASSIGN_WORKER_TO_TABLE',
  UNASSIGN_WORKER_FROM_TABLE: 'UNASSIGN_WORKER_FROM_TABLE',
  ASSIGN_WORKER_TO_SLOT: 'ASSIGN_WORKER_TO_SLOT',
  UNASSIGN_WORKER_FROM_SLOT: 'UNASSIGN_WORKER_FROM_SLOT',
  ADD_TO_INVENTORY: 'ADD_TO_INVENTORY',
  REMOVE_FROM_INVENTORY: 'REMOVE_FROM_INVENTORY'
}

export const ACTIONS = {
  ADD_TO_TABLE: 'addToTable',
  DECREASE_FROM_TABLE: 'decreaseFromTable',
  REMOVE_ELEMENT_COMPLETELY: 'removeElementCompletely',
  CLEAR_TABLE: 'clearTable',
  SET_SLOT: 'setSlot',
  CHECK_SLOT_RECIPES: 'checkSlotRecipes',
  MIX: 'mix',
  START_MINING: 'startMining',
  ASSIGN_WORKER: 'assignWorker',
  UNASSIGN_WORKER: 'unassignWorker',
  START_CRAFTING: 'startCrafting',
  ASSIGN_WORKER_TO_TABLE: 'assignWorkerToTable',
  UNASSIGN_WORKER_FROM_TABLE: 'unassignWorkerFromTable',
  ASSIGN_WORKER_TO_SLOT: 'assignWorkerToSlot',
  UNASSIGN_WORKER_FROM_SLOT: 'unassignWorkerFromSlot'
}

export const GETTERS = {
  DISCOVERED_ELEMENTS: 'discoveredElements',
  TABLE_ELEMENTS: 'tableElements',
  SLOTS: 'slots',
  INVENTORY: 'inventory',
  WORKERS: 'workers',
  MINING_JOBS: 'miningJobs',
  CRAFTING_QUEUE: 'craftingQueue',
  TABLE_CRAFTING: 'tableCrafting'
}

const BASE_ELEMENTS = [1, 2, 3, 4]

export const store = createStore({
  state: {
    discovered:[1,2,3,4],
    table: {},
    slots: Array(9).fill(null),
    inventory: {
      1: 5,
      2: 5,
      3: 5,
      4: 5
    },
    workers: {
      total: 5,
      free: 5,
      assigned: {},
      assignedToTable: 0,
      assignedToSlots: {}
    },
    miningJobs: {},
    craftingQueue: [],
    tableCrafting: null
  },

  getters: {
    [GETTERS.DISCOVERED_ELEMENTS]: (state) => state.discovered,
    [GETTERS.TABLE_ELEMENTS]: (state) => state.table,
    [GETTERS.SLOTS]: (state) => state.slots,
    [GETTERS.INVENTORY]: (state) => state.inventory,
    [GETTERS.WORKERS]: (state) => state.workers,
    [GETTERS.MINING_JOBS]: (state) => state.miningJobs,
    [GETTERS.CRAFTING_QUEUE]: (state) => state.craftingQueue,
    [GETTERS.TABLE_CRAFTING]: (state) => state.tableCrafting
  },

  mutations: {
    [MUTATIONS.ADD_TO_INVENTORY]: (state, id) => {
      state.inventory = {
        ...state.inventory,
        [id]: (state.inventory[id] || 0) + 1
      }
    },

    [MUTATIONS.REMOVE_FROM_INVENTORY]: (state, id) => {
      if (state.inventory[id] && state.inventory[id] > 0) {
        const newCount = state.inventory[id] - 1
        if (newCount === 0 && !BASE_ELEMENTS.includes(id)) {
          const {[id]: removed, ...rest} = state.inventory
          state.inventory = rest
        } else {
          state.inventory = {
            ...state.inventory,
            [id]: newCount
          }
        }
      }
    },

    [MUTATIONS.ADD_TO_TABLE]: (state, id) => {
      if (state.inventory[id] && state.inventory[id] > 0) {
        const newCount = state.inventory[id] - 1
        if (newCount === 0 && !BASE_ELEMENTS.includes(id)) {
          const {[id]: removed, ...rest} = state.inventory
          state.inventory = rest
        } else {
          state.inventory = {
            ...state.inventory,
            [id]: newCount
          }
        }
        
        state.table = {
          ...state.table,
          [id]:(state.table[id]||0)+1
        }
      }
    },

    [MUTATIONS.DECREASE_FROM_TABLE]: (state, id) => {
      if (!state.table[id]) {
        return
      }

      const newCount = state.table[id] - 1
      if (newCount <= 0) {
        const {[id]:removed,...rest} = state.table
        state.table = rest
      } else {
        state.table = {
          ...state.table,
          [id]: newCount
        }
      }
      
      state.inventory = {
        ...state.inventory,
        [id]: (state.inventory[id] || 0) + 1
      }
    },

    [MUTATIONS.REMOVE_ELEMENT_COMPLETELY]: (state, id) => {
      const count = state.table[id] || 0
      const {[id]:removed, ...rest} = state.table
      state.table = rest
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          if (state.inventory[id] !== undefined) {
            state.inventory = {
              ...state.inventory,
              [id]: (state.inventory[id] || 0) + 1
            }
          } else {
            state.inventory = {
              ...state.inventory,
              [id]: 1
            }
          }
        }
      }
    },

    [MUTATIONS.CLEAR_TABLE]: (state) => {
      Object.entries(state.table).forEach(([id, count]) => {
        state.inventory = {
          ...state.inventory,
          [id]: (state.inventory[id] || 0) + count
        }
      })
      state.table = {}
    },

    [MUTATIONS.SET_SLOT]: (state, { index, el }) => {
      state.slots = state.slots.map((s, i) =>
        i === index ? el : s
      )
    },

    [MUTATIONS.CLEAR_SLOTS]: (state) => {
      state.slots = Array(9).fill(null)
    },

    [MUTATIONS.ADD_DISCOVERED]: (state, id) => {
      if (!state.discovered.includes(id)) {
        state.discovered = [...state.discovered,id]
        if (!BASE_ELEMENTS.includes(id) && state.inventory[id] === undefined) {
          state.inventory = {
            ...state.inventory,
            [id]: 0
          }
        }
      }
    },

    [MUTATIONS.START_MINING]: (state, { elementId, workers }) => {
      const element = ELEMENTS[elementId]
      const totalTime = element.baseTime 
      
      state.miningJobs = {
        ...state.miningJobs,
        [elementId]: {
          progress: 0,
          totalTime,
          workers: workers || state.workers.assigned[elementId] || 0
        }
      }
    },

    [MUTATIONS.UPDATE_MINING]: (state, { elementId, progress }) => {
      if (state.miningJobs[elementId]) {
        state.miningJobs[elementId].progress = progress
      }
    },

    [MUTATIONS.COMPLETE_MINING]: (state, elementId) => {
      state.inventory = {
        ...state.inventory,
        [elementId]: (state.inventory[elementId] || 0) + 1
      }
      
      const {[elementId]: removed, ...rest} = state.miningJobs
      state.miningJobs = rest
      
      const workersCount = state.workers.assigned[elementId] || 0
      state.workers.free += workersCount
      
      const {[elementId]: assignedRemoved, ...assignedRest} = state.workers.assigned
      state.workers.assigned = assignedRest
    },

    [MUTATIONS.ASSIGN_WORKER]: (state, elementId) => {
      if (state.workers.free > 0) {
        state.workers.free -= 1
        state.workers.assigned = {
          ...state.workers.assigned,
          [elementId]: (state.workers.assigned[elementId] || 0) + 1
        }
        
        if (state.workers.assigned[elementId] === 1) {
          const element = ELEMENTS[elementId]
          const totalTime = element.baseTime
          
          state.miningJobs = {
            ...state.miningJobs,
            [elementId]: {
              progress: 0,
              totalTime,
              workers: 1
            }
          }
        } else if (state.miningJobs[elementId]) {
          state.miningJobs[elementId].workers = state.workers.assigned[elementId]
        }
      }
    },

    [MUTATIONS.UNASSIGN_WORKER]: (state, elementId) => {
      if (state.workers.assigned[elementId] && state.workers.assigned[elementId] > 0) {
        state.workers.free += 1
        state.workers.assigned = {
          ...state.workers.assigned,
          [elementId]: state.workers.assigned[elementId] - 1
        }
        
        if (state.workers.assigned[elementId] === 0) {
          const {[elementId]: removed, ...rest} = state.workers.assigned
          state.workers.assigned = rest
          
          if (state.miningJobs[elementId]) {
            const {[elementId]: removed, ...rest} = state.miningJobs
            state.miningJobs = rest
          }
        } else if (state.miningJobs[elementId]) {
          state.miningJobs[elementId].workers = state.workers.assigned[elementId]
        }
      }
    },

    [MUTATIONS.START_CRAFTING]: (state, { resultId, ingredients, slotIndex }) => {
      Object.entries(ingredients).forEach(([position, id]) => {
        if (state.inventory[id] && state.inventory[id] > 0) {
          const newCount = state.inventory[id] - 1
          if (newCount === 0 && !BASE_ELEMENTS.includes(id)) {
            const {[id]: removed, ...rest} = state.inventory
            state.inventory = rest
          } else {
            state.inventory = {
              ...state.inventory,
              [id]: newCount
            }
          }
        }
      })
      
      const element = ELEMENTS[resultId]
      const craftTime = element.baseTime 
      
      const craftItem = {
        resultId,
        progress: 0,
        totalTime: craftTime,
        ingredients,
        workers: 1,
        slotIndex: slotIndex
      }
      
      state.craftingQueue.push(craftItem)
      
      if (slotIndex !== undefined) {
        state.workers.assignedToSlots = {
          ...state.workers.assignedToSlots,
          [slotIndex]: 1
        }
        state.workers.free -= 1
      }
    },

    [MUTATIONS.UPDATE_CRAFTING]: (state, { index, progress }) => {
      if (state.craftingQueue[index]) {
        state.craftingQueue[index].progress = progress
      }
    },

    [MUTATIONS.COMPLETE_CRAFTING]: (state, index) => {
      const craft = state.craftingQueue[index]
      
      state.inventory = {
        ...state.inventory,
        [craft.resultId]: (state.inventory[craft.resultId] || 0) + 1
      }
      
      if (!state.discovered.includes(craft.resultId)) {
        state.discovered = [...state.discovered, craft.resultId]
      }
      
      if (craft.slotIndex !== undefined && state.workers.assignedToSlots[craft.slotIndex]) {
        state.workers.free += state.workers.assignedToSlots[craft.slotIndex]
        const {[craft.slotIndex]: removed, ...rest} = state.workers.assignedToSlots
        state.workers.assignedToSlots = rest
      }
      
      state.craftingQueue.splice(index, 1)
    },

    [MUTATIONS.START_TABLE_CRAFTING]: (state, { resultId, ingredients }) => {
      const element = ELEMENTS[resultId]
      const craftTime = element.baseTime
      
      state.tableCrafting = {
        resultId,
        progress: 0,
        totalTime: craftTime,
        ingredients,
        workers: 1
      }
      state.workers.free -= 1
      state.workers.assignedToTable = 1
    },

    [MUTATIONS.UPDATE_TABLE_CRAFTING]: (state, progress) => {
      if (state.tableCrafting) {
        state.tableCrafting.progress = progress
      }
    },

    [MUTATIONS.COMPLETE_TABLE_CRAFTING]: (state) => {
      if (state.tableCrafting) {
        const resultId = state.tableCrafting.resultId
        
        state.table = {}
        
        state.inventory = {
          ...state.inventory,
          [resultId]: (state.inventory[resultId] || 0) + 1
        }
        
        if (!state.discovered.includes(resultId)) {
          state.discovered = [...state.discovered, resultId]
        }
        
        state.workers.free += state.tableCrafting.workers
        state.workers.assignedToTable = 0
        
        state.tableCrafting = null
      }
    },

    [MUTATIONS.ASSIGN_WORKER_TO_TABLE]: (state) => {
      if (state.workers.free > 0 && state.tableCrafting) {
        state.workers.free -= 1
        state.workers.assignedToTable += 1
        state.tableCrafting.workers += 1
      }
    },

    [MUTATIONS.UNASSIGN_WORKER_FROM_TABLE]: (state) => {
      if (state.tableCrafting && state.tableCrafting.workers > 0) {
        state.workers.free += 1
        state.workers.assignedToTable -= 1
        state.tableCrafting.workers -= 1
      }
    },

    [MUTATIONS.ASSIGN_WORKER_TO_SLOT]: (state, slotIndex) => {
      const craftIndex = state.craftingQueue.findIndex(c => c.slotIndex === slotIndex)
      
      if (state.workers.free > 0 && craftIndex !== -1) {
        state.workers.free -= 1
        state.workers.assignedToSlots = {
          ...state.workers.assignedToSlots,
          [slotIndex]: (state.workers.assignedToSlots[slotIndex] || 0) + 1
        }
        state.craftingQueue[craftIndex].workers += 1
      }
    },

    [MUTATIONS.UNASSIGN_WORKER_FROM_SLOT]: (state, slotIndex) => {
      const craftIndex = state.craftingQueue.findIndex(c => c.slotIndex === slotIndex)
      
      if (craftIndex !== -1 && state.workers.assignedToSlots[slotIndex] > 0) {
        state.workers.free += 1
        state.workers.assignedToSlots = {
          ...state.workers.assignedToSlots,
          [slotIndex]: state.workers.assignedToSlots[slotIndex] - 1
        }
        state.craftingQueue[craftIndex].workers -= 1
        
        if (state.workers.assignedToSlots[slotIndex] === 0) {
          const {[slotIndex]: removed, ...rest} = state.workers.assignedToSlots
          state.workers.assignedToSlots = rest
        }
      }
    }
  },

  actions: {
    [ACTIONS.ADD_TO_TABLE]: ({ commit }, id) => {
      commit(MUTATIONS.ADD_TO_TABLE, id)
    },

    [ACTIONS.DECREASE_FROM_TABLE]: ({ commit }, id) => {
      commit(MUTATIONS.DECREASE_FROM_TABLE, id)
    },

    [ACTIONS.REMOVE_ELEMENT_COMPLETELY]: ({ commit }, id) => {
      commit(MUTATIONS.REMOVE_ELEMENT_COMPLETELY, id)
    },

    [ACTIONS.CLEAR_TABLE]: ({ commit }) => {
      commit(MUTATIONS.CLEAR_TABLE)
    },

    [ACTIONS.SET_SLOT]: ({ commit, dispatch, state }, payload) => {
      const { index, el } = payload
      const oldSlotValue = state.slots[index]
      
      if (el !== null && state.slots[index] !== null) {
        return
      }
      
      if (el !== null && (!state.inventory[el] || state.inventory[el] === 0)) {
        return
      }
      
      if (el === null && oldSlotValue !== null) {
        commit(MUTATIONS.ADD_TO_INVENTORY, oldSlotValue)
        commit(MUTATIONS.SET_SLOT, payload)
      }
      else if (el !== null) {
        commit(MUTATIONS.REMOVE_FROM_INVENTORY, el)
        commit(MUTATIONS.SET_SLOT, payload)
      }
      
      dispatch(ACTIONS.CHECK_SLOT_RECIPES)
    },

    [ACTIONS.CHECK_SLOT_RECIPES]: ({ state, commit, dispatch }) => {
      const slots = state.slots
      const foundRecipe = SLOT_RECIPES.find(recipe => {
        return Object.entries(recipe.pattern).every(([position, requiredElement]) => {
          return slots[position] === requiredElement
        })
      })

      if (foundRecipe) {
        commit(MUTATIONS.ADD_DISCOVERED, foundRecipe.result)
        
        const filledSlots = Object.keys(foundRecipe.pattern).map(Number)
        filledSlots.forEach(index => {
          commit(MUTATIONS.SET_SLOT, { index, el: null })
        })
        
        const firstSlotIndex = filledSlots[0] || 0
        dispatch(ACTIONS.START_CRAFTING, { 
          resultId: foundRecipe.result,
          ingredients: foundRecipe.pattern,
          slotIndex: firstSlotIndex
        })
        return true
      }

      return false
    },

    [ACTIONS.MIX]: ({ state, commit }) => {
      if (state.tableCrafting) {
        return
      }

      const table = state.table
      const tableKeys = Object.keys(table)

      const foundRecipe = TABLE_RECIPES.find(recipe => {
        const recipeKeys = Object.keys(recipe.ingredients)

        if (recipeKeys.length !== tableKeys.length) {
          return false
        }

        return recipeKeys.every(key => 
          table[key] === recipe.ingredients[key]
        )
      })

      if (foundRecipe) {
        Object.entries(foundRecipe.ingredients).forEach(([id, count]) => {
          const newCount = state.table[id] - count
          if (newCount <= 0) {
            const {[id]: removed, ...rest} = state.table
            state.table = rest
          } else {
            state.table = {
              ...state.table,
              [id]: newCount
            }
          }
        })
        
        commit(MUTATIONS.START_TABLE_CRAFTING, { 
          resultId: foundRecipe.result,
          ingredients: foundRecipe.ingredients
        })
      }
    },

    [ACTIONS.START_MINING]: ({ commit }, elementId) => {
      commit(MUTATIONS.START_MINING, { elementId })
    },

    [ACTIONS.ASSIGN_WORKER]: ({ commit }, elementId) => {
      commit(MUTATIONS.ASSIGN_WORKER, elementId)
    },

    [ACTIONS.UNASSIGN_WORKER]: ({ commit }, elementId) => {
      commit(MUTATIONS.UNASSIGN_WORKER, elementId)
    },

    [ACTIONS.START_CRAFTING]: ({ commit }, { resultId, ingredients, slotIndex }) => {
      commit(MUTATIONS.START_CRAFTING, { resultId, ingredients, slotIndex })
    },

    [ACTIONS.ASSIGN_WORKER_TO_TABLE]: ({ commit }) => {
      commit(MUTATIONS.ASSIGN_WORKER_TO_TABLE)
    },

    [ACTIONS.UNASSIGN_WORKER_FROM_TABLE]: ({ commit }) => {
      commit(MUTATIONS.UNASSIGN_WORKER_FROM_TABLE)
    },

    [ACTIONS.ASSIGN_WORKER_TO_SLOT]: ({ commit }, slotIndex) => {
      commit(MUTATIONS.ASSIGN_WORKER_TO_SLOT, slotIndex)
    },

    [ACTIONS.UNASSIGN_WORKER_FROM_SLOT]: ({ commit }, slotIndex) => {
      commit(MUTATIONS.UNASSIGN_WORKER_FROM_SLOT, slotIndex)
    }
  },

  plugins: [(store) => {
    setInterval(() => {
      Object.entries(store.state.miningJobs).forEach(([elementId, job]) => {
        const progressIncrement = (100 / job.totalTime) * job.workers
        const newProgress = Math.min(job.progress + progressIncrement, 100)
        
        store.commit(MUTATIONS.UPDATE_MINING, { elementId, progress: newProgress })
        
        if (newProgress >= 100) {
          store.commit(MUTATIONS.COMPLETE_MINING, Number(elementId))
        }
      })
      
      store.state.craftingQueue.forEach((craft, index) => {
        const workers = craft.workers || 1
        const progressIncrement = (100 / craft.totalTime) * workers
        const newProgress = Math.min(craft.progress + progressIncrement, 100)
        
        store.commit(MUTATIONS.UPDATE_CRAFTING, { index, progress: newProgress })
        
        if (newProgress >= 100) {
          store.commit(MUTATIONS.COMPLETE_CRAFTING, index)
        }
      })

      if (store.state.tableCrafting) {
        const workers = store.state.tableCrafting.workers || 1
        const progressIncrement = (100 / store.state.tableCrafting.totalTime) * workers
        const newProgress = Math.min(store.state.tableCrafting.progress + progressIncrement, 100)
        
        store.commit(MUTATIONS.UPDATE_TABLE_CRAFTING, newProgress)
        
        if (newProgress >= 100) {
          store.commit(MUTATIONS.COMPLETE_TABLE_CRAFTING)
        }
      }
    }, 1000)
  }]
})