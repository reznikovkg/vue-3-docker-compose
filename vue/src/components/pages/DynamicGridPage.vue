<template>
    <RouterLink :to="{ name: $routes.INDEX }">To Index</RouterLink>
    <div>
        Grid page
    </div>
    <DynamicGrid v-model="items" :rows="rows" :cols="cols">
        <template #cell="{ item }">
            <div class="sample-cell">
                {{ item }}
            </div>
        </template>
    </DynamicGrid>
    <div>
        <div class="inputs">
            <div>
                Rows:
                <input type="number" v-model="rows" @change="() => trimItems()">
            </div>
            <div>
                Cols:
                <input type="number" v-model="cols" @change="() => trimItems()">
            </div>
        </div>
        <div class="inputs">
            <button @click="() => addItem()">
                Add
            </button>
            <button @click="() => removeItem()">
                Remove
            </button>
            <button @click="() => generateItems()">
                Generate
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DynamicGrid from '../DynamicGrid.vue';

const rows = ref(5)
const cols = ref(5)
const capacity = computed(() => rows.value * cols.value)
const items = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

const addItem = () => {
    if (items.value.length >= capacity.value) {
        return;
    }

    const item = items.value.length + 1
    console.log('add ', item)
    items.value.push(item)
}

const removeItem = () => {
    items.value.pop()
}

const generateItems = () => {
    while (items.value.length < capacity.value) {
        addItem()
    }
}

const trimItems = () => {
    while (items.value.length > capacity.value) {
        removeItem()
    }
}

</script>
<style scoped>
.sample-cell {
    min-height: 48px;
    min-width: 48px;
    background: rgb(95, 95, 95);
    border: 1px solid rgb(0, 112, 19);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
}

.inputs {
    padding: 12pt;
    display: flex;
    flex-direction: column;
}
</style>
