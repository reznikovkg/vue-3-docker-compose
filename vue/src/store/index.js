import { createStore } from 'vuex'
import game from './modules/game'
import board from './modules/board'
import player from './modules/player'

export default createStore({
  modules: {
    game,
    board,
    player
  }
})