import { createStore } from 'vuex'
import game from './game'
import board from './board'
import player from './player'

export default createStore({
  modules: {
    game,
    board,
    player
  }
})