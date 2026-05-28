import { createStore } from 'vuex'
import game from './game'

export default createStore({
  state: () => ({
    count: 0,
  }),
  modules: {
    game,
  },
})
