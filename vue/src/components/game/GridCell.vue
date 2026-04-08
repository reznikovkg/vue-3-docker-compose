<template>
  <div
      class="grid__tile"
      :style="style"
      :class="classes"
      @click="handleClick"
      @mouseover="handleHover"
  />
</template>

<script setup>
import {computed} from 'vue'
import {useStore} from 'vuex'

const props = defineProps({
  x: Number,
  y: Number
})

const store = useStore()

const occupiedMap = computed(() => store.getters.occupiedMap)
const previewMap = computed(() => store.getters.previewMap)

const emit = defineEmits(['hoverCell'])

const selectedShape = computed(() => store.state.grid.selectedShape)
const mode = computed(() => store.state.grid.mode)

const key = computed(() => `${props.x}-${props.y}`)

const color = computed(() => {
  if (previewMap.value?.has(key.value)) {
    return previewMap.value.get(key.value)
  }

  if (occupiedMap.value?.has(key.value)) {
    return occupiedMap.value.get(key.value)
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

const handleHover = () => {
  emit('hoverCell', { x: props.x, y: props.y })
}

const handleClick = () => {
  const shape = store.state.grid.selectedShape
  const origin = { x: props.x, y: props.y }

  if (mode.value === 'delete') {
    store.dispatch('removeObject', {
      x: props.x,
      y: props.y
    })
  }

  if (!shape) return

  if (mode.value === 'build' && selectedShape.value) {
    store.dispatch('placeObject', {
      shape,
      origin
    })
  }
}

const classes = computed(() => ({
  'grid-cell': true,
  'grid-cell--preview': previewMap.value?.has(key.value),
  'grid-cell--invalid': previewMap.value?.get(key.value) === 'red',
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