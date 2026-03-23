import { createStore } from 'vuex'
import towerDefenseModule from './modules/towerDefenseModule'

export default createStore({
  modules: {
    towerDefense: towerDefenseModule
  }
})