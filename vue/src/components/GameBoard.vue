<template>
  <div class="game-board-container">
    <svg
      class="game-board"
      :viewBox="viewBox"
      :style="boardStyle"
      @click="(event) => handleSvgClick(event)"
    >
      <g v-for="(rowArray, rowIndex) in grid" :key="rowIndex">
        <g v-for="(cellData, colIndex) in rowArray" :key="colIndex">
          <polygon
            :points="getCellPoints(rowIndex, colIndex)"
            :class="getCellClasses(rowIndex, colIndex, cellData)"
            :style="getCellStyle(rowIndex, colIndex, cellData)"
            @mouseover="() => hoverCell(rowIndex, colIndex)"
            :data-row="rowIndex"
            :data-col="colIndex"
          />
        </g>
      </g>
      <polygon
        v-if="entrance.row !== -1 && entrance.col !== -1"
        :points="getEntrancePoints()"
        class="game-board__entrance"
        :style="{
          fill: getCellBackgroundColor(entrance.row, entrance.col, grid, gridWidth, gridHeight, null),
          stroke: getCellBorderColor(entrance.row, entrance.col, grid, gridWidth, gridHeight, null),
        }"
      />
      <g v-for="visitor in visitors" :key="visitor.id">
        <circle
          :cx="getVisitorX(visitor)"
          :cy="getVisitorY(visitor)"
          :r="CELL_SIZE / 4"
          class="visitor"
          :style="{ fill: getMoodColor(visitor.mood) }"
          @mouseenter="(event) => showVisitorTooltip(visitor, event)"
          @mouseleave="() => activeTooltip?.type === 'visitor' && (activeTooltip = null)"
          @mousemove="(event) => updateTooltipPosition(event)"
          @click="() => { emit('visitor-clicked', visitor.id); activeTooltip = null; }"
        />
        <text
          :x="getVisitorX(visitor)"
          :y="getVisitorY(visitor) - CELL_SIZE / 3"
          text-anchor="middle"
          class="visitor__balance"
        >
          {{ visitor.balance }}
        </text>
      </g>
      <g v-for="building in buildingsWithQueue" :key="`queue-${building.id}`">
        <circle
          :cx="getQueueX(building)"
          :cy="getQueueY(building)"
          :r="CELL_SIZE / 3"
          class="queue-indicator"
          @mouseenter="(event) => showQueueTooltip(building, event)"
          @mouseleave="() => activeTooltip?.type === 'queue' && (activeTooltip = null)"
          @mousemove="(event) => updateTooltipPosition(event)"
        />
        <text
          :x="getQueueX(building)"
          :y="getQueueY(building)"
          text-anchor="middle"
          dominant-baseline="middle"
          class="queue-indicator__count"
        >
          {{ getQueueLength(building.id) }}
        </text>
      </g>
    </svg>
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

const CELL_HALF = CELL_SIZE / 2;

const calculateCellCenter = (row, col) => {
  const x = CELL_HALF * (col - row);
  const y = CELL_HALF * (col + row);
  return { x, y };
};

const getCellPoints = (row, col) => {
  const center = calculateCellCenter(row, col);
  const halfSize = CELL_SIZE / 2;
  
  const points = [
    [center.x, center.y - halfSize],          
    [center.x + halfSize, center.y],           
    [center.x, center.y + halfSize],           
    [center.x - halfSize, center.y]            
  ];
  
  return points.map(p => p.join(',')).join(' ');
};

const getEntrancePoints = () => {
  if (entrance.value.row === -1 || entrance.value.col === -1) 
  {
    return;
  }
  return getCellPoints(entrance.value.row, entrance.value.col);
};

const getVisitorX = (visitor) => {
  const center = calculateCellCenter(visitor.y, visitor.x);
  return center.x;
};

const getVisitorY = (visitor) => {
  const center = calculateCellCenter(visitor.y, visitor.x);
  return center.y;
};

const getQueueX = (building) => {
  if (!building.buildingEntrance) 
  {
    return 0;
  }
  const center = calculateCellCenter(building.buildingEntrance.row, building.buildingEntrance.col);
  return center.x;
};

const getQueueY = (building) => {
  if (!building.buildingEntrance) 
  {
    return 0;
  }
  const center = calculateCellCenter(building.buildingEntrance.row, building.buildingEntrance.col);
  return center.y;
};

