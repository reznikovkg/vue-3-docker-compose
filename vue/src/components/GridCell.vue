<template>
<div
    class="grid-cell"
    :class="{ 
      'highlight': isHighlighted,
      'can-merge': canMergeHere
    }"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
>
    <GameItem
      v-if="cell.item"
      :item="cell.item"
      :row="cell.row"
      :col="cell.col"
      @dragstart="$emit('item-dragstart', $event)"
      @dragend="$emit('item-dragend')"
      @touchmove="$emit('item-touchmove', $event)"
      @touchend="handleTouchEnd"
    />
</div>
</template>

<script setup>
import { ref } from 'vue';
import GameItem from './GameItem.vue';

const props = defineProps({
cell: Object,
draggingItem: Object
});

const emit = defineEmits(['merge', 'item-dragstart', 'item-dragend', 'item-touchmove', 'item-touchend']);

const isHighlighted = ref(false);
const canMergeHere = ref(false);

function onDragOver(e) {
e.preventDefault();
isHighlighted.value = true;

if (props.draggingItem && props.cell.item) {
    canMergeHere.value = props.draggingItem.item.level === props.cell.item.level;
}
}

function onDragLeave() {
isHighlighted.value = false;
canMergeHere.value = false;
}

function onDrop(e) {
e.preventDefault();
isHighlighted.value = false;
canMergeHere.value = false;

try {
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    emit('merge', {
      from: { row: data.row, col: data.col },
      to: { row: props.cell.row, col: props.cell.col }
    });
} catch (err) {
    console.error('Ошибка при drop:', err);
}
}

function handleTouchEnd(touchData) {
emit('item-touchend', {
    ...touchData,
    targetCell: props.cell
});
}
</script>

<style scoped>
.grid-cell {
aspect-ratio: 1;
background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
border: 2px solid #bdc3c7;
border-radius: 8px;
display: flex;
align-items: center;
justify-content: center;
transition: all 0.2s;
position: relative;
}

.grid-cell--highlight {
border-color: #3498db;
background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
transform: scale(0.95);
}

.grid-cell--can-merge {
border-color: #27ae60;
background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.3);
}
</style>