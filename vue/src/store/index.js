import { createStore } from 'vuex'
import figure from './figure'
import figureShapes from './figureShapes'

export default createStore({
  modules: {
    figure,
    figureShapes
  }
})
