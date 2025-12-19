<template>
    <RouterLink :to="{ name: $routes.INDEX }">To Index</RouterLink>
    <div>
        Grid page
    </div>
    <div class="cell-grid">
        <DynamicGrid
        v-model="items" 
        :rows="rows" 
        :cols="cols"
        @drop="(data) => handleDrop(data)">
            <template #cell="{ item }">
                <div class="sample-cell" :class="item.colorClass">
                    {{  }}
                </div>
            </template>
        </DynamicGrid>
    </div>
    <div>
        <div class="scores">
            Score: {{ score }}
        </div>
        <div class="inputs buttons">
            <button @click="() => addItem()">
                Add
            </button>
            <button @click="() => restart()">
                New game
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import DynamicGrid from '../DynamicGrid.vue';

const rows = ref(8)
const cols = ref(8)
const score = ref(0)
const capacity = computed(() => rows.value * cols.value)
const items = ref([])

const colorSequence = [
    { name: 'cell-red', score: 0 }, 
    { name: 'cell-yellow', score: 10 }, 
    { name: 'cell-green', score: 20 }, 
    { name: 'cell-cyan', score: 50 }, 
    { name: 'cell-blue', score: 100 }, 
    { name: 'cell-purple', score: 200 }
]


onMounted(() => {
    if (!tryLoadGameFromStorage()) {
        initItems()
    }
})

const restart = () => {
    items.value = []
    score.value = 0
    removeGameFromStorage()
    initItems()
}

const initItems = () => {
    fillWithEmpty()
    for (let i = 0; i < 10; i++)
    {
        addItem()
    }
}

const tryLoadGameFromStorage = () => {
    const savedItems = localStorage.getItem('items')
    if (savedItems == null) {
        return false
    }
    
    const savedScore = localStorage.getItem('score')
    if (savedScore == null) {
        return false
    }

    items.value = JSON.parse(savedItems)
    score.value = JSON.parse(savedScore)
    return true
}

const saveGameToStorage = () => {
    localStorage.setItem('items', JSON.stringify(items.value))
    localStorage.setItem('score', JSON.stringify(score.value))
}

const removeGameFromStorage = () => {
    localStorage.removeItem('items')
    localStorage.removeItem('score')
}

const addItem = () => {
    if (items.value.length > capacity.value) {
        return
    }

    var colorIndex = Math.floor(Math.random() * 3)
    var color = colorSequence[colorIndex]

    const item = { colorClass: color.name }
    
    var positionIndex = getPositionIndex()
    items.value.splice(positionIndex, 1, item)
}

const getPositionIndex = () => {
    const positions = [];
    
    items.value.forEach((element, index) => {
        if (element.colorClass == 'cell-empty') {
            positions.push(index);
        }
    });
    const randomPositionIndex = Math.floor(Math.random() * positions.length);
    return positions[randomPositionIndex];
}

const fillWithEmpty = () => {
    for (let i = 0; i < rows.value * cols.value; i++)
    {
        items.value.push({ colorClass: 'cell-empty' })
    }
}

const handleDrop = ({ draggingIndex, dropIndex }) => {
    const draggedElement = items.value[draggingIndex]
    const dropElement = items.value[dropIndex]
    
    console.log(dropElement)
    if (dropElement.colorClass == 'cell-empty') {
        
        swapItems(draggingIndex, dropIndex)
        saveGameToStorage()
        return
    }
    
    var mergedItem = mergeItems(draggedElement, dropElement);
    if (mergedItem == null) {
        return
    }
    
    const emptyItem = { colorClass: 'cell-empty'}

    const newItems = [...items.value]
    newItems.splice(Math.max(draggingIndex, dropIndex), 1)
    newItems.splice(Math.min(draggingIndex, dropIndex), 1)
    newItems.splice(draggingIndex, 0, emptyItem)
    newItems.splice(dropIndex, 0, mergedItem)

    items.value = newItems

    addItem()
    saveGameToStorage()
}

const swapItems = (firstIndex, secondIndex) => {
    console.log('SWAP DROP')
    const newItems = [...items.value]
    const [draggedElement] = newItems.splice(firstIndex, 1, newItems[secondIndex])
    newItems.splice(secondIndex, 1, draggedElement)
    items.value = newItems
}

const mergeItems = (first, second) => {
    if (first.colorClass != second.colorClass) {
        return null
    }

    const currentIndex = colorSequence.findIndex(i => i.name == first.colorClass)
    
    if (currentIndex === -1) {
        return null
    }
    
    if (currentIndex === colorSequence.length - 1) {
        return null
    }

    var color = colorSequence[currentIndex + 1]
    score.value += color.score;

    return { colorClass: color.name }
}
</script>

<style scoped>
.cell-grid {
    margin: 32pt;
    padding: 32pt;
    border-radius: 12px;
    border: 3px solid rgb(55, 55, 55);
}

.sample-cell {
    height: 76px;
    width: 76px;
    border: 7px solid rgba(0, 0, 0, 0);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
}

.inputs {
    padding: 12pt;
    display: flex;
    flex-direction: column;
}

.buttons {
    gap: 12pt;
}

.scores {
    padding: 12pt;
    font-size: x-large
}

.cell-red {
    border-color: rgb(196, 0, 0);
    box-shadow: 
        0 0 10px rgb(255, 0, 0),
        0 0 20px rgb(214, 0, 0),
        0 0 40px rgba(255, 0, 0, 0.4);
}

.cell-green {
    border-color: rgb(41, 206, 0);
    box-shadow:
        0 0 10px rgb(51, 255, 0),
        0 0 20px rgb(51, 255, 0),
        0 0 40px rgba(51, 255, 0, 0.4);
}

.cell-yellow {
    border-color: rgb(228, 224, 0);
    box-shadow:
        0 0 10px rgb(255, 251, 0),
        0 0 20px rgb(255, 251, 0),
        0 0 40px rgba(201, 197, 0, 0.4);
}

.cell-blue {
    border-color: rgb(0, 99, 230);
    box-shadow:
        0 0 10px rgb(0, 110, 255),
        0 0 20px rgb(0, 110, 255),
        0 0 40px rgba(0, 67, 155, 0.4);
}

.cell-purple {
    border-color: rgb(226, 0, 226);
    box-shadow:
        0 0 10px rgb(255, 0, 255),
        0 0 20px rgb(255, 0, 255),
        0 0 40px rgba(145, 0, 145, 0.4);
}

.cell-cyan {
    border-color: rgb(0, 200, 226);
    box-shadow:
        0 0 10px rgb(0, 225, 255),
        0 0 20px rgb(0, 225, 255),
        0 0 40px rgba(0, 135, 153, 0.4);
}

.cell-empty {
    border: 3px dashed rgb(55, 55, 55);
}
</style>
