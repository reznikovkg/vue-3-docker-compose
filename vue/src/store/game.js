const MIN_GRID = 6;
const MAX_GRID = 10;
const COLORS = [
  '#FF4444',
  '#44FF44',
  '#4444FF',
  '#FFFF44',
  '#FF44FF',
  '#44FFFF',
];

const state = {
  gridSize: 8,
  grid: [],
  selectedCell: null,
  matchedSet: new Set(),
  animatingRevert: false,
  revertIds: null,
  score: 0,
  isProcessing: false,
};

const mutations = {
  SET_GRID_SIZE(state, size) {
    state.gridSize = Math.max(MIN_GRID, Math.min(MAX_GRID, size));
  },
  SET_GRID(state, grid) {
    state.grid = JSON.parse(JSON.stringify(grid));
  },
  SET_SELECTED_CELL(state, cell) {
    state.selectedCell = cell;
  },
  SET_MATCHED_SET(state, set) {
    state.matchedSet = new Set(set);
  },
  SET_ANIMATING_REVERT(state, value) {
    state.animatingRevert = value;
  },
  SET_REVERT_IDS(state, ids) {
    state.revertIds = ids;
  },
  SET_IS_PROCESSING(state, value) {
    state.isProcessing = value;
  },
  UPDATE_CELL_COLOR(state, { x, y, color }) {
    if (state.grid[y] && state.grid[y][x]) {
      state.grid[y][x].color = color;
    }
  },
  SWAP_CELLS(state, { cell1, cell2 }) {
    const tempColor = state.grid[cell1.y][cell1.x].color;
    state.grid[cell1.y][cell1.x].color = state.grid[cell2.y][cell2.x].color;
    state.grid[cell2.y][cell2.x].color = tempColor;
  },
  INCREMENT_SCORE(state, points) {
    state.score += points;
  },
  RESET_SCORE(state) {
    state.score = 0;
  },
};

const actions = {
  initializeGame({ commit, state }) {
    commit('SET_IS_PROCESSING', true);

    return new Promise((resolve, reject) => {
      try {
        // Простая и надежная инициализация сетки
        let idCounter = 0;
        const newGrid = [];

        for (let y = 0; y < state.gridSize; y++) {
          const row = [];
          for (let x = 0; x < state.gridSize; x++) {
            row.push({
              id: idCounter++,
              x,
              y,
              color: getRandomColor(),
            });
          }
          newGrid.push(row);
        }

        commit('SET_GRID', newGrid);
        commit('SET_SELECTED_CELL', null);
        commit('SET_MATCHED_SET', new Set());
        commit('RESET_SCORE');

        // Автоматически обрабатываем начальные совпадения
        const processInitialMatches = () => {
          const matches = findMatchesSimple(newGrid);
          if (matches.length === 0) {
            commit('SET_IS_PROCESSING', false);
            resolve();
            return;
          }

          // Обрабатываем совпадения
          for (const match of matches) {
            const availableColors = COLORS.filter((c) => c !== match.color);
            const newColor =
              availableColors[
                Math.floor(Math.random() * availableColors.length)
              ];
            newGrid[match.y][match.x].color = newColor;
          }

          commit('SET_GRID', newGrid);

          // Рекурсивно проверяем снова
          setTimeout(processInitialMatches, 10);
        };

        processInitialMatches();
      } catch (error) {
        commit('SET_IS_PROCESSING', false);
        reject(error);
      }
    });
  },

  selectCell({ commit, state, dispatch }, cell) {
    if (state.isProcessing || state.animatingRevert) return;

    if (!state.selectedCell) {
      commit('SET_SELECTED_CELL', cell);
      return;
    }

    if (state.selectedCell.id === cell.id) {
      commit('SET_SELECTED_CELL', null);
      return;
    }

    if (isAdjacent(state.selectedCell, cell)) {
      const sourceCell = state.selectedCell;
      commit('SET_SELECTED_CELL', null);
      dispatch('attemptSwap', { sourceCell, targetCell: cell });
    } else {
      commit('SET_SELECTED_CELL', cell);
    }
  },

  async attemptSwap({ commit, state, dispatch }, { sourceCell, targetCell }) {
    if (!sourceCell || !targetCell || state.isProcessing) return;

    commit('SET_IS_PROCESSING', true);

    // Сохраняем оригинальные цвета для возможного отката
    const originalColor1 = state.grid[sourceCell.y][sourceCell.x].color;
    const originalColor2 = state.grid[targetCell.y][targetCell.x].color;

    // Меняем ячейки местами
    commit('SWAP_CELLS', { cell1: sourceCell, cell2: targetCell });

    await delay(200);

    // Проверяем есть ли совпадения
    const matches = findMatchesSimple(state.grid);

    if (matches.length === 0) {
      // Нет совпадений - откатываем
      commit('SET_ANIMATING_REVERT', true);
      commit('SET_REVERT_IDS', [sourceCell.id, targetCell.id]);

      await delay(300);

      // Восстанавливаем оригинальные цвета
      commit('UPDATE_CELL_COLOR', {
        x: sourceCell.x,
        y: sourceCell.y,
        color: originalColor1,
      });
      commit('UPDATE_CELL_COLOR', {
        x: targetCell.x,
        y: targetCell.y,
        color: originalColor2,
      });

      await delay(200);

      commit('SET_ANIMATING_REVERT', false);
      commit('SET_REVERT_IDS', null);
      commit('SET_IS_PROCESSING', false);
    } else {
      // Есть совпадения - обрабатываем цепочку
      await dispatch('processMatches', matches);
    }
  },

  async processMatches({ commit, state, dispatch }, matches) {
    if (matches.length === 0) {
      commit('SET_IS_PROCESSING', false);
      return;
    }

    // Подсвечиваем совпадения
    commit('SET_MATCHED_SET', new Set(matches.map((m) => m.id)));
    commit('INCREMENT_SCORE', matches.length * 10);

    await delay(500);

    // Удаляем совпавшие ячейки
    matches.forEach((match) => {
      commit('UPDATE_CELL_COLOR', {
        x: match.x,
        y: match.y,
        color: null,
      });
    });

    commit('SET_MATCHED_SET', new Set());
    await delay(200);

    // Применяем гравитацию
    await dispatch('applyGravity');

    // Заполняем пустоты
    await dispatch('refillEmptyCells');

    // Автоматически проверяем новые совпадения после заполнения
    await delay(200);
    const newMatches = findMatchesSimple(state.grid);

    if (newMatches.length > 0) {
      // Рекурсивно обрабатываем новые совпадения
      await dispatch('processMatches', newMatches);
    } else {
      commit('SET_IS_PROCESSING', false);
    }
  },

  async applyGravity({ commit, state }) {
    const gridSize = state.gridSize;
    let moved = true;

    while (moved) {
      moved = false;

      for (let x = 0; x < gridSize; x++) {
        for (let y = gridSize - 1; y > 0; y--) {
          if (!state.grid[y][x].color && state.grid[y - 1][x].color) {
            commit('UPDATE_CELL_COLOR', {
              x,
              y,
              color: state.grid[y - 1][x].color,
            });
            commit('UPDATE_CELL_COLOR', {
              x,
              y: y - 1,
              color: null,
            });
            moved = true;
          }
        }
      }

      if (moved) {
        await delay(100);
      }
    }
  },

  async refillEmptyCells({ commit, state }) {
    const gridSize = state.gridSize;

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        if (!state.grid[y][x].color) {
          commit('UPDATE_CELL_COLOR', {
            x,
            y,
            color: getRandomColor(),
          });
        }
      }
    }

    await delay(100);
  },
};

