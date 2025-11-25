import { createStore } from 'vuex'
import { fishingModule } from './modules/fishing'
import { gameModule } from './modules/game'
import { shopModule } from './modules/shop'

export default createStore({
  modules: {
    fishing: fishingModule,
    game: gameModule,
    shop: shopModule
  },

  strict: process.env.NODE_ENV !== 'production'
})