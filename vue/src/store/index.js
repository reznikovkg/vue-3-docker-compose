import { createStore } from 'vuex'
import game from './game/index.js'

export default createStore({
  modules: {
    game
  }
})