// Вспомогательные функции
function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

const isAdjacent = (cell1, cell2) => {
  if (!cell1 || !cell2) return false;
  const dx = Math.abs(cell1.x - cell2.x);
  const dy = Math.abs(cell1.y - cell2.y);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function findMatchesSimple(grid) {
  const matches = new Set();
  const gridSize = grid.length;

  // Горизонтальные совпадения (3+ в ряд)
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x <= gridSize - 3; x++) {
      const color = grid[y][x].color;
      if (!color) continue;

      // Проверяем 3 подряд
      if (grid[y][x + 1].color === color && grid[y][x + 2].color === color) {
        matches.add(grid[y][x]);
        matches.add(grid[y][x + 1]);
        matches.add(grid[y][x + 2]);

        // Проверяем продолжение вправо
        for (let i = x + 3; i < gridSize; i++) {
          if (grid[y][i].color === color) {
            matches.add(grid[y][i]);
          } else {
            break;
          }
        }
      }
    }
  }

  // Вертикальные совпадения (3+ в ряд)
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y <= gridSize - 3; y++) {
      const color = grid[y][x].color;
      if (!color) continue;

      // Проверяем 3 подряд
      if (grid[y + 1][x].color === color && grid[y + 2][x].color === color) {
        matches.add(grid[y][x]);
        matches.add(grid[y + 1][x]);
        matches.add(grid[y + 2][x]);

        // Проверяем продолжение вниз
        for (let i = y + 3; i < gridSize; i++) {
          if (grid[i][x].color === color) {
            matches.add(grid[i][x]);
          } else {
            break;
          }
        }
      }
    }
  }

  return Array.from(matches);
}

const getters = {
  selectedCell: (state) => state.selectedCell,
  gridSize: (state) => state.gridSize,
  grid: (state) => state.grid,
  matchedSet: (state) => state.matchedSet,
  matchedCount: (state) => state.matchedSet.size,
  score: (state) => state.score,
  animatingRevert: (state) => state.animatingRevert,
  revertIds: (state) => state.revertIds,
  isProcessing: (state) => state.isProcessing,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
