import { createStore } from 'vuex'

const recipes = [
  { ingredients: { fire: 1, water: 1 }, result: 'steam' },
  { ingredients: { earth: 1, water: 1 }, result: 'mud' },
  { ingredients: { fire: 1, earth: 1 }, result: 'lava' }
]

export const store = createStore({
  state: {
    discovered: ['fire', 'water', 'earth', 'air'],
    table: {}
  },

  getters: {
    discoveredElements: state => state.discovered,
    tableElements: state => state.table
  },

  mutations: {
    ADD_TO_TABLE(state, element) {
      if (!state.table[element]) {
        state.table[element] = 0
      }
      
      state.table[element]++
    },

    DECREASE_FROM_TABLE(state, element) {
      if (!state.table[element]) {
        return
      }

      state.table[element]--

      if (state.table[element] <= 0) {
        delete state.table[element]
      }
    },

    REMOVE_ELEMENT_COMPLETELY(state, element) {
      delete state.table[element]
    },

    CLEAR_TABLE(state) {
      state.table = {}
    },

    ADD_DISCOVERED(state, element) {
      if (!state.discovered.includes(element)) {
        state.discovered.push(element)
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

    mix({ state, commit }) {
      const table = state.table

      const found = recipes.find(recipe => {
        const recipeKeys = Object.keys(recipe.ingredients)
        const tableKeys = Object.keys(table)

        return (
          recipeKeys.length === tableKeys.length &&
          recipeKeys.every(key => recipe.ingredients[key] === table[key])
        )
      })

      if (found) {
        commit('ADD_DISCOVERED', found.result)
        commit('CLEAR_TABLE')
        commit('ADD_TO_TABLE', found.result)
      }
    }
  }
})