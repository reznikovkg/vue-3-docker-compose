export default {
  namespaced: true,
  state () {
    return {
      list: [1, 2, 3]
    }
  },
  getters: {
    getList: (state) => state.list,
  },
  mutations: {
    SET_LIST: (state, payload) => {
      state.list = payload
    },
  },
  actions: {
    setList: (store, payload) => {
      store.commit('SET_LIST', payload)
      // store.dispatch('list/setList', null, { root: true })
    },
  }
}
