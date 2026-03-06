import { createStore } from 'vuex'

const slotRecipes = [
  { 
    pattern: [
      ['fire', 'water', null],
      ['earth', 'air', null],
      [null, null, null]
    ],
    result: 'crystal',
  },
  { 
    pattern: [
      ['air', null, null],
      ['water', null, null],
      ['earth', null, null]
    ],
    result: 'plant',
  },
  { 
    pattern: [
      ['fire', null, 'air'],
      [null, null, null],
      [null, null, null]
    ],
    result: 'energy',
  },
  { 
    pattern: [
      ['fire', null, null],
      [null, 'water', null],
      [null, null, 'earth']
    ],
    result: 'metal', 
  },
  { 
    pattern: [
      ['water', null, null],
      [null, 'air', null],
      [null, null, 'fire']
    ],
    result: 'ice',
  },
  { 
    pattern: [
      ['earth', 'water', null],
      [null, 'fire', null],
      [null, null, null]
    ],
    result: 'sand',
  }
]

const tableRecipes = [
  { ingredients: { fire: 1, water: 1 }, result: 'steam' },
  { ingredients: { earth: 1, water: 1 }, result: 'mud' },
  { ingredients: { fire: 1, earth: 1 }, result: 'lava' },
  { ingredients: { lava: 1, metal: 1 }, result: 'metallic_lava' },
]

function containsPattern(matrix, pattern, startRow = 0, startCol = 0) {
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

export const store = createStore({
  state: {
    discovered: ['fire', 'water', 'earth', 'air'],
    table: {},
    slots: Array(3).fill(null).map(() => Array(3).fill(null))
  },

  getters: {
    discoveredElements: s => s.discovered,
    tableElements: s => s.table,
    slots: s => s.slots
  },

  mutations: {
    ADD_TO_TABLE(state, element) {
      state.table = {
        ...state.table,
        [element]: (state.table[element] || 0) + 1
      }
    },

    DECREASE_FROM_TABLE(state, element) {
      if (!state.table[element]) {
        return
      }

      const newCount = state.table[element] - 1
      if (newCount <= 0) {
        const { [element]: removed, ...rest } = state.table
        state.table = rest
      } else {
        state.table = {
          ...state.table,
          [element]: newCount
        }
      }
    },

    REMOVE_ELEMENT(state, element) {
      const { [element]: removed, ...rest } = state.table
      state.table = rest
    },

    CLEAR_TABLE(state) {
      state.table = {}
    },

    SET_SLOT(state, { row, col, el }) { 
      state.slots = state.slots.map((r, i) => 
        i === row 
          ? r.map((c, j) => j === col ? el : c)
          : r
      )
    },
    
    CLEAR_SLOTS(state) { 
      state.slots = Array(3).fill(null).map(() => Array(3).fill(null)) 
    },
    
    ADD_DISCOVERED(state, el) {
      if (!state.discovered.includes(el)) {
        state.discovered = [...state.discovered, el]
      }
    }
  },

  actions: {
    addToTable({ commit }, element) {
      commit('ADD_TO_TABLE', element)
    },
    decreaseFromTable({ commit }, element) {
      commit('DECREASE_FROM_TABLE', element)
    },

    removeElementCompletely({ commit }, element) {
      commit('REMOVE_ELEMENT_COMPLETELY', element)
    },

    clearTable({ commit }) {
      commit('CLEAR_TABLE')
    },

    setSlot({ commit, dispatch }, payload) {
      commit('SET_SLOT', payload)
      dispatch('checkSlotRecipes')
    },

    checkSlotRecipes({ state, commit }) {
      const foundRecipe = slotRecipes.find(recipe => containsPattern(state.slots, recipe.pattern))
      
      if (foundRecipe) {
        commit('ADD_DISCOVERED', foundRecipe.result)
        commit('CLEAR_SLOTS')
        commit('ADD_TO_TABLE', foundRecipe.result)
        return true
      }

      return false
    },

    mix({ state, commit }) {
      const table = state.table
      const tableKeys = Object.keys(table)
      
      const foundRecipe = tableRecipes.find(recipe => {
        const recipeKeys = Object.keys(recipe.ingredients)
        
        if (recipeKeys.length !== tableKeys.length) {
          return false
        }
        
        return recipeKeys.every(key => 
          table[key] === recipe.ingredients[key]
        )
      })
      
      if (foundRecipe) {
        commit('ADD_DISCOVERED', foundRecipe.result)
        commit('CLEAR_TABLE')
        commit('ADD_TO_TABLE', foundRecipe.result)
      }
    }
  }
})