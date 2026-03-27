const MUTATIONS = {
  SHOW_RESULT_PANEL: 'SHOW_RESULT_PANEL',
  HIDE_RESULT_PANEL: 'HIDE_RESULT_PANEL'
}

const buildInitialState = () => ({
  resultPanel: {
    isOpen: false,
    isSuccess: null,
    message: ''
  }
})

export default {
  namespaced: true,
  state() {
    return buildInitialState()
  },
  getters: {
    getResultPanel: (state) => state.resultPanel
  },
  mutations: {
    [MUTATIONS.SHOW_RESULT_PANEL]: (state, payload) => {
      state.resultPanel = {
        isOpen: true,
        isSuccess: payload.isSuccess,
        message: payload.message
      }
    },
    [MUTATIONS.HIDE_RESULT_PANEL]: (state) => {
      state.resultPanel = {
        isOpen: false,
        isSuccess: null,
        message: ''
      }
    }
  },
  actions: {
    showResultPanel({ commit }, payload) {
      commit(MUTATIONS.SHOW_RESULT_PANEL, payload)
    },
    hideResultPanel({ commit }) {
      commit(MUTATIONS.HIDE_RESULT_PANEL)
    }
  }
}
