<>
<template>
  <div class="game-page">
    <div class="game-page__container">

      <div class="game-page__grid-panel"
           @mousedown="onMouseDown"
           @mousemove="onMouseMove"
           @mouseup="onMouseUp"
           @mouseleave="onMouseUp"
           @wheel="onWheel">>

        <div class="game-page__grid"
             :style="gridStyle">
          <GameGrid/>
        </div>

      </div>

      <div class="game-page__toolbar-panel">
        <Toolbar/>
      </div>

    </div>
  </div>
</template>

<script setup>
import Toolbar from '../game/Toolbar.vue'
import GameGrid from '../game/GameGrid.vue'
import {useStore} from "vuex";
import {computed} from "vue";

const store = useStore()

const isPanning = computed(() => store.state.viewport.isPanning)

let startX = 0
let startY = 0

const onMouseDown = (e) => {
  store.dispatch('startPanning')

  startX = e.clientX
  startY = e.clientY
}

const onMouseMove = (e) => {
  if (!store.state.viewport.isPanning) return

  const dx = e.clientX - startX
  const dy = e.clientY - startY

  startX = e.clientX
  startY = e.clientY

  store.dispatch('movePanning', {dx, dy})
}

const onMouseUp = () => {
  store.dispatch('stopPanning')
}

const onWheel = (e) => {
  e.preventDefault()

  const zoomSpeed = 0.001

  let newScale = store.state.viewport.scale - e.deltaY * zoomSpeed

  newScale = Math.min(Math.max(newScale, 0.5), 2)

  store.dispatch('setScale', newScale)
}

const gridStyle = computed(() => {
  const {offsetX, offsetY, scale} = store.state.viewport

  return {
    transform: `
      translate(${offsetX}px, ${offsetY}px)
      rotateX(60deg)
      rotateZ(45deg)
      scale(${scale})
    `
  }
})
</script>

<style lang="less" scoped>
.game-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f2f2f2;

  &__container {
    display: flex;
    gap: 20px;

    padding: 20px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  &__grid-panel {
    width: 900px;
    height: 600px;

    border-radius: 12px;
    border: 2px solid #e0e0e0;
    background: #cccccc;

    overflow: hidden;
    position: relative;
    user-select: none;

    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }

  &__toolbar-panel {
    width: 280px;

    background: #fafafa;
    border-radius: 12px;
    border: 2px solid #e0e0e0;

    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    max-height: 600px;
    overflow-y: auto;
  }
}
</style>

