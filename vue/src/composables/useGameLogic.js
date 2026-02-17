import { ref, computed, watch } from 'vue';
import { GRID_SIZE, INITIAL_ITEMS_COUNT, MAX_LEVEL, getItemByLevel, getRandomLevel } from '../config/itemsConfig.js';

const STORAGE_KEY = 'merge-game-state';

export function useGameLogic() {
const grid = ref([]);
const score = ref(0);
const moves = ref(0);
let itemIdCounter = 0;

// Инициализация пустой сетки
function initGrid() {
    grid.value = Array.from({ length: GRID_SIZE }, (_, row) =>
      Array.from({ length: GRID_SIZE }, (_, col) => ({
        row,
        col,
        item: null
      }))
    );
}

// Получение пустых ячеек
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

// Добавление случайного предмета
function addRandomItem() {
    const empty = emptyCells.value;
    if (empty.length === 0) {
      alert('Нет свободных ячеек!');
      return false;
    }

    const randomCell = empty[Math.floor(Math.random() * empty.length)];
    const level = getRandomLevel(3); // Генерируем предметы 1-3 уровня
    const itemConfig = getItemByLevel(level);

    grid.value[randomCell.row][randomCell.col].item = {
      id: `item-${itemIdCounter++}`,
      level: level,
      ...itemConfig
    };

    moves.value++;
    saveToLocalStorage();
    return true;
}

// Начальное заполнение
function populateInitialItems() {
    for (let i = 0; i < INITIAL_ITEMS_COUNT; i++) {
      addRandomItem();
    }
}

// Проверка возможности объединения
function canMerge(fromCell, toCell) {
    if (!fromCell.item || !toCell.item) return false;
    return fromCell.item.level === toCell.item.level;
}

// Объединение предметов
function mergeItems(fromRow, fromCol, toRow, toCol) {
    const fromCell = grid.value[fromRow][fromCol];
    const toCell = grid.value[toRow][toCol];

    if (!fromCell.item) return false;

    // Если целевая ячейка пуста - просто перемещаем
    if (!toCell.item) {
      toCell.item = fromCell.item;
      fromCell.item = null;
      saveToLocalStorage();
      return true;
    }

    // Если предметы можно объединить
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
        
        // Добавляем новый случайный предмет после объединения
        setTimeout(() => addRandomItem(), 300);
        
        saveToLocalStorage();
        return true;
      }
    }

    return false;
}

// Сохранение в localStorage
function saveToLocalStorage() {
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

// Загрузка из localStorage
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

// Новая игра
function newGame() {
    initGrid();
    score.value = 0;
    moves.value = 0;
    itemIdCounter = 0;
    populateInitialItems();
    saveToLocalStorage();
}

// Инициализация игры
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