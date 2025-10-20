import { createStore } from 'vuex'
import game from './modules/game'
import createPersistedState from 'vuex-persistedstate'

// Главный store в соответствии с требованиями преподавателя
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

