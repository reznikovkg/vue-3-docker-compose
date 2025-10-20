import { createStore } from 'vuex'
import game from './modules/game'
import createPersistedState from 'vuex-persistedstate'

export default createStore({
  modules: {
    game
  },
  plugins: [
    createPersistedState({
      key: 'fishing-boat-game',
      paths: ['game']
    })
  ]
})

