<template>
<div class="grid">
    <div class="header">
      <div class="stats">
        <div class="stat">
          <span class="label">Очки:</span>
          <span class="value">{{ score }}</span>
        </div>
        <div class="stat">
          <span class="label">Ходы:</span>
          <span class="value">{{ moves }}</span>
        </div>
        <div class="stat">
          <span class="label">Свободно:</span>
          <span class="value">{{ emptyCells.length }}</span>
        </div>
      </div>
      <div class="controls">
        <button class="btn primary" @click="addRandomItem">
          ➕ Добавить предмет
        </button>
        <button class="btn secondary" @click="newGame">
          🔄 Новая игра
        </button>
      </div>
    </div>

    <div 
      class="board"
      :style="{ 
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`
      }"
    >
    <template v-for="(row, rowIndex) in grid" :key="'row-${rowIndex}'">
      <GridCell
        v-for="(cell, colIndex) in row"
        :key="`cell-${rowIndex}-${colIndex}`"
        :cell="cell"
        :dragging-item="draggingItem"
        @merge="handleMerge"
        @item-dragstart="handleDragStart"
        @item-dragend="handleDragEnd"
        @item-touchmove="handleTouchMove"
        @item-touchend="handleTouchEnd"
      />
      </template>
    </div>
</div>
</template>

<script setup>
import { ref } from 'vue';
import GridCell from './GridCell.vue';
import { useGameLogic } from '../composables/useGameLogic.js';
import { GRID_SIZE } from '../config/itemsConfig.js';

const gridSize = GRID_SIZE;
const { grid, score, moves, emptyCells, addRandomItem, mergeItems, newGame, initGame } = useGameLogic();

const draggingItem = ref(null);

initGame();

function handleDragStart(data) {
draggingItem.value = {
    row: data.row,
    col: data.col,
    item: grid.value[data.row][data.col].item
};
}

function handleDragEnd() {
draggingItem.value = null;
}

function handleMerge({ from, to }) {
mergeItems(from.row, from.col, to.row, to.col);
draggingItem.value = null;
}

function handleTouchEnd(data) {
if (!draggingItem.value) return;

const element = document.elementFromPoint(data.x, data.y);
const cellElement = element?.closest('.grid-cell');

if (cellElement && data.targetCell) {
    mergeItems(
      draggingItem.value.row,
      draggingItem.value.col,
      data.targetCell.row,
      data.targetCell.col
    );
}

draggingItem.value = null;
}
</script>

<style scoped>
.game-grid {
width: 100%;
max-width: 600px;
margin: 0 auto;
padding: 0;
display: flex;
flex-direction: column;
align-items: center;
left: 50%;
transform: translateX(50%);
}

.game-grid__header {
margin-bottom: 20px;
width: 100%;
padding: 0 10px;
}

.stats {
display: flex;
gap: 20px;
margin-bottom: 15px;
justify-content: center;
flex-wrap: wrap;
}

.stat {
background: white;
padding: 10px 20px;
border-radius: 8px;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat__label {
font-weight: bold;
color: #7f8c8d;
margin-right: 8px;
}

.stat__value {
font-size: 20px;
font-weight: bold;
color: #2c3e50;
}

.controls {
display: flex;
gap: 10px;
justify-content: center;
}

.btn {
padding: 12px 24px;
border: none;
border-radius: 8px;
font-size: 16px;
font-weight: bold;
cursor: pointer;
transition: all 0.2s;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn:hover {
transform: translateY(-2px);
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn:active {
transform: translateY(0);
}

.btn--primary {
background: #3498db;
color: white;
}

.btn--primary:hover {
background: #2980b9;
}

.btn--secondary {
background: #95a5a6;
color: white;
}

.btn--secondary:hover {
background: #7f8c8d;
}
.game-grid__board {
display: grid;
gap: 8px;
background: #34495e;
padding: 8px;
border-radius: 12px;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
width: 600px;
height: 600px;
aspect-ratio: 1;
margin: 0 auto;
flex-shrink: 0;
}

@media (max-width: 600px) {
.game-grid {
    padding: 10px;
}

.game-grid__board {
    width: calc(100vw - 40px);
    height: calc(100vw - 40px);
    max-width: 600px;
    max-height: 600px;
    gap: 4px;
    padding: 4px;
}

.stats {
    gap: 10px;
}

.stat{
    padding: 8px 12px;
}

.stat__value{
    font-size: 16px;
}

.controls {
    width: 100%;
}

.btn{
    flex: 1;
    min-width: 140px;
}
}
</style>