const viewBox = computed(() => {
  let minX, minY, maxX, maxY;
  let initialized = false;
  
  for (let row = 0; row < gridHeight.value; row++) {
    for (let col = 0; col < gridWidth.value; col++) {
      const center = calculateCellCenter(row, col);
      const halfSize = CELL_SIZE / 2;
      
      const vertices = [
        { x: center.x, y: center.y - halfSize },         
        { x: center.x + halfSize, y: center.y },          
        { x: center.x, y: center.y + halfSize },          
        { x: center.x - halfSize, y: center.y }           
      ];

      if (!initialized) {
        minX = vertices[0].x;
        maxX = vertices[0].x;
        minY = vertices[0].y;
        maxY = vertices[0].y;
        initialized = true;
      }
      
      vertices.forEach(vertex => {
        minX = Math.min(minX, vertex.x);
        maxX = Math.max(maxX, vertex.x);
        minY = Math.min(minY, vertex.y);
        maxY = Math.max(maxY, vertex.y);
      });
    }
  }
  
  if (entrance.value && entrance.value.row !== -1 && entrance.value.col !== -1) {
    const center = calculateCellCenter(entrance.value.row, entrance.value.col);
    const halfSize = CELL_SIZE / 2;
    
    const entranceVertices = [
      { x: center.x, y: center.y - halfSize },
      { x: center.x + halfSize, y: center.y },
      { x: center.x, y: center.y + halfSize },
      { x: center.x - halfSize, y: center.y }
    ];
    
    entranceVertices.forEach(vertex => {
      minX = Math.min(minX, vertex.x);
      maxX = Math.max(maxX, vertex.x);
      minY = Math.min(minY, vertex.y);
      maxY = Math.max(maxY, vertex.y);
    });
  }
  
  if (!isFinite(minX)) {
    minX = 0;
    maxX = 600;
    minY = 0;
    maxY = 600;
  }
  
  const padding = CELL_SIZE;
  minX = minX - padding;
  maxX = maxX + padding;
  minY = minY - padding;
  maxY = maxY + padding;
  
  const width = maxX - minX;
  const height = maxY - minY;
  
  return `${minX} ${minY} ${width} ${height}`;
});

const boardStyle = computed(() => ({
  '--cell-size': `${CELL_SIZE}px`,
  width: '100%',
  height: '100%',
  minHeight: '600px'
}));

const getCellStyle = (row, col, cellData) => ({
  fill: getCellBackgroundColor(row, col, grid.value, gridWidth.value, gridHeight.value, cellData),
  stroke: getCellBorderColor(row, col, grid.value, gridWidth.value, gridHeight.value, cellData)
});

const getCellClasses = (row, col, cellData) => ({
  'game-board__cell': true,
  'game-board__cell--occupied': cellData?.isOccupied,
  'game-board__cell--highlighted': highlightedCells.value.some(h => h.row === row && h.col === col)
});

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
  if (!activeTooltip.value || activeTooltip.value.type !== 'queue') 
  {
    return [];
  }
  
  const data = activeTooltip.value.data;
  return [
    { key: 'length', label: 'Очередь', value: `${data.length} человек` },
    { key: 'occupied', label: 'Занято', value: `${data.occupied}/${data.capacity}` },
    { key: 'building', label: 'Здание', value: data.buildingName }
  ];
});

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

const hoverCell = (row, col) => {
  hoveredCell.value = { row, col };
  updatePreviewPlacement();
};

const handleSvgClick = (event) => {
  const target = event.target;
  if (target.classList.contains('visitor') || target.classList.contains('queue-indicator')) 
  {
    return;
  }
    
  activeTooltip.value = null;

  if (!target.classList.contains('game-board__cell')) 
  {
    return;
  }
  const row = parseInt(target.getAttribute('data-row'));
  const col = parseInt(target.getAttribute('data-col'));
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
 
  for (const shapePart of objectShape) 
  {
    const targetRow = originRow + shapePart.y;
    const targetCol = originCol + shapePart.x;
    let isCurrentCellError = false;
    if (!isValidCell(targetRow, targetCol, gridWidth.value, gridHeight.value)) 
    {
      canPlace = false;
      isCurrentCellError = true;
    } 
    else if (isCellOccupied(targetRow, targetCol, grid.value, gridWidth.value, gridHeight.value)) 
    {
      canPlace = false;
      isCurrentCellError = true;
    }
    previewCells.push({ row: targetRow, col: targetCol, isError: isCurrentCellError });
  }
  isPlacementPossible.value = canPlace;
  highlightedCells.value = previewCells;
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
  width: 100%;
  height: 100%;
  min-height: 600px;
}
.game-board {
  width: 100%;
  height: 100%;
  background: #f0f0f0; 
  border: 2px solid #000000;
  border-radius: 4px;
  
  &__cell {
    stroke-width: 1;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      stroke-width: 2;
      filter: brightness(0.9);
    }
    
    &--occupied {
      stroke-width: 2;
    }
    
    &--highlighted {
      stroke-dasharray: 4;
      stroke-width: 2;
    }
  }
  &__entrance {
    stroke-width: 2;
    stroke-dasharray: 4;
  }
}
.visitor {
  cursor: pointer;
  transition: all 0.3s ease;
  stroke: white;
  stroke-width: 1;
  
  &:hover {
    r: calc(var(--cell-size) / 3);
    stroke-width: 2;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }

  &__balance {
    font-size: 8px;
    font-weight: bold;
    fill: white;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    pointer-events: none;
    font-family: Arial, sans-serif;
  }
}

.queue-indicator {
  fill: #ff9800;
  stroke: white;
  stroke-width: 1;
  
  &:hover {
    r: calc(var(--cell-size) / 2.5);
    stroke-width: 2;
  }
  
  &__count {
    font-size: 10px;
    font-weight: bold;
    fill: white;
    pointer-events: none;
    font-family: Arial, sans-serif;
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