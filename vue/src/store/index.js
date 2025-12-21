import { createStore } from 'vuex'
import { GameModule }  from './dict/game.js'
import GamePage from "@/components/pages/GamePage.vue";


export default createStore({
  modules: {
    game: GameModule
  },
  strict: process.env.NODE_ENV !== 'production'
})

