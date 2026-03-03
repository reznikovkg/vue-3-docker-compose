const MUTATIONS = {
  SET_LIST: 'SET_LIST'
}

export default {
  namespaced: true,
  state () {
    return {
      list: [{ t: 10 }, { t: 12 }, { t: 15 }]
    }
  },
  getters: {
    getList: (state) => state.list,
    getListPower: (state) => state.list.map(i => i.t),
  },
  mutations: {
    [MUTATIONS.SET_LIST]: (state, payload) => {
      state.list = payload
    },
  },
  actions: {
    setList: (store, payload) => {
      store.commit(MUTATIONS.SET_LIST, payload)
    },
  }
}
