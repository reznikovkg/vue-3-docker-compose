<template>
  <div class="game-wrapper">
    <div class="game-wrapper__top">
      <h1 class="game-wrapper__name">Числовое слияние</h1>
      <p class="game-wrapper__points">
        Очки: <b>{{ scrore }}</b>
      </p>
    </div>
    <div class="game-wrapper__btns">
      <button
        class="btn btn--green"
        :disabled="draging"
        @click="() => spawnNumber()"
      >
        + Число
      </button>
      <button
        class="btn btn--danger"
        @click="() => restartGame()"
      >
        Сбросить
      </button>
    </div>
    <div
      class="game-wrapper__field"
      :style="{ 'grid-template-columns': `repeat(${grdiSize}, 1fr)` }"
      @dragover.prevent
      @drop="() => onFieldDrop()"
    >
      <CellItem
        v-for="(cell, i) in cells"
        :key="i"
        :data="cell"
        :idx="i"
        :is-drag="draging"
        @start-drag="(data, idx) => onStartDrag(data, idx)"
        @stop-drag="() => onStopDrag()"
        @cell-drop="(idx) => onCellDrop(idx)"
        @cell-touch-move="(evt, idx) => onCellTouchMove(evt, idx)"
        @cell-touch-end="(evt, idx) => onCellTouchEnd(evt, idx)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import CellItem from '../ui/CellItem.vue'

const store = useStore()

const cells = computed(() => store.getters['game/getCells'])
const scrore = computed(() => store.getters['game/getScore'])
const grdiSize = computed(() => store.getters['game/getGridSize'])

const draging = ref(false)
const dragItem = ref(null)
const dragFromIdx = ref(null)
const touchStart = ref(null)

onMounted(() => {
  store.dispatch('game/loadState')
})

const spawnNumber = () => {
  if (draging.value) return
  store.dispatch('game/spawnNumber')
}

const restartGame = () => {
  if (!confirm('Точно хочешь начать заново?')) return
  store.dispatch('game/createField')
}

const onStartDrag = (data, idx) => {
  if (!data) return
  draging.value = true
  dragItem.value = data
  dragFromIdx.value = idx
}

const onStopDrag = () => {
  draging.value = false
  dragItem.value = null
  dragFromIdx.value = null
  touchStart.value = null
}

const onCellDrop = (targetIdx) => {
  if (!dragItem.value || dragFromIdx.value === targetIdx) {
    onStopDrag()
    return
  }
  store.dispatch('game/tryMerge', { from: dragFromIdx.value, to: targetIdx })
  onStopDrag()
}

const onFieldDrop = () => {
  onStopDrag()
}

const onCellTouchMove = (evt, idx) => {
  if (!touchStart.value) {
    touchStart.value = { index: idx, data: cells.value[idx] }
  }
}

const onCellTouchEnd = (evt, targetIdx) => {
  if (!touchStart.value || !touchStart.value.data) {
    touchStart.value = null
    return
  }
  if (touchStart.value.index !== targetIdx) {
    store.dispatch('game/tryMerge', { from: touchStart.value.index, to: targetIdx })
  }
  touchStart.value = null
}
</script>

<style scoped lang="scss">
.game-wrapper {
  max-width: 750px;
  margin: 10px auto;
  padding: 16px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  &__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px 18px;
    background: #16213e;
    border-radius: 12px;
    color: #e0e0e0;
    border: 1px solid #2a2a4a;
  }
  &__name {
    margin: 0;
    font-size: 22px;
    letter-spacing: 0.5px;
  }
  &__points {
    margin: 0;
    font-size: 18px;
    b {
      color: #f7d354;
      font-size: 22px;
    }
  }
  &__btns {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }
  &__field {
    display: grid;
    gap: 5px;
    background: #0f3460;
    padding: 8px;
    border-radius: 12px;
    min-height: 380px;
    border: 1px solid #1a4a7a;
  }
}
</style>
