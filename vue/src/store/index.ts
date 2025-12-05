import { createStore } from 'vuex'
import { fishingModule } from './fishing'
import { gameModule } from './game'
import { shopModule } from './shop'

export default createStore({
  modules: {
    fishing: fishingModule,
    game: gameModule,
    shop: shopModule
  },

  strict: process.env.NODE_ENV !== 'production'
})