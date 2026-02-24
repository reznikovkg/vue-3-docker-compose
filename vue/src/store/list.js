const MUTATIONS = {
  SET_LIST: 'SET_LIST'
}

export default {
  namespaced: true,

  state: () => ({
    list: []
  }),

  mutations: {
    [MUTATIONS.SET_LIST](state, payload) {
      state.list = payload
    }
  },

  actions: {
    setList({ commit }, payload) {
      commit(MUTATIONS.SET_LIST, payload)
    }
  },

  getters: {
    getList: (state) => state.list,
    getListPower: (state) => state.list.reduce((acc, item) => acc + item.t, 0)
  /*    },
  mutations: {
    SET_LIST: (state, payload) => {
      state.list = payload
    },
  },
  actions: {
    setList: (store, payload) => {
      store.commit('SET_LIST', payload)
      // store.dispatch('list/setList', null, { root: true })
    },*/
  }
}
