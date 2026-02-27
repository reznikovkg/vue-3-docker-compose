const MUTATIONS = {
  HYDRATE_PROGRESS: 'HYDRATE_PROGRESS',
  SET_SELECTED_LOCATION_ID: 'SET_SELECTED_LOCATION_ID',
  INCREMENT_ATTEMPTS: 'INCREMENT_ATTEMPTS',
  INCREMENT_CATCHES: 'INCREMENT_CATCHES',
  INCREMENT_FAILS: 'INCREMENT_FAILS',
  ADD_CATCH_LOG: 'ADD_CATCH_LOG',
};

const buildInitialState = () => ({
  selectedLocationId: null,
  catchLog: [],
  stats: {
    attempts: 0,
    catches: 0,
    fails: 0,
  },
});

export default {
  namespaced: true,
  state() {
    return buildInitialState();
  },
  getters: {
    getSelectedLocationId: (state) => state.selectedLocationId,
    getCatchLog: (state) => state.catchLog,
    getStats: (state) => state.stats,
    getCatchRate: (state) => {
      if (state.stats.attempts === 0) {
        return 0;
      }

      return Number((state.stats.catches / state.stats.attempts).toFixed(2));
    },
  },
  mutations: {
    [MUTATIONS.HYDRATE_PROGRESS]: (state, payload) => {
      state.selectedLocationId = payload.selectedLocationId ?? null;
      state.catchLog = Array.isArray(payload.catchLog) ? payload.catchLog : [];
      state.stats = {
        attempts: payload.stats?.attempts ?? 0,
        catches: payload.stats?.catches ?? 0,
        fails: payload.stats?.fails ?? 0,
      };
    },
    [MUTATIONS.SET_SELECTED_LOCATION_ID]: (state, locationId) => {
      state.selectedLocationId = locationId;
    },
    [MUTATIONS.INCREMENT_ATTEMPTS]: (state) => {
      state.stats.attempts += 1;
    },
    [MUTATIONS.INCREMENT_CATCHES]: (state) => {
      state.stats.catches += 1;
    },
    [MUTATIONS.INCREMENT_FAILS]: (state) => {
      state.stats.fails += 1;
    },
    [MUTATIONS.ADD_CATCH_LOG]: (state, payload) => {
      state.catchLog.unshift(payload);
    },
  },
  actions: {
    hydrateProgress({ commit }, payload) {
      commit(MUTATIONS.HYDRATE_PROGRESS, payload || buildInitialState());
    },
    selectLocation({ commit, dispatch }, locationId) {
      commit(MUTATIONS.SET_SELECTED_LOCATION_ID, locationId);
      dispatch('gameSession/setActiveLocation', locationId, { root: true });
    },
    recordAttempt({ commit }) {
      commit(MUTATIONS.INCREMENT_ATTEMPTS);
    },
    recordCatch({ commit, dispatch }, payload) {
      commit(MUTATIONS.INCREMENT_ATTEMPTS);
      commit(MUTATIONS.INCREMENT_CATCHES);
      commit(MUTATIONS.ADD_CATCH_LOG, {
        ...payload,
        result: 'caught',
        timestamp: Date.now(),
      });
      dispatch(
        'ui/showResultPanel',
        {
          isSuccess: true,
          message: 'Fish caught.',
        },
        { root: true },
      );
    },
    recordFail({ commit, dispatch }, payload) {
      commit(MUTATIONS.INCREMENT_ATTEMPTS);
      commit(MUTATIONS.INCREMENT_FAILS);
      commit(MUTATIONS.ADD_CATCH_LOG, {
        ...payload,
        result: 'failed',
        timestamp: Date.now(),
      });
      dispatch(
        'ui/showResultPanel',
        {
          isSuccess: false,
          message: 'Fish escaped.',
        },
        { root: true },
      );
    },
    resetProgress({ commit }) {
      commit(MUTATIONS.HYDRATE_PROGRESS, buildInitialState());
    },
  },
};
