export const GameModule = {
  namespaced: true,

  state: {
    grid: Array(8).fill().map(() => Array(8).fill(null)),
    score: 0,
    highScore: 0,
    moves: 0,
    mergedCount: 0,
    playTime: 0,
    maxLevelReached: 1,
    timestamp: Date.now(),
    showGameOver: false,
    notification: {
      show: false,
      message: '',
      type: 'info'
    }
  },

  getters: {
    getGrid: (state) => state.grid,
    getScore: (state) => state.score,
    getHighScore: (state) => state.highScore,
    getMoves: (state) => state.moves,
    getMergedCount: (state) => state.mergedCount,
    getPlayTime: (state) => state.playTime,
    getMaxLevelReached: (state) => state.maxLevelReached,
    getShowGameOver: (state) => state.showGameOver,
    getNotification: (state) => state.notification,
    getGridCells: (state) => {
    const GRID_SIZE = 8;
    const cells = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        cells.push({
          row,
          col,
          item: state.grid[row]?.[col]?.item || null
        });
      }
    }
    return cells;
  },
    getEmptyCellsCount: (state) => {
      const GRID_SIZE = 8;
      let count = 0;
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (!state.grid[row]?.[col]) {
            count++;
          }
        }
      }
      return count;
    },
    getIsEmptyGrid: (state) => {
      const GRID_SIZE = 8;
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (state.grid[row]?.[col]) {
            return false;
          }
        }
      }
      return true;
    },
    getFormattedPlayTime: (state) => {
      const hours = Math.floor(state.playTime / 3600);
      const minutes = Math.floor((state.playTime % 3600) / 60);
      const seconds = state.playTime % 60;

      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      } else {
        return `${seconds}s`;
      }
    }
  },

  mutations: {
    SET_GRID(state, grid) {
  const GRID_SIZE = 8;
  state.grid = Array(GRID_SIZE).fill().map((_, row) =>
    Array(GRID_SIZE).fill().map((_, col) =>
      grid[row]?.[col] || null
    )
  );
},
    SET_SCORE(state, score) {
      state.score = score;
    },
    SET_HIGH_SCORE(state, highScore) {
      state.highScore = highScore;
    },
    SET_MOVES(state, moves) {
      state.moves = moves;
    },
    SET_MERGED_COUNT(state, mergedCount) {
      state.mergedCount = mergedCount;
    },
    SET_PLAY_TIME(state, playTime) {
      state.playTime = playTime;
    },
    SET_MAX_LEVEL_REACHED(state, maxLevelReached) {
      state.maxLevelReached = maxLevelReached;
    },
    SET_SHOW_GAME_OVER(state, showGameOver) {
      state.showGameOver = showGameOver;
    },
    SET_NOTIFICATION(state, notification) {
      state.notification = notification;
    },
    SET_TIMESTAMP(state, timestamp) {
      state.timestamp = timestamp;
    },
    CLEAR_CELL(state, { row, col }) {
      if (state.grid[row]) {
        state.grid[row][col] = null;
      }
    },
    INCREMENT_MOVES(state) {
      state.moves++;
    },
    INCREMENT_MERGED_COUNT(state) {
      state.mergedCount++;
    },
    INCREMENT_PLAY_TIME(state) {
      state.playTime++;
    },
    ADD_SCORE(state, points) {
      state.score += points;
      if (state.score > state.highScore) {
        state.highScore = state.score;
      }
    },
    RESET_GAME(state) {
      state.grid = [];
      state.score = 0;
      state.moves = 0;
      state.mergedCount = 0;
      state.playTime = 0;
      state.maxLevelReached = 1;
      state.showGameOver = false;
      state.timestamp = Date.now();
    },
    CLEAR_NOTIFICATION(state) {
      state.notification.show = false;
    },
    SET_CELL_ITEM(state, { row, col, item }) {
      if (!state.grid[row]) {
        state.grid[row] = []
      }
      state.grid[row][col] = {
        item,
        timestamp: Date.now()
      }
    },
    MOVE_CELL(state, { fromRow, fromCol, toRow, toCol }) {
      const cellData = state.grid[fromRow]?.[fromCol]
      if (cellData) {
        state.grid[toRow][toCol] = { ...cellData }
        state.grid[fromRow][fromCol] = null
      }
    },
    SWAP_CELLS(state, { fromRow, fromCol, toRow, toCol }) {
      const temp = state.grid[toRow][toCol]
      state.grid[toRow][toCol] = state.grid[fromRow][fromCol]
      state.grid[fromRow][fromCol] = temp
    },
    INITIALIZE_GRID_ROW(state, { row }) {
    if (!state.grid[row]) {
      state.grid[row] = [];
    }
  },
    INITIALIZE_GRID(state) {
    const GRID_SIZE = 8;
    for (let i = 0; i < GRID_SIZE; i++) {
      if (!state.grid[i]) {
        state.grid[i] = [];
      }
    }
  },
  },

  actions: {
    initializeGame({ commit, dispatch, getters }) {
    dispatch('loadFromStorage');
    commit('INITIALIZE_GRID');

    if (getters.getIsEmptyGrid) {
      dispatch('addInitialItems');
    }
    dispatch('startGameTimer');
  },

    addRandomItem({ commit, state, dispatch }) {
  const GRID_SIZE = 8;
  const items = [
          { id: 1, name: "Seed", color: "#8B4513", points: 10, emoji: "🌱" },
          { id: 2, name: "Sapling", color: "#228B22", points: 25, emoji: "🌿" },
          { id: 3, name: "Tree", color: "#006400", points: 50, emoji: "🌳" },
          { id: 4, name: "Ancient Tree", color: "#004d00", points: 100, emoji: "🪵" },
          { id: 5, name: "Forest", color: "#003300", points: 200, emoji: "🌲" },
          { id: 6, name: "Mystical Forest", color: "#001a00", points: 500, emoji: "🧚" },
          { id: 7, name: "World Tree", color: "#000000", points: 1000, emoji: "🌍" },
          { id: 8, name: "Cosmic Tree", color: "#4B0082", points: 2500, emoji: "✨" }
        ];


  for (let row = 0; row < GRID_SIZE; row++) {
    if (!state.grid[row]) {
      commit('INITIALIZE_GRID_ROW', { row });
    }
  }

  const emptyCells = [];

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!state.grid[row]?.[col]) {
        emptyCells.push({ row, col });
      }
    }
  }

        if (emptyCells.length > 0) {
          const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];

          const weights = [40, 30, 15, 8, 4, 2, 1, 0];
          const random = Math.random() * 100;
          let accumulated = 0;
          let selectedLevel = 1;

          for (let i = 0; i < weights.length; i++) {
            accumulated += weights[i];
            if (random <= accumulated) {
              selectedLevel = i + 1;
              break;
            }
          }

          const item = items.find(i => i.id === selectedLevel);

          if (item) {
            commit('SET_CELL_ITEM', {
              row: randomCell.row,
              col: randomCell.col,
              item
            });

            dispatch('showNotification', {
              message: 'New item added!',
              type: 'info'
            });
            dispatch('saveToStorage');
          }
        } else {
          dispatch('showNotification', {
            message: 'No empty cells available!',
            type: 'warning'
          });
        }
      },

    addInitialItems({ dispatch }) {
      const initialCount = Math.floor(Math.random() * 5) + 6;

      for (let i = 0; i < initialCount; i++) {
        dispatch('addRandomItem');
      }
    },


    moveItem({ commit, dispatch, state }, { fromRow, fromCol, toRow, toCol }) {
      if (fromRow === toRow && fromCol === toCol) return;

      const fromItem = state.grid[fromRow]?.[fromCol]?.item;
      const toItem = state.grid[toRow]?.[toCol]?.item;

      if (!fromItem) return;

      commit('INCREMENT_MOVES');

      if (!toItem) {
        commit('MOVE_CELL', { fromRow, fromCol, toRow, toCol });
      } else if (fromItem.id === toItem.id) {
        const items = [
          { id: 1, name: "Seed", color: "#8B4513", points: 10, emoji: "🌱" },
          { id: 2, name: "Sapling", color: "#228B22", points: 25, emoji: "🌿" },
          { id: 3, name: "Tree", color: "#006400", points: 50, emoji: "🌳" },
          { id: 4, name: "Ancient Tree", color: "#004d00", points: 100, emoji: "🪵" },
          { id: 5, name: "Forest", color: "#003300", points: 200, emoji: "🌲" },
          { id: 6, name: "Mystical Forest", color: "#001a00", points: 500, emoji: "🧚" },
          { id: 7, name: "World Tree", color: "#000000", points: 1000, emoji: "🌍" },
          { id: 8, name: "Cosmic Tree", color: "#4B0082", points: 2500, emoji: "✨" }
        ];

        const nextLevelItem = items.find(i => i.id === fromItem.id + 1);

        if (nextLevelItem) {
          commit('SET_CELL_ITEM', {
            row: toRow,
            col: toCol,
            item: nextLevelItem
          });

          commit('CLEAR_CELL', { row: fromRow, col: fromCol });
          commit('INCREMENT_MERGED_COUNT');
          commit('ADD_SCORE', nextLevelItem.points);

          if (nextLevelItem.id > state.maxLevelReached) {
            commit('SET_MAX_LEVEL_REACHED', nextLevelItem.id);
          }

          if (nextLevelItem.id >= 8) {
            setTimeout(() => {
              commit('SET_SHOW_GAME_OVER', true);
            }, 500);
          }
        }
      } else {
        commit('SWAP_CELLS', { fromRow, fromCol, toRow, toCol });
      }

      dispatch('saveToStorage');
    },

    saveToStorage({ state }) {
      const gameState = {
        grid: state.grid,
        score: state.score,
        highScore: state.highScore,
        moves: state.moves,
        mergedCount: state.mergedCount,
        playTime: state.playTime,
        maxLevelReached: state.maxLevelReached,
        timestamp: Date.now()
      };

      try {
        localStorage.setItem('mergeGameState', JSON.stringify(gameState));
      } catch (e) {
        console.error('Failed to save game:', e);
      }
    },

    loadFromStorage({ commit }) {
      try {
        const saved = localStorage.getItem('mergeGameState');
        if (saved) {
          const gameState = JSON.parse(saved);

          if (gameState && gameState.grid) {
            commit('SET_GRID', gameState.grid || []);
            commit('SET_SCORE', gameState.score || 0);
            commit('SET_HIGH_SCORE', gameState.highScore || 0);
            commit('SET_MOVES', gameState.moves || 0);
            commit('SET_MERGED_COUNT', gameState.mergedCount || 0);
            commit('SET_PLAY_TIME', gameState.playTime || 0);
            commit('SET_MAX_LEVEL_REACHED', gameState.maxLevelReached || 1);
            commit('SET_TIMESTAMP', gameState.timestamp || Date.now());
          }
        }
      } catch (e) {
        console.error('Error loading game:', e);
        commit('SET_GRID', []);
      }
    },

    resetGame({ commit, dispatch }) {
      if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
        commit('RESET_GAME');
        dispatch('addInitialItems');
        dispatch('showNotification', {
          message: 'New game started!',
          type: 'info'
        });
        dispatch('saveToStorage');
      }
    },

    newGame({ dispatch }) {
      dispatch('resetGame');
      dispatch('hideGameOver');
    },

    hideGameOver({ commit }) {
      commit('SET_SHOW_GAME_OVER', false);
    },

    startGameTimer({ commit, dispatch }) {
      const timer = setInterval(() => {
        commit('INCREMENT_PLAY_TIME');
        dispatch('saveToStorage');
      }, 1000);

      return timer;
    },

    showNotification({ commit }, { message, type = 'info' }) {
      commit('SET_NOTIFICATION', {
        show: true,
        message,
        type
      });

      setTimeout(() => {
        commit('CLEAR_NOTIFICATION');
      }, 3000);
    }
  }
}