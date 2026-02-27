import { GAME_CONFIG } from '@/game-config';

const MUTATIONS = {
  SET_CONTENT: 'SET_CONTENT',
};

const buildInitialState = () => ({
  locations: GAME_CONFIG.locations,
  fishDefinitions: GAME_CONFIG.fishDefinitions,
  fishTables: GAME_CONFIG.fishTables,
  tuning: GAME_CONFIG.tuning,
});

export default {
  namespaced: true,
  state() {
    return buildInitialState();
  },
  getters: {
    getLocations: (state) => state.locations,
    getFishDefinitions: (state) => state.fishDefinitions,
    getFishTables: (state) => state.fishTables,
    getTuning: (state) => state.tuning,
    getLocationById: (state) => (locationId) =>
      state.locations.find((location) => location.id === locationId) || null,
  },
  mutations: {
    [MUTATIONS.SET_CONTENT]: (state, payload) => {
      state.locations = payload.locations;
      state.fishDefinitions = payload.fishDefinitions;
      state.fishTables = payload.fishTables;
      state.tuning = payload.tuning;
    },
  },
  actions: {
    resetContent({ commit }) {
      commit(MUTATIONS.SET_CONTENT, buildInitialState());
    },
  },
};
