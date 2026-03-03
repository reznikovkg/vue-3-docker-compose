import { createStore } from 'vuex'
import { recipes } from './recipes' 

const MUTATIONS = {
  ADD_TO_TABLE: 'ADD_TO_TABLE',
  DECREASE_FROM_TABLE: 'DECREASE_FROM_TABLE',
  CLEAR_TABLE: 'CLEAR_TABLE',
  OPEN_ELEMENT: 'OPEN_ELEMENT'
}

export default createStore({
  state() {
    return {
      elements: [
        { id: 1, name: 'Огонь', picture: '/src/assets/elements/fire.png', opened: true },
        { id: 2, name: 'Вода', picture: '/src/assets/elements/water.png', opened: true },
        { id: 3, name: 'Земля', picture: '/src/assets/elements/earth.png', opened: true },
        { id: 4, name: 'Воздух', picture: '/src/assets/elements/air.png', opened: true },
        { id: 5, name: 'Пар', picture: '/src/assets/elements/steam.png', opened: false },
        { id: 6, name: 'Лава', picture: '/src/assets/elements/lava.png', opened: false },
        { id: 7, name: 'Грязь', picture: '/src/assets/elements/mud.png', opened: false },
        { id: 8, name: 'Море', picture: '/src/assets/elements/sea.png', opened: false },
        { id: 9, name: 'Энергия', picture: '/src/assets/elements/energy.png', opened: false },
        { id: 10, name: 'Туман', picture: '/src/assets/elements/fog.png', opened: false },
        { id: 11, name: 'Пыль', picture: '/src/assets/elements/dust.png', opened: false },
        { id: 12, name: 'Камень', picture: '/src/assets/elements/stone.png', opened: false },
        { id: 13, name: 'Кирпич', picture: '/src/assets/elements/brick.png', opened: false },
        { id: 14, name: 'Облако', picture: '/src/assets/elements/cloud.png', opened: false }
      ],
      table: [] // {id, count}
    }
  },

  getters: {
    openedElements: state => state.elements.filter(e => e.opened),
    tableElements: state => state.table,
    getElementById: state => id => state.elements.find(e => e.id === id)
  },

  mutations: {
    [MUTATIONS.ADD_TO_TABLE](state, id) {
      const item = state.table.find(i => i.id === id)
      if (item) {
        item.count++
      } else {
        state.table.push({ id, count: 1 })
      }
    },

    [MUTATIONS.DECREASE_FROM_TABLE](state, id) {
      const item = state.table.find(i => i.id === id)
      if (!item) return
      if (item.count > 1) {
        item.count--
      } else {
        state.table = state.table.filter(i => i.id !== id)
      }
    },

    [MUTATIONS.CLEAR_TABLE](state) {
      state.table = []
    },

    [MUTATIONS.OPEN_ELEMENT](state, id) {
      const element = state.elements.find(e => e.id === id)
      if (element) element.opened = true
    }
  },

  actions: {
    addToTable({ commit }, id) {
      commit(MUTATIONS.ADD_TO_TABLE, id)
    },

    decreaseFromTable({ commit }, id) {
      commit(MUTATIONS.DECREASE_FROM_TABLE, id)
    },

    clearTable({ commit }) {
      commit(MUTATIONS.CLEAR_TABLE)
    },

    mix({ state, commit, getters }) {
      if (state.table.length === 0) return

      const key = state.table
        .map(item => Array(item.count).fill(item.id)) 
        .flat()
        .sort((a, b) => a - b)
        .join('+')

      const resultId = recipes[key]

      if (resultId) {
        const resultElement = getters.getElementById(resultId)
        if (!resultElement.opened) {
          commit(MUTATIONS.OPEN_ELEMENT, resultId)
          alert(`Вы открыли новый элемент: ${resultElement.name}`)
        }

        commit(MUTATIONS.CLEAR_TABLE)
        commit(MUTATIONS.ADD_TO_TABLE, resultId)
      } else {
        alert('Ничего не получилось')
      }
    }
  }
})