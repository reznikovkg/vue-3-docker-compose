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
                'dyn-grid__cell--over': index === overIndex && draggingIndex !== null
            }"
            draggable="true"
            @dragstart="(e) => onDragStart(e, index)"
            @dragenter.prevent="() => onDragEnter(index)"
            @dragover.prevent
            @dragend="() => onDragEnd()"
            @drop.prevent="() => onDrop()">
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
 
const emit = defineEmits(['update:modelValue'])
 
const items = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})
 
const draggingIndex = ref(null)
const overIndex = ref(null)
 
const onDragStart = (e, index) => {
    draggingIndex.value = index
    overIndex.value = index
    try {
        const dt = e.dataTransfer
        dt.effectAllowed = 'move'
    } catch (_) {}
}
 
const onDragEnter = (hoverIndex) => {
    if (draggingIndex.value == null) {
        return
    }
    if (hoverIndex === draggingIndex.value) {
        return
    }
    const updated = [...items.value]
    const [moved] = updated.splice(draggingIndex.value, 1)
    updated.splice(hoverIndex, 0, moved)
 
    items.value = updated
    draggingIndex.value = hoverIndex
    overIndex.value = hoverIndex
}
 
const onDrop = () => {
    draggingIndex.value = null
    overIndex.value = null
}
 
const onDragEnd = () => {
    draggingIndex.value = null
    overIndex.value = null
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
        transform: scale(.98);
        box-shadow: 0 8px 18px rgba(0, 0, 0, .15);
    }
 
    &--over:not(&--dragging) {
        outline: 2px dashed #9a9a9a;
        outline-offset: 2px;
    }
}
</style>