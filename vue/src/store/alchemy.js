import { ELEMENTS, BASE_ELEMENTS, FREE_RECIPES, SLOT_RECIPES, SLOTS_COUNT } from '@/utils/recipeBook.js'

const MUTATIONS = {
  ADD_TO_TABLE: 'ADD_TO_TABLE',
  REMOVE_FROM_TABLE: 'REMOVE_FROM_TABLE',
  RESET_TABLE: 'RESET_TABLE',
  DISCOVER_ELEMENT: 'DISCOVER_ELEMENT',
  SET_SLOT: 'SET_SLOT',
  CLEAR_SLOT: 'CLEAR_SLOT',
  CLEAR_SLOTS: 'CLEAR_SLOTS',
  SET_LAST_RESULT: 'SET_LAST_RESULT',
}

function createEmptySlots () {
  return Array(SLOTS_COUNT).fill(null)
}

// Сравнивает два объекта вида { elementId: count } на полное совпадение
function itemsEqual (a, b) {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  return aKeys.every((key) => a[key] === b[key])
}

export default {
  namespaced: true,
  state () {
    return {
      openElements: [...BASE_ELEMENTS],
      table: {},
      slots: createEmptySlots(),
      lastResult: null,
    }
  },
  getters: {
    openElements: (state) => state.openElements.map((id) => ELEMENTS[id]),
    tableItems: (state) => Object.entries(state.table).map(([id, count]) => ({ ...ELEMENTS[id], count })),
    slots: (state) => state.slots.map((id) => (id ? ELEMENTS[id] : null)),
    lastResult: (state) => state.lastResult,
  },
  mutations: {
    [MUTATIONS.ADD_TO_TABLE]: (state, elementId) => {
      const table = { ...state.table }
      table[elementId] = (table[elementId] || 0) + 1
      state.table = table
    },
    [MUTATIONS.REMOVE_FROM_TABLE]: (state, elementId) => {
      const table = { ...state.table }
      if (table[elementId] > 1) {
        table[elementId] -= 1
      } else {
        delete table[elementId]
      }
      state.table = table
    },
    [MUTATIONS.RESET_TABLE]: (state) => {
      state.table = {}
    },
    [MUTATIONS.DISCOVER_ELEMENT]: (state, elementId) => {
      if (!state.openElements.includes(elementId)) {
        state.openElements = [...state.openElements, elementId]
      }
    },
    [MUTATIONS.SET_SLOT]: (state, { index, elementId }) => {
      const slots = [...state.slots]
      slots[index] = elementId
      state.slots = slots
    },
    [MUTATIONS.CLEAR_SLOT]: (state, index) => {
      const slots = [...state.slots]
      slots[index] = null
      state.slots = slots
    },
    [MUTATIONS.CLEAR_SLOTS]: (state) => {
      state.slots = createEmptySlots()
    },
    [MUTATIONS.SET_LAST_RESULT]: (state, payload) => {
      state.lastResult = payload
    },
  },
  actions: {
    addToTable ({ commit }, elementId) {
      commit(MUTATIONS.ADD_TO_TABLE, elementId)
    },
    removeFromTable ({ commit }, elementId) {
      commit(MUTATIONS.REMOVE_FROM_TABLE, elementId)
    },
    resetTable ({ commit }) {
      commit(MUTATIONS.RESET_TABLE)
      commit(MUTATIONS.SET_LAST_RESULT, null)
    },
    mixTable ({ commit, state }) {
      const recipe = FREE_RECIPES.find((r) => itemsEqual(r.items, state.table))
      if (recipe) {
        commit(MUTATIONS.DISCOVER_ELEMENT, recipe.result)
        commit(MUTATIONS.RESET_TABLE)
        commit(MUTATIONS.SET_LAST_RESULT, { success: true, name: ELEMENTS[recipe.result].name })
      } else {
        commit(MUTATIONS.SET_LAST_RESULT, { success: false })
      }
    },
    placeInSlot ({ commit }, { index, elementId }) {
      commit(MUTATIONS.SET_SLOT, { index, elementId })
    },
    clearSlot ({ commit }, index) {
      commit(MUTATIONS.CLEAR_SLOT, index)
    },
    clearSlots ({ commit }) {
      commit(MUTATIONS.CLEAR_SLOTS)
      commit(MUTATIONS.SET_LAST_RESULT, null)
    },
    craftSlots ({ commit, state }) {
      const counts = {}
      state.slots.forEach((id) => {
        if (id) counts[id] = (counts[id] || 0) + 1
      })
      const recipe = SLOT_RECIPES.find((r) => itemsEqual(r.items, counts))
      if (recipe) {
        commit(MUTATIONS.DISCOVER_ELEMENT, recipe.result)
        commit(MUTATIONS.CLEAR_SLOTS)
        commit(MUTATIONS.SET_LAST_RESULT, { success: true, name: ELEMENTS[recipe.result].name })
      } else {
        commit(MUTATIONS.SET_LAST_RESULT, { success: false })
      }
    },
  },
}
