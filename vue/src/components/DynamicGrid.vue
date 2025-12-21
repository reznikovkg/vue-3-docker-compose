<template>
    <div 
        class="dyn-grid" 
        :style="{
            '--cols': cols,
            '--rows': rows
        }">
        <div 
            v-for="(item, index) in items" 
            :key="index" 
            class="dyn-grid__cell" 
            :class="{
                'dyn-grid__cell--dragging': index === draggingIndex,
            }"
            draggable="true"
            @dragstart="() => onDragStart(index)"
            @dragover.prevent
            @drop.prevent="() => onDrop(index)">
            <slot 
                name="cell" 
                :item="item" 
                :index="index">
                {{ item }}
            </slot>
        </div>
    </div>
</template>
 
<script setup>
import { computed, ref } from 'vue'
 
const props = defineProps({
    modelValue: { type: Array, required: true },
    rows: { type: Number, default: 3 },
    cols: { type: Number, default: 4 },
})
 
const emit = defineEmits(['update:modelValue', 'drop'])
 
const items = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})
 
const draggingIndex = ref(null)
 
const onDragStart = (item) => {
    draggingIndex.value = item
}
 
const onDrop = (index) => {
    if (draggingIndex.value !== null && draggingIndex.value !== index) {
        emit('drop', {
            draggingIndex: draggingIndex.value,
            dropIndex: index
        })
        console.log('dropped ' + draggingIndex.value + ' onto ' + index);
    }
    draggingIndex.value = null
}
</script>
 
<style scoped lang="less">
.dyn-grid {
    display: grid;
    flex-wrap: wrap;
    grid-template-columns: repeat(var(--cols), 70px);
    grid-template-rows: repeat(var(--rows), 70px);
    gap: 12pt;
 
    &__cell> {
        width: 100%;
        height: 100%;
    }
 
    &__cell {
        transition: transform .30s ease, box-shadow .30s ease, outline-color .30s ease;
        will-change: transform;
    }
 
    &__cell:hover {
        transform: translateY(-2px);
    }
 
    &--dragging {
        opacity: .85;
        transform: rotate(15);
        box-shadow: 0 8px 18px rgba(0, 0, 0, .15);
    }
}
</style>