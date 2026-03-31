import { createStore } from 'vuex'

export default createStore({
  namespaced: true,
  state() {
    return {
      boat: {
        x: 0,
        y: 0,
        speed: 1
      },
      inventory: {
        fish: 0
      }
    }
  }
})
