import { createStore } from 'vuex'
import { DictophoneModule }  from './dict/dictophone.js'
import { GameModule }  from './dict/game.js'
import GamePage from "@/components/pages/GamePage.vue";


export default createStore({
  modules: {
    dictophone: DictophoneModule,
    game: GameModule
  },
  strict: process.env.NODE_ENV !== 'production'
})

