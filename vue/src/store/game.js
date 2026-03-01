import { LOCATIONS } from '../constants'

const MUTATIONS = {
  SET_CURRENT_LOCATION_VALUE: 'SET_CURRENT_LOCATION_VALUE',
}

export default {
  namespaced: true,

  state: () => ({
    currentLocationValue: LOCATIONS[0].value,
  }),

  mutations: {
    [MUTATIONS.SET_CURRENT_LOCATION_VALUE]: (state, value) => {
      state.currentLocationValue = value
    },
  },

  getters: {
    getCurrentLocationValue: (state) => state.currentLocationValue,
  },

  actions: {
    setCurrentLocationValue(store, value) {
      store.commit(MUTATIONS.SET_CURRENT_LOCATION_VALUE, value)
    },
  },
}
