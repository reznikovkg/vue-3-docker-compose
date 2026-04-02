const MUTATIONS = {
  SET_GRID: 'SET_GRID',
  SET_SCORE: 'SET_SCORE',
  LOAD_GAME: 'LOAD_GAME',
}

export default {
  namespaced: true,

  state(){
    return {
      grid: [],
      gridSize: 8,
      score: 0
      }
  },

  getters: {
    getGrid: (state) => state.grid,
    getScore: (state) => state.score,
    getSize: (state) => state.gridSize
  },

  mutations: {
    [MUTATIONS.SET_GRID]: (state, grid) => {
      state.grid = grid
    },
    [MUTATIONS.SET_SCORE]: (state, score) => {
      state.score = score
    },

    [MUTATIONS.LOAD_GAME]: (state, data) => {
      state.grid = data.grid
      state.score = data.score
    }
  },
  actions: {
    initGame(store) {
      const saved = localStorage.getItem('game')

      if (saved) {
        store.commit(MUTATIONS.LOAD_GAME, JSON.parse(saved))
        return
      }

      const size = store.state.gridSize

      const grid = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => null)
      )

        store.commit(MUTATIONS.SET_GRID, grid)
      },

      saveGame(store) {
        localStorage.setItem('game', JSON.stringify({
          grid: store.state.grid,
          score: store.state.score
        }))
      }
  }
}