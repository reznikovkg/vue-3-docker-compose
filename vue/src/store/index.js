import { createStore } from "vuex";
export default createStore({
  state: {
    bubbles: [],
    score: 0,
    targetColor: "red",
    areaWidth: 1100,
    areaHeight: 750
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
    },
    CLEAR_BUBBLES(state) {
      state.bubbles = [];
    },
    SET_AREA_DIMENSIONS(state, { width, height }) {
      state.areaWidth = width;
      state.areaHeight = height;
    }
  },
  actions: {
    spawnBubble({ commit, state }, { colorsCount }) {
      const generateRandomColor = () => {
        const h = Math.floor(Math.random() * 360);
        const s = 70 + Math.random() * 30;
        const l = 50 + Math.random() * 30;
        return `hsl(${h}, ${s}%, ${l}%)`;
      };
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
        color: generateRandomColor(),
        x: Math.random() * (state.areaWidth - config.diameter),
        y: -config.diameter,
        speed: config.speed,
        drift: (Math.random() - 0.5) * 2,
        size: size,
        diameter: config.diameter
      };
      commit("ADD_BUBBLE", bubble);
    },
    moveBubbles({ state, commit }) {
      state.bubbles.forEach(bubble => {
        let newY = bubble.y + bubble.speed;
        let newX = bubble.x + bubble.drift;

        // Rebond aux bords
        if (newX <= 0 || newX + bubble.diameter >= state.areaWidth) {
          bubble.drift = -bubble.drift;
          newX = bubble.x + bubble.drift;
        }

        // Limiter aux bords (sécurité)
        newX = Math.max(0, Math.min(newX, state.areaWidth - bubble.diameter));
        newY = Math.max(-bubble.diameter, Math.min(newY, state.areaHeight - bubble.diameter));

        commit("UPDATE_BUBBLE_POSITION", {
          id: bubble.id,
          x: newX,
          y: newY
        });
      });
    },
    handleClick({ state, commit, dispatch }, { x, y, scoreGood, scoreBad }) {
      const clickedBubbles = state.bubbles.filter(bubble => {
        const radius = bubble.diameter / 2;
        const centerX = bubble.x + radius;
        const centerY = bubble.y + radius;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        return distance <= radius;
      });

      clickedBubbles.forEach(clickedBubble => {
        // Appliquer l'effet de répulsion
        dispatch("applyRepulsion", { poppedBubble: clickedBubble });
       
        // Gestion du score et création des bulles filles
        if (clickedBubble.color === state.targetColor) {
          // Bonne couleur
          dispatch("createChildBubbles", { parentBubble: clickedBubble });
          commit("UPDATE_SCORE", scoreGood);
        } else {
          // Mauvaise couleur - pénalité + enfants quand même
          dispatch("createChildBubbles", { parentBubble: clickedBubble });
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
      });
    },
    createChildBubbles({ commit, state }, { parentBubble }) {
      const generateRandomColor = () => {
        const h = Math.floor(Math.random() * 360);
        const s = 70 + Math.random() * 30;
        const l = 50 + Math.random() * 30;
        return `hsl(${h}, ${s}%, ${l}%)`;
      };
     
      if (parentBubble.size === 'large') {
        // Créer 3 bulles moyennes
        const angleStep = (2 * Math.PI) / 3;
        const distance = 60; // Distance du centre
       
        for (let i = 0; i < 3; i++) {
          const angle = i * angleStep;
          const x = parentBubble.x + Math.cos(angle) * distance;
          const y = parentBubble.y + Math.sin(angle) * distance;
         
          // Une bulle de la même couleur, les autres aléatoires
          const color = i === 0 ? parentBubble.color : generateRandomColor();
         
          const bubble = {
            id: crypto.randomUUID(),
            color: color,
            x: x,
            y: y,
            speed: 1 + Math.random() * 1.5,
            drift: (Math.random() - 0.5) * 2,
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
         
          // Une bulle de la même couleur, les autres aléatoires
          const color = i === 0 ? parentBubble.color : generateRandomColor();
         
          const bubble = {
            id: crypto.randomUUID(),
            color: color,
            x: x,
            y: y,
            speed: 1.5 + Math.random() * 2,
            drift: (Math.random() - 0.5) * 2,
            size: 'small',
            diameter: 30
          };
          commit("ADD_BUBBLE", bubble);
        }
      }
      // Les petites bulles ne créent pas de bulles filles
    },
    applyRepulsion({ state, commit }, { poppedBubble }) {
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
         
          const newX = Math.max(0, Math.min(bubble.x + Math.cos(angle) * force * 20, state.areaWidth - bubble.diameter));
          const newY = Math.max(0, Math.min(bubble.y + Math.sin(angle) * force * 20, state.areaHeight - bubble.diameter));
         
          commit("UPDATE_BUBBLE_POSITION", {
            id: bubble.id,
            x: newX,
            y: newY
          });
        }
      });
    },
    checkBubbleLoss({ state, commit }) {
      state.bubbles.forEach(bubble => {
        if (bubble.y + bubble.diameter >= state.areaHeight) {
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
  getters: {
    score: state => state.score,
    bubbles: state => state.bubbles,
    targetColor: state => state.targetColor
  }
});
