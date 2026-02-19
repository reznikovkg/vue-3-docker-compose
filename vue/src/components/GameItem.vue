<template>
<div
    v-if="item"
    class="item"
    :class="{ 'dragging': isDragging }"
    :style="{ 
      backgroundColor: item.color,
      cursor: 'grab'
    }"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
>
    <div class="emoji">{{ item.emoji }}</div>
    <div class="level">Ур. {{ item.level }}</div>
</div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
item: Object,
row: Number,
col: Number
});

const emit = defineEmits(['dragstart', 'dragend', 'touchmove', 'touchend']);

const isDragging = ref(false);
let touchStartX = 0;
let touchStartY = 0;

function onDragStart(e) {
isDragging.value = true;
e.dataTransfer.effectAllowed = 'move';
e.dataTransfer.setData('application/json', JSON.stringify({
    row: props.row,
    col: props.col,
    item: props.item
}));
emit('dragstart', { row: props.row, col: props.col });
}

function onDragEnd() {
isDragging.value = false;
emit('dragend');
}

function onTouchStart(e) {
isDragging.value = true;
const touch = e.touches[0];
touchStartX = touch.clientX;
touchStartY = touch.clientY;
emit('dragstart', { row: props.row, col: props.col });
}

function onTouchMove(e) {
e.preventDefault();
const touch = e.touches[0];
emit('touchmove', {
    x: touch.clientX,
    y: touch.clientY,
    startX: touchStartX,
    startY: touchStartY
});
}

function onTouchEnd(e) {
isDragging.value = false;
const touch = e.changedTouches[0];
emit('touchend', {
    x: touch.clientX,
    y: touch.clientY
});
}
</script>

<style scoped>
.game-item {
width: 100%;
height: 100%;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
border-radius: 8px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
transition: transform 0.2s, box-shadow 0.2s;
user-select: none;
-webkit-user-select: none;
touch-action: none;
}

.game-item:hover {
transform: scale(1.05);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.game-item--dragging {
opacity: 0.5;
cursor: grabbing;
}

.game-item__emoji {
font-size: 32px;
margin-bottom: 4px;
}

.game-item__level {
font-size: 12px;
font-weight: bold;
color: rgba(255, 255, 255, 0.9);
text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
</style>