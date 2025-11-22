import { createStore } from "vuex";

export default createStore({
  state: {
    bubbles: [],
    score: 0,
    targetColor: "red",
  },

  mutations: {
    ADD_BUBBLE(state, bubble) {
      state.bubbles.push(bubble);
    },
    REMOVE_BUBBLE(state, id) {
      state.bubbles = state.bubbles.filter(b => b.id !== id);
    },
    UPDATE_SCORE(state, value) {
      state.score += value;
    },
    RESET_SCORE(state) {
      state.score = 0;
    },
    SET_TARGET_COLOR(state, color) {
      state.targetColor = color;
    }
  },

  actions: {
    spawnBubble({ commit }, { areaWidth, colorsCount }) {
      const palette = ["red", "blue", "yellow", "green", "pink", "orange"];
      const bubble = {
        id: crypto.randomUUID(),
        color: palette[Math.floor(Math.random() * colorsCount)],
        x: Math.random() * (areaWidth - 60),
        y: -60,
        speed: 1 + Math.random() * 2
      };
      commit("ADD_BUBBLE", bubble);
    },

    moveBubbles({ state }) {
      state.bubbles.forEach(b => (b.y += b.speed));
    },

    handleClick({ state, commit }, { x, y, scoreGood, scoreBad }) {
      const popped = state.bubbles.filter(b => (
        x >= b.x && x <= b.x + 60 &&
        y >= b.y && y <= b.y + 60
      ));

      popped.forEach(bubble => {
        commit("REMOVE_BUBBLE", bubble.id);
        commit("UPDATE_SCORE",
          bubble.color === state.targetColor ? scoreGood : scoreBad
        );
      });
    }
  },

  getters: {
    score: state => state.score,
    bubbles: state => state.bubbles,
    targetColor: state => state.targetColor
  }
});
