const PHASES = Object.freeze({
  IDLE: 'idle',
  CASTING: 'casting',
  WAITING_BITE: 'waitingBite',
  MINIGAME: 'minigame',
  RESULT: 'result',
});

const MUTATIONS = {
  RESET_SESSION: 'RESET_SESSION',
  SET_ACTIVE_LOCATION_ID: 'SET_ACTIVE_LOCATION_ID',
  SET_PHASE: 'SET_PHASE',
  START_CAST: 'START_CAST',
  SET_ENCOUNTER: 'SET_ENCOUNTER',
  SET_MINIGAME_STATE: 'SET_MINIGAME_STATE',
  SET_RESULT: 'SET_RESULT',
};

const buildInitialState = () => ({
  phase: PHASES.IDLE,
  activeLocationId: null,
  castStartedAt: null,
  encounter: null,
  minigame: {
    greenProgress: 0,
    redProgress: 0,
    isReeling: false,
    activeBarrierIndex: 0,
    barrierClicksDone: 0,
  },
  result: null,
});

export default {
  namespaced: true,
  state() {
    return buildInitialState();
  },
  getters: {
    getPhases: () => PHASES,
    getPhase: (state) => state.phase,
    getActiveLocationId: (state) => state.activeLocationId,
    getEncounter: (state) => state.encounter,
    getMinigameState: (state) => state.minigame,
    getResult: (state) => state.result,
  },
  mutations: {
    [MUTATIONS.RESET_SESSION]: (state) => {
      const initialState = buildInitialState();
      state.phase = initialState.phase;
      state.activeLocationId = initialState.activeLocationId;
      state.castStartedAt = initialState.castStartedAt;
      state.encounter = initialState.encounter;
      state.minigame = initialState.minigame;
      state.result = initialState.result;
    },
    [MUTATIONS.SET_ACTIVE_LOCATION_ID]: (state, locationId) => {
      state.activeLocationId = locationId;
    },
    [MUTATIONS.SET_PHASE]: (state, phase) => {
      state.phase = phase;
    },
    [MUTATIONS.START_CAST]: (state, timestamp) => {
      state.phase = PHASES.WAITING_BITE;
      state.castStartedAt = timestamp;
      state.result = null;
      state.encounter = null;
    },
    [MUTATIONS.SET_ENCOUNTER]: (state, encounter) => {
      state.encounter = encounter;
    },
    [MUTATIONS.SET_MINIGAME_STATE]: (state, nextState) => {
      state.minigame = {
        ...state.minigame,
        ...nextState,
      };
    },
    [MUTATIONS.SET_RESULT]: (state, result) => {
      state.result = result;
      state.phase = PHASES.RESULT;
    },
  },
  actions: {
    setActiveLocation({ commit }, locationId) {
      commit(MUTATIONS.SET_ACTIVE_LOCATION_ID, locationId);
    },
    enterPhase({ commit }, phase) {
      commit(MUTATIONS.SET_PHASE, phase);
    },
    startCast({ commit }) {
      commit(MUTATIONS.START_CAST, Date.now());
    },
    setEncounter({ commit }, encounter) {
      commit(MUTATIONS.SET_ENCOUNTER, encounter);
    },
    setMinigameState({ commit }, nextState) {
      commit(MUTATIONS.SET_MINIGAME_STATE, nextState);
    },
    setResult({ commit }, result) {
      commit(MUTATIONS.SET_RESULT, result);
    },
    resetSession({ commit }) {
      commit(MUTATIONS.RESET_SESSION);
    },
  },
};
