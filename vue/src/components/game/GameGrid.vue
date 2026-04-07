<template>
  <div class="grid"
       @dragover.prevent
       @drop="onDrop"
       >
    <div
        v-for="y in height"
        :key="y"
        class="grid__row"
    >
      <GridCell
          v-for="x in width"
          :key="`${x}-${y}`"
          :x="x - 1"
          :y="y - 1"
          :occupiedMap="occupiedMap"
          :previewMap="previewMap"
          @hoverCell="onHoverCell"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import GridCell from "@/components/game/GridCell.vue";
import {MUTATIONS} from "@/store/index.js";

const store = useStore()

const width = computed(() => store.state.grid.width)
const height = computed(() => store.state.grid.height)

const draggingShape = computed(() => store.state.grid.draggingShape)
const previewOrigin = computed(() => store.state.grid.previewOrigin)

const onDrop = (e) => {
  e.preventDefault()

  const shape = store.state.grid.draggingShape
  const origin = store.state.grid.previewOrigin

  if (!shape || !origin) return

  const valid = canPlace(shape, origin, occupiedMap.value)

  if (valid) {
    store.commit(MUTATIONS.ADD_OBJECT, {
      id: crypto.randomUUID(),
      shape,
      origin
    })
  }

  store.commit(MUTATIONS.SET_DRAGGING, null)
  store.commit(MUTATIONS.SET_PREVIEW_ORIGIN, null)
}

const occupiedMap = computed(() => {
  const map = new Map()

  for (const obj of store.state.grid.objects) {
    for (const cell of obj.shape.cells) {
      const x = obj.origin.x + cell.x
      const y = obj.origin.y + cell.y

      map.set(`${x}-${y}`, obj.shape.color)
    }
  }

  return map
})

const canPlace = (shape, origin, occupiedMap) => {
  if (!shape || !origin || !occupiedMap) return false

  return shape.cells.every(cell => {
    const x = origin.x + cell.x
    const y = origin.y + cell.y

    if (x < 0 || y < 0 || x >= width.value || y >= height.value) {
      return false
    }

    return !occupiedMap.has(`${x}-${y}`)
  })
}

const previewMap = computed(() => {
  const map = new Map()

  const shape = draggingShape.value
  const origin = previewOrigin.value

  if (!shape || !origin) return map

  const valid = canPlace(shape, origin, occupiedMap.value)

  shape.cells.forEach(cell => {
    const x = origin.x + cell.x
    const y = origin.y + cell.y

    map.set(`${x}-${y}`, valid ? shape.color : 'red')
  })

  return map
})

const onHoverCell = ({ x, y }) => {
  store.commit(MUTATIONS.SET_PREVIEW_ORIGIN, { x, y })
}
</script>

<style lang="less" scoped>
.grid {
  position: absolute;
  left: 50%;
  top: 50%;

  transform: translate(-50%, -50%) rotateX(60deg) rotateZ(45deg);
  transform-style: preserve-3d;

  &__tile {
    position: absolute;
    width: 60px;
    height: 60px;
    background: white;
    border: 1px solid #ddd;
  }
}
</style>
