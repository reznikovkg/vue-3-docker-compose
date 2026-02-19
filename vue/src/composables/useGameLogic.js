import { ref, computed, watch } from 'vue';
import { GRID_SIZE, INITIAL_ITEMS_COUNT, MAX_LEVEL, getItemByLevel, getRandomLevel } from '../config/itemsConfig.js';

const STORAGE_KEY = 'merge-game-state';

export function useGameLogic() {
const grid = ref([]);
const score = ref(0);
const moves = ref(0);
let itemIdCounter = 0;

function initGrid() {
    grid.value = Array.from({ length: GRID_SIZE }, (_, row) =>
      Array.from({ length: GRID_SIZE }, (_, col) => ({
        row,
        col,
        item: null
      }))
    );
}

const emptyCells = computed(() => {
    const cells = [];
    grid.value.forEach(row => {
      row.forEach(cell => {
        if (!cell.item) {
          cells.push({ row: cell.row, col: cell.col });
        }
      });
    });
    return cells;
});

function addRandomItem() {
    const empty = emptyCells.value;
    if (empty.length === 0) {
      alert('Нет свободных ячеек');
      return false;
    }

    const randomCell = empty[Math.floor(Math.random() * empty.length)];
    const level = getRandomLevel(3); 
    const itemConfig = getItemByLevel(level);

    grid.value[randomCell.row][randomCell.col].item = {
      id: `item-${itemIdCounter++}`,
      level: level,
      ...itemConfig
    };

    moves.value++;
    saveGame();
    return true;
}

function populateInitialItems() {
    for (let i = 0; i < INITIAL_ITEMS_COUNT; i++) {
      addRandomItem();
    }
}

function canMerge(fromCell, toCell) {
    if (!fromCell.item || !toCell.item) return false;
    return fromCell.item.level === toCell.item.level;
}

function mergeItems(fromRow, fromCol, toRow, toCol) {
    const fromCell = grid.value[fromRow][fromCol];
    const toCell = grid.value[toRow][toCol];

    if (!fromCell.item) return false;

    if (!toCell.item) {
      toCell.item = fromCell.item;
      fromCell.item = null;
      saveGame();
      return true;
    }

    if (canMerge(fromCell, toCell)) {
      const newLevel = toCell.item.level + 1;
      
      if (newLevel <= MAX_LEVEL) {
        const newItemConfig = getItemByLevel(newLevel);
        toCell.item = {
          id: `item-${itemIdCounter++}`,
          level: newLevel,
          ...newItemConfig
        };
        
        score.value += newItemConfig.points;
        fromCell.item = null;

        setTimeout(() => addRandomItem(), 300);
        
        saveGame();
        return true;
      }
    }

    return false;
}

function saveGame() {
    const state = {
      grid: grid.value.map(row => row.map(cell => ({
        row: cell.row,
        col: cell.col,
        item: cell.item
      }))),
      score: score.value,
      moves: moves.value,
      itemIdCounter
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        grid.value = state.grid;
        score.value = state.score || 0;
        moves.value = state.moves || 0;
        itemIdCounter = state.itemIdCounter || 0;
        return true;
      }
    } catch (e) {
      console.error('Ошибка загрузки из localStorage:', e);
    }
    return false;
}

function newGame() {
    initGrid();
    score.value = 0;
    moves.value = 0;
    itemIdCounter = 0;
    populateInitialItems();
    saveGame();
}

function initGame() {
    if (!loadFromLocalStorage()) {
      newGame();
    }
}

return {
    grid,
    score,
    moves,
    emptyCells,
    addRandomItem,
    mergeItems,
    canMerge,
    newGame,
    initGame
};
}