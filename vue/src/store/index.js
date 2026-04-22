import { createStore } from 'vuex'
import game from './game'

const MUTATIONS = {
  INCREMENT: 'INCREMENT',
  SET_COUNT: 'SET_COUNT',
}

export default createStore({
  state () {
    return {
      count: 0
    }
  },
  modules: {
    game
  }
})
