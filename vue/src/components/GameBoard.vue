<template>
  <div class="game-board-container">
    <div
      class="game-board"
      :style="boardStyle"
      @click="(event) => handleClick(event)"
    >
      <div
        v-for="(rowArray, rowIndex) in grid"
        :key="rowIndex"
        class="game-board__row"
      >
        <div
          v-for="(cellData, colIndex) in rowArray"
          :key="colIndex"
          class="game-board__cell"
          :class="{
            'game-board__cell--occupied': cellData.isOccupied,
          }"
          :style="{
            '--row': rowIndex,
            '--col': colIndex,
            backgroundColor: getCellBackgroundColor(rowIndex, colIndex, grid, gridWidth, gridHeight, cellData),
            borderColor: getCellBorderColor(rowIndex, colIndex, grid, gridWidth, gridHeight, cellData)
          }"
          @mouseover="() => hoverCell(rowIndex, colIndex)"
        >
        </div>
      </div>
      <div v-if="entrance.row !== -1 && entrance.col !== -1"
          class="game-board__entrance"
          :style="{
            '--row': entrance.row,
            '--col': entrance.col,
            backgroundColor: getCellBackgroundColor(entrance.row, entrance.col, grid, gridWidth, gridHeight, null),
            borderColor: getCellBorderColor(entrance.row, entrance.col, grid, gridWidth, gridHeight, null),
            left: `calc(${entrance.col} * var(--cell-size))`,
            top: `calc(${entrance.row} * var(--cell-size))`,
            width: 'var(--cell-size)',
            height: 'var(--cell-size)',
          }">
      </div>
      <div v-for="visitor in visitors" :key="visitor.id"
        class="visitor"
        :style="visitorStyle(visitor)"
        @mouseenter="(event) => showVisitorTooltip(visitor, event)"
        @mouseleave="() => hideVisitorTooltip()"
        @mousemove="(event) => updateTooltipPosition(event)"
        @click="() => handleVisitorClick(visitor.id)">
        <div class="visitor__balance">{{ visitor.balance }}</div>
      </div>
      <div v-for="building in buildingsWithQueue" :key="`queue-${building.id}`"
           class="queue-indicator"
           :style="queueIndicatorStyle(building)"
           @mouseenter="(event) => showQueueTooltip(building, event)"
           @mouseleave="() => hideQueueTooltip()"
           @mousemove="(event) => updateTooltipPosition(event)">
        <div class="queue-indicator__count">{{ getQueueLength(building.id) }}</div>
      </div>
    </div>
    <div
      v-if="activeTooltip"
      class="custom-tooltip"
      :class="`custom-tooltip--${activeTooltip.type}`"
      :style="{
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`,
        display: 'block'
      }"
    >
      <div class="custom-tooltip__content">
        <div v-if="activeTooltip.type === 'visitor'" class="custom-tooltip__visitor-info">
          <div class="custom-tooltip__row">
            <span class="custom-tooltip__label">Настроение:</span>
            <div class="custom-tooltip__value-container">
              <span class="custom-tooltip__value">{{ activeTooltip.data.mood }}</span>
              <div
                class="custom-tooltip__mood-indicator"
                :style="{ backgroundColor: getMoodColor(activeTooltip.data.mood) }"
              ></div>
            </div>
          </div>
          <div 
            v-for="stat in visitorStatsConfig" 
            :key="stat.key"
            class="custom-tooltip__row"
          >
            <span class="custom-tooltip__label">{{ stat.label }}:</span>
            <span 
              class="custom-tooltip__value" 
              :class="{ 'custom-tooltip__value--critical': (activeTooltip.data[stat.key] || 0) < 3 }"
            >
              {{ activeTooltip.data[stat.key] || 0 }}
            </span>
          </div>
          <div class="custom-tooltip__row">
            <span class="custom-tooltip__label">Статус:</span>
            <span class="custom-tooltip__value">{{ activeTooltip.data.status }}</span>
          </div>
          <div v-if="activeTooltip.data.queuePosition" class="custom-tooltip__row">
            <span class="custom-tooltip__label">Очередь:</span>
            <span class="custom-tooltip__value">позиция {{ activeTooltip.data.queuePosition }}</span>
          </div>
        </div>
       <div v-if="activeTooltip.type === 'queue'" class="custom-tooltip__queue-info">
          <div 
            v-for="row in queueInfoRows" 
            :key="row.key"
            class="custom-tooltip__row"
          >
            <span class="custom-tooltip__label">{{ row.label }}:</span>
            <span class="custom-tooltip__value">{{ row.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div> 
</template>

<script setup>
import { computed, onMounted, ref, onUnmounted} from 'vue';
import { useStore } from 'vuex';
import { getCellLogic, CELL_SIZE } from '../modules/cellLogicModule.js';

const store = useStore();
const emit = defineEmits(['cell-clicked']);

const gridWidth = computed(() => store.getters.getGridWidth);
const gridHeight = computed(() => store.getters.getGridHeight);
const grid = computed(() => store.getters.getGrid);
const selectedObject = computed(() => store.getters.getSelectedObject);
const gameMode = computed(() => store.getters.getGameMode);
const entrance = computed(() => store.getters.getEntrance);
const visitors = computed(() => store.getters.activeVisitors);

const highlightedCells = ref([]);
const hoveredCell = ref({ row: -1, col: -1 });
const isPlacementPossible = ref(true);
const activeTooltip = ref(null);
const tooltipPosition = ref({ x: 0, y: 0 });

const visitorStatsConfig = [
  { key: 'fatigue', label: 'Усталость' },
  { key: 'hunger', label: 'Голод' },
  { key: 'boredom', label: 'Скука' },
  { key: 'need', label: 'Нужда' }
];

const componentContext = {
    highlightedCells,
    selectedObject,
    gameMode
};

const {
  getCellBackgroundColor,
  getCellBorderColor,
  isValidCell,
  isCellOccupied
} = getCellLogic(store, componentContext);

const boardStyle = computed(() => ({
  '--cell-size': `${CELL_SIZE}px`,
  '--grid-width': gridWidth.value,
  '--grid-height': gridHeight.value
}));

const getMoodColor = (mood) => {
  if (mood >= 8) 
  {
    return '#00FF00';
  }
  if (mood >= 6) 
  {
    return '#9ACD32';
  }
  if (mood >= 4) 
  {
    return '#FFFF00';
  }
  if (mood >= 2) 
  {
    return '#FFA500';
  }
  return '#FF0000';
};

const getVisitorStatusText = (status) => {
  const statusMap = {
    'spawning': 'Появление',
    'walking': 'Идет',
    'inBuilding': 'В здании',
    'inQueue': 'В очереди',
    'exit': 'Уходит',
    'left': 'Ушел'
  };
  return statusMap[status] || status;
};

const buildingsWithQueue = computed(() => {
  return store.getters.getBuildings.filter(building => 
    store.getters.getBuildingQueueLength(building.id) > 0
  );
});

const getQueueLength = (buildingId) => {
  return store.getters.getBuildingQueueLength(buildingId);
};

const getBuildingOccupancy = (buildingId) => {
  return store.getters.getBuildingOccupancy(buildingId);
};

const queueInfoRows = computed(() => {
  if (!activeTooltip.value || activeTooltip.value.type !== 'queue') return [];
  
  const data = activeTooltip.value.data;
  return [
    { key: 'length', label: 'Очередь', value: `${data.length} человек` },
    { key: 'occupied', label: 'Занято', value: `${data.occupied}/${data.capacity}` },
    { key: 'building', label: 'Здание', value: data.buildingName }
  ];
});

const visitorStyle = (visitor) => ({
  '--visitor-x': visitor.x,
  '--visitor-y': visitor.y,
  '--mood-color': getMoodColor(visitor.mood),
  left: `calc(${visitor.x} * var(--cell-size))`,
  top: `calc(${visitor.y} * var(--cell-size))`,
});

const queueIndicatorStyle = (building) => {
  if (!building.buildingEntrance)
  {
    return {};
  }
  return {
    left: `calc(${building.buildingEntrance.col} * var(--cell-size))`,
    top: `calc(${building.buildingEntrance.row} * var(--cell-size))`,
  };
};

const showVisitorTooltip = (visitor, event) => {
  if (!visitor) 
  { 
    return;
  }
  
  activeTooltip.value = {
    type: 'visitor',
    data: {
      mood: Math.round((visitor.mood || 5) * 10) / 10,
      fatigue: visitor.stats?.fatigue || 0,
      hunger: visitor.stats?.hunger || 0,
      boredom: visitor.stats?.boredom || 0,
      need: visitor.stats?.need || 0,
      status: getVisitorStatusText(visitor.status),
      queuePosition: visitor.queuePosition
    }
  };
  
  updateTooltipPosition(event);
};
const showQueueTooltip = (building, event) => {
  if (!building)
  {
    return;
  }
  
  activeTooltip.value = {
    type: 'queue',
    data: {
      length: getQueueLength(building.id),
      occupied: getBuildingOccupancy(building.id),
      capacity: building.visitors || 0,
      buildingName: building.name || 'Неизвестное здание'
    }
  };
  
  updateTooltipPosition(event);
};

const hideVisitorTooltip = () => {
  activeTooltip.value = null;
};

const hideQueueTooltip = () => {
  activeTooltip.value = null;
};

const updateTooltipPosition = (event) => {
  if (!activeTooltip.value)
  { 
    return;
  }
  
  let x = event.clientX;
  let y = event.clientY;
  
  x += 10;
  y += 10;
  
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const tooltipWidth = 250;
  const tooltipHeight = 200;

   if (x + tooltipWidth > windowWidth) {
    x = event.clientX - tooltipWidth - 10;
  }
  
  if (y + tooltipHeight > windowHeight) {
    y = event.clientY - tooltipHeight - 10;
  }

  x = Math.max(5, x);
  y = Math.max(5, y);

  tooltipPosition.value = { 
    x: Math.round(x),
    y: Math.round(y)
  };
};


const handleVisitorClick = (visitorId) => {
  emit('visitor-clicked', visitorId);
  activeTooltip.value = null;
};

const handleClick = (event) => {
  if (event.target.closest('.visitor') || event.target.closest('.queue-indicator')) 
  {
    return;
  }
    
  activeTooltip.value = null;

  const targetCell = event.target.closest('.game-board__cell');
  if (!targetCell) 
  {
    return;
  }
  const row = parseInt(targetCell.style.getPropertyValue('--row'));
  const col = parseInt(targetCell.style.getPropertyValue('--col'));
  const currentMode = gameMode.value;
  emit('cell-clicked', { row, col, gameMode: currentMode });
  if (currentMode === 'place' && isPlacementPossible.value) {
      store.dispatch('placeObject', { originRow: row, originCol: col });
      updatePreviewPlacement();  
  } else if (currentMode === 'place' && !isPlacementPossible.value) {
      if (highlightedCells.value.some(cell => !isValidCell(cell.row, cell.col, gridWidth.value, gridHeight.value))) {
          alert("Невозможно разместить: выходит за границы поля");
      } else if (highlightedCells.value.some(cell => isCellOccupied(cell.row, cell.col, grid.value, gridWidth.value, gridHeight.value))) {
          alert("Невозможно разместить: ячейки заняты");
      }
  }
  else if (currentMode === 'delete') {
      store.dispatch('deleteObject', { row: row, col: col });
      updatePreviewPlacement();
  }
}; 

const updatePreviewPlacement = () => {
  if (!selectedObject.value || gameMode.value !== 'place') 
  {
    highlightedCells.value = [];
    isPlacementPossible.value = true;
    return;
  }
  const originRow = hoveredCell.value.row;
  const originCol = hoveredCell.value.col;
  if (originRow < 0 || originCol < 0) 
  {
    highlightedCells.value = [];
    isPlacementPossible.value = true;
    return;
  }
  const objectShape = selectedObject.value.shape;
  const previewCells = [];
  let canPlace = true;
  let outOfBounds = false;
  let cellOccupied = false;
  for (const shapePart of objectShape) 
  {
    const targetRow = originRow + shapePart.y;
    const targetCol = originCol + shapePart.x;
    let isCurrentCellError = false;
    if (!isValidCell(targetRow, targetCol, gridWidth.value, gridHeight.value)) 
    {
      canPlace = false;
      isCurrentCellError = true;
      outOfBounds = true;
    } 
    else if (isCellOccupied(targetRow, targetCol, grid.value, gridWidth.value, gridHeight.value)) 
    {
      canPlace = false;
      isCurrentCellError = true;
      cellOccupied = true;
    }
    previewCells.push({ row: targetRow, col: targetCol, isError: isCurrentCellError });
  }
  isPlacementPossible.value = canPlace;
  highlightedCells.value = previewCells;
};
const hoverCell = (row, col) => {
  hoveredCell.value = { row, col };
  updatePreviewPlacement();
};
onMounted(() => {
  store.dispatch('initializeGrid');
  store.dispatch('startVisitorSpawning');

  movementInterval = setInterval(() => {
    store.dispatch('stepAllVisitors');
  }, 700);
});

onUnmounted(() => {
  store.dispatch('stopVisitorSpawning');
  if (movementInterval) {
    clearInterval(movementInterval);
  }
});
</script>

<style scoped lang="less">
.game-board-container {
  position: relative;
  display: inline-block;
}
.game-board {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  width: auto;
  height: auto;
  transform: rotate(-60deg) skewY(30deg);
  border: 2px solid #000000;
  
  &__row {
    display: flex;
    transform: skewY(0deg); 
  }
  
  &__cell {
    width: var(--cell-size);
    height: var(--cell-size);
    border: 1px solid;
    box-sizing: border-box;
    position: relative;
    margin: 0;
  }
  &__entrance {
    width: var(--cell-size);
    height: var(--cell-size);
    box-sizing: border-box;
    position: absolute; 
    z-index: 2; 
    border-width: 2px; 
    left: calc(var(--cell-size) * var(--col));
    top: calc(var(--cell-size) * var(--row));
  }
}
.visitor {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--mood-color, blue);
  position: absolute;
  z-index: 3;
  left: calc(var(--cell-size) * var(--visitor-x));
  top: calc(var(--cell-size) * var(--visitor-y));
  transform: translate(50%, 50%);
  transition: left 0.5s, top 0.5s, background-color 0.5s;
  box-shadow: 0 0 5px rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    transform: translate(50%, 50%) scale(1.2);
    z-index: 4;
  }

  &__balance {
    position: absolute;
    top: -20px; 
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    white-space: nowrap;
    pointer-events: none; 
    z-index: 10;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  &__warning {
    position: absolute;
    top: -5px;
    right: -5px;
    width: 10px;
    height: 10px;
    background-color: red;
    border-radius: 50%;
    color: white;
    font-size: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.queue-indicator {
  position: absolute;
  width: 24px;
  height: 24px;
  background-color: #ff9800;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
  z-index: 4;
  transform: translate(-50%, -50%);
  border: 2px solid white;
  box-shadow: 0 0 5px rgba(0,0,0,0.5);
  cursor: help;
  
  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
    z-index: 5;
  }
  
  &__count {
    pointer-events: none;
  }
}

.custom-tooltip {
  position: fixed; 
  z-index: 10000; 
  background: rgba(0, 0, 0, 0.95);
  color: white;
  padding: 12px 15px;
  border-radius: 8px;
  font-size: 13px;
  min-width: 200px;
  max-width: 250px;
  pointer-events: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  transform: none; 
  
  &__content {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
  }
  
  &__label {
    color: #aaa;
    font-weight: 500;
    flex-shrink: 0;
  }
  
  &__value {
    color: white;
    font-weight: 600;
    text-align: right;
  }
  
  &__value-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  &__mood-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.5);
    flex-shrink: 0;
  }
  
  &--visitor {
    border-left: 3px solid #4CAF50;
  }
  
  &--queue {
    border-left: 3px solid #ff9800;
  }
  
  &__visitor-info,
  &__queue-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
}
</style>