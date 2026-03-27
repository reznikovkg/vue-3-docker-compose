const MAX_LAYERS = 4;
const BOTTLE_COUNT = 5;
const COLORS = ['#FF40A0', '#00FFFF', '#FFFDD0'];

const MUTATIONS = {
    SET_START_GAME: 'SET_START_GAME',
    SET_SELECTED_BOTTLE: 'SET_SELECTED_BOTTLE',
    SET_BOTTLES: 'SET_BOTTLES',
}

export default {
  namespaced: true,
  state() {
    return {
      bottles: [],
      selectedBottleIndex: null,
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
    }
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
    }
  },
  actions: {
    initGame({commit}) {
      let allLayers = [];
      COLORS.forEach(color => {
        for (let i = 0; i < MAX_LAYERS; i++) allLayers.push(color);
      });
      allLayers.sort(() => Math.random() - 0.5);
      const bottles = [];
      for (let i = 0; i < BOTTLE_COUNT; i++) {
        bottles.push(i < COLORS.length ? allLayers.splice(0, MAX_LAYERS) : []);
      }
      commit(MUTATIONS.SET_START_GAME, bottles);
    },
    handleBottleClick({ state, commit }, index) {
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
        }
        commit(MUTATIONS.SET_SELECTED_BOTTLE, null);
      }
    }
  }
}