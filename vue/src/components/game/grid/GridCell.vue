<template>
  <div
      :style="style"
      :class="classes"
      @click="handleClick"
      @mouseenter="handleHover"
  >
    <div v-if="corners.tl" class="grid-cell__corner grid-cell__corner--tl"></div>
    <div v-if="corners.tr" class="grid-cell__corner grid-cell__corner--tr"></div>
    <div v-if="corners.bl" class="grid-cell__corner grid-cell__corner--bl"></div>
    <div v-if="corners.br" class="grid-cell__corner grid-cell__corner--br"></div>
  </div>
</template>

<script setup>
import {computed} from 'vue'
import {useStore} from 'vuex'
import {DARK_COLORS} from "@/constants/colors.js";

const props = defineProps({
  x: Number,
  y: Number
})

const store = useStore()

const occupiedMap = computed(() => store.getters.occupiedMap)
const previewMap = computed(() => store.getters.previewMap)

const emit = defineEmits(['hoverCell'])

const selectedShape = computed(() => store.getters.selectedShape)
const mode = computed(() => store.getters.mode)

const key = computed(() => `${props.x}-${props.y}`)

const color = computed(() => {
  if (previewMap.value?.has(key.value)) {
    return previewMap.value.get(key.value)
  }

  if (occupiedMap.value?.has(key.value)) {
    return occupiedMap.value.get(key.value).shape.color
  }

  return '#c0ea96'
})

const obj = computed(() => occupiedMap.value?.get(key.value))

const getObjectEntry = obj => ({
  x: obj.origin.x + obj.shape.entryOffset.x,
  y: obj.origin.y + obj.shape.entryOffset.y
});

const isEntry = computed(() => {
  if (!obj.value || !obj.value.shape.entryOffset) return false

  const entry = getObjectEntry(obj.value)

  return props.x === entry.x && props.y === entry.y
})

const isConnected = (x, y) => {
  const neighbor = occupiedMap.value?.get(`${x}-${y}`)

  if (!neighbor || !obj.value) return false

  if (obj.value.shape.id === 'road') {
    return neighbor.shape.id === 'road'
  }

  return neighbor === obj.value
}

const hasTop = computed(() => {
  return obj.value && isConnected(props.x, props.y - 1);
})

const hasBottom = computed(() => {
  return obj.value && isConnected(props.x, props.y + 1);
})

const hasLeft = computed(() => {
  return obj.value && isConnected(props.x - 1, props.y);
})

const hasRight = computed(() => {
  return obj.value && isConnected(props.x + 1, props.y);
})

const hasTopLeft = computed(() => {
  return obj.value && isConnected(props.x - 1, props.y - 1);
})

const hasTopRight = computed(() => {
  return obj.value && isConnected(props.x + 1, props.y - 1);
})

const hasBottomLeft = computed(() => {
  return obj.value && isConnected(props.x - 1, props.y + 1);
})

const hasBottomRight = computed(() => {
  return obj.value && isConnected(props.x + 1, props.y + 1);
})

const style = computed(() => {
  const wallColor = DARK_COLORS[color.value] || '#000'
  let shadow = ''

  if (obj.value) {
    if (!hasTop.value) {
      shadow += `inset 0 8px 0 0 ${wallColor},`
    }
    if (!hasBottom.value) {
      shadow += `inset 0 -8px 0 0 ${wallColor},`
    }
    if (!hasLeft.value) {
      shadow += `inset 8px 0 0 0 ${wallColor},`
    }
    if (!hasRight.value) {
      shadow += `inset -8px 0 0 0 ${wallColor},`
    }
  }

  return {
    backgroundColor: color.value,
    color: DARK_COLORS[color.value],
    boxShadow: shadow ? shadow.slice(0, -1) : undefined
  }
})

const corners = computed(() => {
  if (!obj.value) {
    return {}
  }

  return {
    tl: (!hasTop.value && !hasLeft.value) || !hasTopLeft.value,
    tr: (!hasTop.value && !hasRight.value) || !hasTopRight.value,
    bl: (!hasBottom.value && !hasLeft.value) || !hasBottomLeft.value,
    br: (!hasBottom.value && !hasRight.value) || !hasBottomRight.value,
  }
})

const handleHover = () => {
  emit('hoverCell', {x: props.x, y: props.y})
}

const handleClick = () => {
  const origin = {x: props.x, y: props.y}

  if (mode.value === 'delete') {
    store.dispatch('removeObject', {
      x: props.x,
      y: props.y
    })
  }

  if (!selectedShape.value) {
    return
  }

  if (mode.value === 'build' && selectedShape.value) {
    store.dispatch('placeObject', {origin})
        .then(result => {
          if (!result?.ok) {
            alert(result?.message || 'Нельзя поставить')
          }
        })
  }
}

const classes = computed(() => ({
  'grid-cell': true,
  'grid-cell--preview': previewMap.value?.has(key.value),
  'grid-cell--invalid': previewMap.value?.get(key.value) === 'red',
  'grid-cell--entry': isEntry.value
}))
</script>

<style lang="less" scoped>
.grid-cell {
  position: relative;
  width: 60px;
  height: 60px;
  opacity: 1;
  box-sizing: border-box;
  border: solid 1px #222222;

  &--entry {
    outline: 8px dashed #ffffff;
    outline-offset: -8px;
  }

  &--preview {
    opacity: 0.6;
  }

  &--invalid {
    opacity: 1;
  }

  &__corner {
    position: absolute;
    width: 8px;
    height: 8px;
    background: currentColor;

    &--tl { top: 0; left: 0; }
    &--tr { top: 0; right: 0; }
    &--bl { bottom: 0; left: 0; }
    &--br { bottom: 0; right: 0; }
  }
}
</style>