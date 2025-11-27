import { createStore } from 'vuex'
import list from './list'

const MUTATIONS = {
  INCREMENT: 'INCREMENT',
  SET_COUNT: 'SET_COUNT',
}

export default createStore({
<<<<<<< Updated upstream
  state () {
    return {
      count: 0
    }
  },
=======
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
    },
    UPDATE_BUBBLE_POSITION(state, { id, x, y }) {
      const bubble = state.bubbles.find(b => b.id === id);
      if (bubble) {
        bubble.x = x;
        bubble.y = y;
      }
    }
  },

  actions: {
    spawnBubble({ commit }, { areaWidth, colorsCount }) {
      const palette = ["red", "blue", "yellow", "green", "pink", "orange"];
      const sizes = ['large', 'medium', 'small'];
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      
      // Définir les tailles et vitesses selon la taille
      const sizeConfig = {
        large: { diameter: 80, speed: 0.5 + Math.random() * 1 },
        medium: { diameter: 50, speed: 1 + Math.random() * 1.5 },
        small: { diameter: 30, speed: 1.5 + Math.random() * 2 }
      };
      
      const config = sizeConfig[size];
      
      const bubble = {
        id: crypto.randomUUID(),
        color: palette[Math.floor(Math.random() * colorsCount)],
        x: Math.random() * (areaWidth - config.diameter),
        y: -config.diameter,
        speed: config.speed,
        size: size,
        diameter: config.diameter
      };
      commit("ADD_BUBBLE", bubble);
    },

    moveBubbles({ state, commit }) {
      state.bubbles.forEach(bubble => {
        const newY = bubble.y + bubble.speed;
        commit("UPDATE_BUBBLE_POSITION", {
          id: bubble.id,
          x: bubble.x,
          y: newY
        });
      });
    },

    handleClick({ state, commit, dispatch }, { x, y, scoreGood, scoreBad }) {
      const clickedBubble = state.bubbles.find(bubble => {
        const radius = bubble.diameter / 2;
        const centerX = bubble.x + radius;
        const centerY = bubble.y + radius;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        return distance <= radius;
      });

      if (clickedBubble) {
        // Appliquer l'effet de répulsion
        dispatch("applyRepulsion", { poppedBubble: clickedBubble, areaWidth: 1100, areaHeight: 750 });
        
        // Gestion du score et création des bulles filles
        if (clickedBubble.color === state.targetColor) {
          // Bonne couleur - créer des bulles filles
          dispatch("createChildBubbles", { parentBubble: clickedBubble, colorsCount: 5 });
          commit("UPDATE_SCORE", scoreGood);
        } else {
          // Mauvaise couleur - pénalité
          let penalty = 0;
          switch (clickedBubble.size) {
            case 'large': penalty = -5; break;
            case 'medium': penalty = -3; break;
            case 'small': penalty = -1; break;
          }
          commit("UPDATE_SCORE", penalty);
        }
        
        // Supprimer la bulle cliquée
        commit("REMOVE_BUBBLE", clickedBubble.id);
      }
    },

    createChildBubbles({ commit, state }, { parentBubble, colorsCount }) {
      const palette = ["red", "blue", "yellow", "green", "pink", "orange"];
      
      if (parentBubble.size === 'large') {
        // Créer 3 bulles moyennes
        const angleStep = (2 * Math.PI) / 3;
        const distance = 60; // Distance du centre
        
        for (let i = 0; i < 3; i++) {
          const angle = i * angleStep;
          const x = parentBubble.x + Math.cos(angle) * distance;
          const y = parentBubble.y + Math.sin(angle) * distance;
          
          // Une bulle de la même couleur, les autres de couleurs différentes
          const color = i === 0 ? parentBubble.color : palette[Math.floor(Math.random() * colorsCount)];
          
          const bubble = {
            id: crypto.randomUUID(),
            color: color,
            x: x,
            y: y,
            speed: 1 + Math.random() * 1.5,
            size: 'medium',
            diameter: 50
          };
          commit("ADD_BUBBLE", bubble);
        }
      } else if (parentBubble.size === 'medium') {
        // Créer 5 bulles petites
        const angleStep = (2 * Math.PI) / 5;
        const distance = 40; // Distance du centre
        
        for (let i = 0; i < 5; i++) {
          const angle = i * angleStep;
          const x = parentBubble.x + Math.cos(angle) * distance;
          const y = parentBubble.y + Math.sin(angle) * distance;
          
          // Une bulle de la même couleur, les autres de couleurs différentes
          const color = i === 0 ? parentBubble.color : palette[Math.floor(Math.random() * colorsCount)];
          
          const bubble = {
            id: crypto.randomUUID(),
            color: color,
            x: x,
            y: y,
            speed: 1.5 + Math.random() * 2,
            size: 'small',
            diameter: 30
          };
          commit("ADD_BUBBLE", bubble);
        }
      }
      // Les petites bulles ne créent pas de bulles filles
    },

    applyRepulsion({ state, commit }, { poppedBubble, areaWidth, areaHeight }) {
      const repulsionDistances = {
        large: { large: 80, medium: 120, small: 160 },
        medium: { large: 40, medium: 80, small: 120 },
        small: { large: 20, medium: 40, small: 80 }
      };
      
      state.bubbles.forEach(bubble => {
        if (bubble.id === poppedBubble.id) return;
        
        const dx = bubble.x - poppedBubble.x;
        const dy = bubble.y - poppedBubble.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const repulsionDistance = repulsionDistances[poppedBubble.size][bubble.size];
        
        if (distance < repulsionDistance) {
          const force = (repulsionDistance - distance) / repulsionDistance;
          const angle = Math.atan2(dy, dx);
          
          const newX = Math.max(0, Math.min(bubble.x + Math.cos(angle) * force * 20, areaWidth - bubble.diameter));
          const newY = Math.max(0, Math.min(bubble.y + Math.sin(angle) * force * 20, areaHeight - bubble.diameter));
          
          commit("UPDATE_BUBBLE_POSITION", {
            id: bubble.id,
            x: newX,
            y: newY
          });
        }
      });
    },

    checkBubbleLoss({ state, commit }, { areaHeight }) {
      state.bubbles.forEach(bubble => {
        if (bubble.y + bubble.diameter >= areaHeight) {
          // Bulle perdue - appliquer pénalité si c'est la bonne couleur
          if (bubble.color === state.targetColor) {
            let penalty = 0;
            switch (bubble.size) {
              case 'large': penalty = -10; break;
              case 'medium': penalty = -6; break;
              case 'small': penalty = -3; break;
            }
            commit("UPDATE_SCORE", penalty);
          }
          commit("REMOVE_BUBBLE", bubble.id);
        }
      });
    }
  },

>>>>>>> Stashed changes
  getters: {
    getCount: (state) => state.count,
    getCount2: (state) => state.count * 2,
    // getList: (state) => [4, 3]
  },
  mutations: {
    [MUTATIONS.INCREMENT]: (state, value) => {
      state.count += value
    },
    [MUTATIONS.SET_COUNT]: (state, value) => {
      state.count = value
    },
  },
  actions: {
    runIncrement: (store, value) => {
      store.commit(MUTATIONS.INCREMENT, value)
    },
    setCount: (store, payload) => {
      const { value, timeout = 0 } = payload
      setTimeout(() => {
        store.commit(MUTATIONS.SET_COUNT, value)
      }, timeout)
    },
  },
  modules: {
    list
  }
<<<<<<< Updated upstream
})
=======
});
>>>>>>> Stashed changes
