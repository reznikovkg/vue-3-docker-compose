import { createStore } from 'vuex'
import { SLOT_RECIPES, TABLE_RECIPES } from '../config/recipes'

export const MUTATIONS = {
  ADD_TO_TABLE: 'ADD_TO_TABLE',
  DECREASE_FROM_TABLE: 'DECREASE_FROM_TABLE',
  REMOVE_ELEMENT_COMPLETELY: 'REMOVE_ELEMENT_COMPLETELY',
  CLEAR_TABLE: 'CLEAR_TABLE',
  SET_SLOT: 'SET_SLOT',
  CLEAR_SLOTS: 'CLEAR_SLOTS',
  ADD_DISCOVERED: 'ADD_DISCOVERED'
}

export const ACTIONS = {
  ADD_TO_TABLE: 'addToTable',
  DECREASE_FROM_TABLE: 'decreaseFromTable',
  REMOVE_ELEMENT_COMPLETELY: 'removeElementCompletely',
  CLEAR_TABLE: 'clearTable',
  SET_SLOT: 'setSlot',
  CHECK_SLOT_RECIPES: 'checkSlotRecipes',
  MIX: 'mix'
}

export const GETTERS = {
  DISCOVERED_ELEMENTS: 'discoveredElements',
  TABLE_ELEMENTS: 'tableElements',
  SLOTS: 'slots'
}

const containsPattern = (matrix, pattern, startRow = 0, startCol = 0) => {
  const rows = matrix.length
  const cols = matrix[0].length
  const pRows = pattern.length
  const pCols = pattern[0].length

  if (startRow > rows - pRows) {
    return false
  }

  if (startCol > cols - pCols) {
    return containsPattern(matrix, pattern, startRow + 1, 0)
  }

  const isMatch = pattern.every((patternRow, i) => 
    patternRow.every((patternValue, j) => {
      if (patternValue === null) {
        return true
      }

      return matrix[startRow + i]?.[startCol + j] === patternValue
    })
  )

  return isMatch || containsPattern(matrix, pattern, startRow, startCol + 1)
}

const toMatrix = (arr) => [
  arr.slice(0,3),
  arr.slice(3,6),
  arr.slice(6,9)
]

export const store = createStore({
  state: {
    discovered:[1,2,3,4],
    table: {},
    slots: Array(9).fill(null)
  },

  getters: {
    [GETTERS.DISCOVERED_ELEMENTS]: (state) => state.discovered,
    [GETTERS.TABLE_ELEMENTS]: (state) => state.table,
    [GETTERS.SLOTS]: (state) => state.slots
  },

  mutations:{
    [MUTATIONS.ADD_TO_TABLE]: (state, id) => {
      state.table = {
        ...state.table,
        [id]:(state.table[id]||0)+1
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
    },

    [MUTATIONS.REMOVE_ELEMENT_COMPLETELY]: (state, id) => {
      const {[id]:removed, ...rest} = state.table
      state.table = rest
    },

    [MUTATIONS.CLEAR_TABLE]: (state) => {
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

    [ACTIONS.SET_SLOT]: ({ commit, dispatch }, payload) => {
      commit(MUTATIONS.SET_SLOT, payload)
      dispatch(ACTIONS.CHECK_SLOT_RECIPES)
    },

    [ACTIONS.CHECK_SLOT_RECIPES]: ({ state, commit }) => {
      const matrix = toMatrix(state.slots)
      const foundRecipe = SLOT_RECIPES.find(recipe => 
        containsPattern(matrix, recipe.pattern)
      )

      if (foundRecipe) {
        commit(MUTATIONS.ADD_DISCOVERED, foundRecipe.result)
        commit(MUTATIONS.CLEAR_SLOTS)
        commit(MUTATIONS.ADD_TO_TABLE, foundRecipe.result)
        return true
      }

      return false
    },

    [ACTIONS.MIX]: ({ state, commit }) => {
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
        commit(MUTATIONS.ADD_DISCOVERED, foundRecipe.result)
        commit(MUTATIONS.CLEAR_TABLE)
        commit(MUTATIONS.ADD_TO_TABLE, foundRecipe.result)
      }
    }
  }
})