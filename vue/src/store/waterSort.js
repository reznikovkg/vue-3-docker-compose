const MAX_LAYERS = 4;
const COLORS_EASY = ['#FF40A0', '#00FFFF', '#FFFDD0'];
const COLORS_HARD = ['#FF40A0', '#00FFFF', '#FFFDD0', '#32CD32', '#8A2BE2'];

const MUTATIONS = {
  SET_START_GAME: 'SET_START_GAME',
  SET_SELECTED_BOTTLE: 'SET_SELECTED_BOTTLE',
  SET_BOTTLES: 'SET_BOTTLES',
  TICK_TIMER: 'TICK_TIMER',
  SET_TIMER_TO_ZERO: 'SET_TIMER_TO_ZERO',
  ADD_RECORD: 'ADD_RECORD',
  SET_RECORDS: 'SET_RECORDS',
  SET_HARD_MODE: 'SET_HARD_MODE',
  SET_BLOCKED_BOTTLE: 'SET_BLOCKED_BOTTLE',
  SET_TIMER_RUNNING: 'SET_TIMER_RUNNING'
}

export default {
  namespaced: true,
  state() {
    return {
      bottles: [],
      selectedBottleIndex: null,
      time: 0,
      records: {easy: [], hard: []},
      isHardMode: false,
      blockedBottleIndex: null,
      isTimerRunning: false
    }
  },
  getters: {
    getBottle: (state) => state.bottles,
    getSelected: (state) => state.selectedBottleIndex,
    isWin: (state) => {
      if (state.bottles.length === 0) return false;
      return state.bottles.every(b =>
          b.length === 0 || (b.length === MAX_LAYERS && b.every(color => color === b[0]))
      );
    },
    getTime: (state) => state.time,
    getFormattedTime: (state) => {
      const m = Math.floor(state.time / 60).toString().padStart(2, '0');
      const s = (state.time % 60).toString().padStart(2, '0');
      return `${m}:${s}`
    },
    getRecords: (state) => state.records,
    getIsHardMode: (state) => state.isHardMode,
    getBlockedBottle: (state) => state.blockedBottleIndex,
    getIsTimerRunning: (state) => state.isTimerRunning
  },
  mutations: {
    [MUTATIONS.SET_START_GAME]: (state, payload) => {
      state.bottles = payload;
      state.selectedBottleIndex = null;
    },
    [MUTATIONS.SET_SELECTED_BOTTLE]: (state, index) => {
      state.selectedBottleIndex = index;
    },
    [MUTATIONS.SET_BOTTLES]: (state, newBottles) => {
      state.bottles = newBottles;
    },
    [MUTATIONS.TICK_TIMER]: (state) => {
      state.time++;
    },
    [MUTATIONS.SET_TIMER_TO_ZERO]: (state) => {
      state.time = 0;
    },
    [MUTATIONS.ADD_RECORD]: (state, time) => {
      const mode = state.isHardMode ? 'hard' : 'easy';
      if (!state.records[mode].includes(time)) {
        state.records[mode].push(time);
        state.records[mode].sort((a, b) => a - b);
        state.records[mode] = state.records[mode].slice(0, 10);
      }
    },
    [MUTATIONS.SET_RECORDS]: (state, payload) => {
      state.records = payload;
    },
    [MUTATIONS.SET_HARD_MODE]: (state, val) => {
      state.isHardMode = val;
    },
    [MUTATIONS.SET_BLOCKED_BOTTLE]: (state, index) => {
      state.blockedBottleIndex = index;
    },
    [MUTATIONS.SET_TIMER_RUNNING]: (state, val) => {
      state.isTimerRunning = val;
    }
  },
  actions: {
    initGame: ({commit, state})=> {
      commit(MUTATIONS.SET_TIMER_TO_ZERO);
      commit(MUTATIONS.SET_TIMER_RUNNING, false);
      const colors = state.isHardMode ? COLORS_HARD : COLORS_EASY;
      let allLayers = []
      colors.forEach(color => {
        for (let i = 0; i < MAX_LAYERS; i++) {
          allLayers.push(color);
        }
      });
      allLayers.sort(() => Math.random() - 0.5);
      const bottles = [];
      const countBottles = colors.length + 2;
      for (let i = 0; i < countBottles; i++) {
        bottles.push(i < colors.length ? allLayers.splice(0, MAX_LAYERS) : []);
      }
      commit(MUTATIONS.SET_START_GAME, bottles);
      commit(MUTATIONS.SET_BLOCKED_BOTTLE, null);
    },
    handleBottleClick: ({commit, state, getters}, index) => {
      if (!state.isTimerRunning) {
        commit(MUTATIONS.SET_TIMER_RUNNING, true);
      }
      if (state.isHardMode && index === state.blockedBottleIndex) {
        return;
      }
      const selected = state.selectedBottleIndex;
      if (selected === null) {
        if (state.bottles[index].length > 0) {
          commit(MUTATIONS.SET_SELECTED_BOTTLE, index);
        }
      } else {
        if (selected === index) {
          commit(MUTATIONS.SET_SELECTED_BOTTLE, null);
          return;
        }
        const source = [...state.bottles[selected]];
        const target = [...state.bottles[index]];
        const colorToMove = source[source.length - 1];
        if (target.length < MAX_LAYERS && (target.length === 0
            || target[target.length - 1] === colorToMove)) {
          let count = 0;
          for (let i = source.length - 1; i >= 0; i--) {
            if (source[i] === colorToMove) count++;
            else break;
          }
          const spaceLeft = MAX_LAYERS - target.length;
          const amount = Math.min(count, spaceLeft);
          for (let i = 0; i < amount; i++) {
            target.push(source.pop());
          }
          const newBottles = [...state.bottles];
          newBottles[selected] = source;
          newBottles[index] = target;
          commit(MUTATIONS.SET_BOTTLES, newBottles);
          commit(MUTATIONS.SET_SELECTED_BOTTLE, null);
          if (state.isHardMode) {
            commit(MUTATIONS.SET_BLOCKED_BOTTLE, Math.floor(Math.random() * state.bottles.length));
          }
          if (getters.isWin) {
            commit(MUTATIONS.ADD_RECORD, state.time);
            commit(MUTATIONS.SET_TIMER_RUNNING, false);
          }
        } else {
          commit(MUTATIONS.SET_SELECTED_BOTTLE, index);
        }
      }
    },
    toggleHardMode: ({state, commit, dispatch}) => {
      commit(MUTATIONS.SET_HARD_MODE, !state.isHardMode);
      dispatch('initGame');
    },
    tickTimer: ({commit}) => {
      commit(MUTATIONS.TICK_TIMER);
    },
    moveBottle({ state, commit }, { fromIndex, toIndex }) {
      const newBottles = [...state.bottles];
      const movedBottle = newBottles.splice(fromIndex, 1)[0];
      newBottles.splice(toIndex, 0, movedBottle);
      commit(MUTATIONS.SET_BOTTLES, newBottles);
      if (state.blockedBottleIndex !== null) {
        if (state.blockedBottleIndex === fromIndex) {
          commit(MUTATIONS.SET_BLOCKED_BOTTLE, toIndex);
        } else if (state.blockedBottleIndex === toIndex) {
          if (fromIndex < toIndex) {
            commit(MUTATIONS.SET_BLOCKED_BOTTLE, toIndex - 1);
          } else {
            commit(MUTATIONS.SET_BLOCKED_BOTTLE, toIndex + 1);
          }
        } else if (fromIndex < state.blockedBottleIndex && toIndex >= state.blockedBottleIndex) {
          commit(MUTATIONS.SET_BLOCKED_BOTTLE, state.blockedBottleIndex - 1);
        } else if (fromIndex > state.blockedBottleIndex && toIndex <= state.blockedBottleIndex) {
          commit(MUTATIONS.SET_BLOCKED_BOTTLE, state.blockedBottleIndex + 1);
        }
      }
    },
  }
}