<template>
  <div
      class="grid__tile"
      :style="style"
      :class="classes"
      @click="handleClick"
      @dragover.prevent="handleDragOver"
  />
</template>

<script setup>
import {computed} from 'vue'
import {useStore} from 'vuex'
import {MUTATIONS} from "@/store/index.js";

const props = defineProps({
  x: Number,
  y: Number,
  occupiedMap: Map,
  previewMap: Map
})

const store = useStore()

const emit = defineEmits(['dropCell', 'hoverCell'])

const handleDragOver = () => {
  emit('hoverCell', {x: props.x, y: props.y})
}

const color = computed(() => {
  const key = `${props.x}-${props.y}`

  if (props.previewMap?.has(key)) {
    return props.previewMap.get(key)
  }

  if (props.occupiedMap?.has(key)) {
    return props.occupiedMap.get(key)
  }

  return 'white'
})

const style = computed(() => {
  const offset = store.state.grid.width * 30

  return {
    transform: `translate(${props.x * 60 - offset}px, ${props.y * 60 - offset}px)`,
    backgroundColor: color.value
  }
})

const handleClick = () => {
  const grid = store.state.grid

  if (grid.mode === 'delete') {
    store.commit(MUTATIONS.REMOVE_OBJECT, {
      x: props.x,
      y: props.y
    })
  }
}

const key = computed(() => `${props.x}-${props.y}`)

const classes = computed(() => ({
  'grid-cell': true,
  'grid-cell--preview': props.previewMap?.has(key.value),
  'grid-cell--invalid': props.previewMap?.get(key.value) === 'red',
}))
</script>

<style lang="less" scoped>
.grid-cell {
  opacity: 1;

  &--preview {
    opacity: 0.6;
  }

  &--invalid {
    opacity: 1;
  }
}
</style>