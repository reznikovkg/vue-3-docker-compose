import { createStore } from 'vuex'
import inventory from './inventory'

export default createStore({
  modules: {
    inventory
  }
})