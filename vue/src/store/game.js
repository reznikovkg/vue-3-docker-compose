const MUTATIONS = {
  SET_GRID: 'SET_GRID',
  SET_SCORE: 'SET_SCORE',
  LOAD_GAME: 'LOAD_GAME',
}
const MAX_LEVEL = 4;
const MAX_BRANCH = 3;
const START_SCORE = 100
export default {
  namespaced: true,

  state(){
    return {
      grid: [],
      gridSize: 8,
      score: START_SCORE
      }
  },

  getters: {
    getGrid: (state) => state.grid,
    getScore: (state) => state.score,
    getSize: (state) => state.gridSize
  },

  mutations: {
    [MUTATIONS.SET_GRID]: (state, grid) => {
      state.grid = grid;
    },
    [MUTATIONS.SET_SCORE]: (state, score) => {
      state.score = score;
    },

    [MUTATIONS.LOAD_GAME]: (state, data) => {
      state.grid = data.grid;
      state.score = data.score ?? 100;
    }
  },
  actions: {
    initGame: ({state, commit, dispatch}) => {
      const saved = localStorage.getItem('game');

      if (saved) {
        commit(MUTATIONS.LOAD_GAME, JSON.parse(saved));
        return;
      }

      const grid = Array.from({ length: state.gridSize }, () =>
        Array.from({ length: state.gridSize }, () => null)
      );

        commit(MUTATIONS.SET_GRID, grid);
        dispatch("spawnStart");
      },
    spawnStart: ({state, commit, dispatch}) => {
      const grid = state.grid.map(row => [...row]);
      let spawned = 0;
      while(spawned < 4) {
        const empty = [];
        grid.forEach((row, y) => {
          row.forEach((col, x) => {
            if(!col) empty.push({x, y});
          });
        });
        if (empty.length === 0) break;
        const pos = empty[Math.floor(Math.random() * empty.length)];
        grid[pos.x][pos.y] = {
          id: Date.now() + Math.random(),
          level: 1,
          branch: Math.floor(Math.random() * MAX_BRANCH) + 1
        }
        spawned++;
      }
      commit(MUTATIONS.SET_GRID, grid);
      dispatch("saveGame");
    },
    spawn: ({state, commit, dispatch}) => {
      if(state.score < 10) return;

      const grid = state.grid.map(row => [...row]);
      const empty = [];
      grid.forEach((row, y) => {
        row.forEach((col, x) => {
          if(!col) empty.push({x, y});
        });
      });
      if (empty.length === 0) return;

      const pos = empty[Math.floor(Math.random() * empty.length)];
      grid[pos.y][pos.x] = {
        id: Date.now() + Math.random(),
        level: 1,
        branch: Math.floor(Math.random() * 3) + 1
      }
      commit(MUTATIONS.SET_SCORE, state.score - 10);
      commit(MUTATIONS.SET_GRID, grid);
      dispatch("saveGame");
    },
    spawnFromMax: ({state, commit, dispatch}, branch) => {
      if(state.score < 4) return;
      const grid = state.grid.map(row => [...row]);
      const empty = [];
      grid.forEach((row, y) => {
        row.forEach((col, x) => {
          if(!col) empty.push({x, y});
        });
      });
      if (empty.length === 0) return;
      const pos = empty[Math.floor(Math.random() * empty.length)];
      grid[pos.y][pos.x] = {
        id: Date.now() + Math.random(),
        level: 1,
        branch: branch
      }
      commit(MUTATIONS.SET_SCORE, state.score - 5);
      commit(MUTATIONS.SET_GRID, grid);
    },
    restart: ({state, commit, dispatch}) => {
      const grid = Array.from({length: state.gridSize}, () =>
          Array.from({length: state.gridSize}, () => null)
      );
      commit(MUTATIONS.SET_GRID, grid);
      commit(MUTATIONS.SET_SCORE, 100);
      dispatch("spawnStart");
    },
    sellItem: ({state, commit, dispatch}, position) => {
      const grid = state.grid.map(row => [...row]);
      const item = grid[position.y][position.x];

      if(!item || item.level === 1) return;
      const sellPrice = (item.level - 1) * 10;
      grid[position.y][position.x] = null;
      commit(MUTATIONS.SET_SCORE, state.score + sellPrice);
      commit(MUTATIONS.SET_GRID, grid);
      dispatch("saveGame");
    },
    handleDrop: ({state, commit, dispatch}, {positionFrom, positionTo})=> {
      const grid = state.grid.map(row => [...row]);
      const source = grid[positionFrom.y][positionFrom.x];
      const dest = grid[positionTo.y][positionTo.x];

      if(!source) return false;

      let moved = false;
      if(!dest) {
        grid[positionTo.y][positionTo.x] = source;
        grid[positionFrom.y][positionFrom.x] = null;
        moved = true;
      }
      else if(dest === source) {
        grid[positionTo.y][positionTo.x] = source;
        moved = true;
      }
      else if(dest.level === source.level && dest.level < MAX_LEVEL && dest.branch === source.branch) {
        commit(MUTATIONS.SET_SCORE, state.score + source.level * 10);
        dest.level += 1
        grid[positionFrom.y][positionFrom.x] = null
        moved = true;
      }
      if(moved) {
        commit(MUTATIONS.SET_GRID, grid);
        dispatch("saveGame");
      }

      return moved;
    },
    saveGame: ({state}) => {
      localStorage.setItem('game', JSON.stringify({
        grid: state.grid,
        score: state.score
      }));
    }
  }
}