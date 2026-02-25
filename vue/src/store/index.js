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
      if (!state.table[element]) state.table[element] = 0
      state.table[element]++
    },
    CLEAR_TABLE(state) { state.table = {} },
    ADD_DISCOVERED(state, element) {
      if (!state.discovered.includes(element)) state.discovered.push(element)
    }
  },
  actions: {
    addToTable({ commit }, element) { 
      commit('ADD_TO_TABLE', element) 
    },
    clearTable({ commit }) { 
      commit('CLEAR_TABLE') 
    },
    mix({ state, commit }) {
      const table = state.table
      const found = recipes.find(recipe => {
        const keys = Object.keys(recipe.ingredients)
        return keys.length === Object.keys(table).length &&
               keys.every(key => recipe.ingredients[key] === table[key])
      })
      if (found) {
        commit('ADD_DISCOVERED', found.result)
        commit('CLEAR_TABLE')
        commit('ADD_TO_TABLE', found.result)
      }
    }
  }
})