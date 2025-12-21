export default {
  namespaced: true,
  state() {
    return {
      config: {
        colorCount: 5,
        targetColor: "#FF4757",
        intensity: 0.8,
        correctScore: 1,
        wrongScore: -5,
      },
      isPlaying: false,
      currentScore: 0,
      finalScore: null,
      gameHistory: [],
    };
  },
  getters: {
    getConfig: (state) => state.config,
    getIsPlaying: (state) => state.isPlaying,
    getCurrentScore: (state) => state.currentScore,
    getFinalScore: (state) => state.finalScore,
    getGameHistory: (state) => state.gameHistory,
    hasResult: (state) => state.finalScore !== null,
    gamesCount: (state) => state.gameHistory.length,
    bestScore: (state) => {
      if (state.gameHistory.length === 0) return 0;
      return Math.max(...state.gameHistory.map((g) => g.score));
    },
    averageScore: (state) => {
      if (state.gameHistory.length === 0) return 0;
      const sum = state.gameHistory.reduce((acc, g) => acc + g.score, 0);
      return Math.round(sum / state.gameHistory.length);
    },
  },
  mutations: {
    SET_CONFIG: (state, payload) => {
      state.config = { ...state.config, ...payload };
    },
    SET_IS_PLAYING: (state, payload) => {
      state.isPlaying = payload;
    },
    SET_CURRENT_SCORE: (state, payload) => {
      state.currentScore = payload;
    },
    SET_FINAL_SCORE: (state, payload) => {
      state.finalScore = payload;
    },
    ADD_GAME_HISTORY: (state, payload) => {
      state.gameHistory.push(payload);
    },
    CLEAR_GAME_HISTORY: (state) => {
      state.gameHistory = [];
    },
  },
  actions: {
    updateConfig: (store, payload) => {
      store.commit("SET_CONFIG", payload);
    },
    startGame: (store) => {
      store.commit("SET_IS_PLAYING", true);
      store.commit("SET_CURRENT_SCORE", 0);
      store.commit("SET_FINAL_SCORE", null);
    },
    stopGame: (store) => {
      store.commit("SET_IS_PLAYING", false);
      store.commit("SET_FINAL_SCORE", store.state.currentScore);
      store.dispatch("saveGameResult");
    },
    finishGame: (store, score) => {
      store.commit("SET_IS_PLAYING", false);
      store.commit("SET_FINAL_SCORE", score);
      store.dispatch("saveGameResult");
    },
    updateScore: (store, score) => {
      store.commit("SET_CURRENT_SCORE", score);
    },
    resetResult: (store) => {
      store.commit("SET_FINAL_SCORE", null);
    },
    saveGameResult: (store) => {
      store.commit("ADD_GAME_HISTORY", {
        score: store.state.finalScore,
        config: { ...store.state.config },
        timestamp: Date.now(),
      });
    },
    clearHistory: (store) => {
      store.commit("CLEAR_GAME_HISTORY");
    },
  },
};
