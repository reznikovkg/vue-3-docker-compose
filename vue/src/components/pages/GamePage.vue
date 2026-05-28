<template>
  <div class="game-wrapper">
    <div class="game-wrapper__top">
      <h1 class="game-wrapper__name">Собери пару</h1>
      <p class="game-wrapper__points">
        Очки: <b>{{ score }}</b>
      </p>
    </div>
    <div class="game-wrapper__btns">
      <button
        class="btn btn--blue"
        :disabled="!expandInfo.canExpand"
        @click="() => expandField()"
      >
        Расширить ({{ expandInfo.cost }} оч.)
        <span v-if="!expandInfo.canExpand" class="btn--blue__hint">
          нужно {{ expandInfo.condition }}
        </span>
      </button>
      <button class="btn btn--green" @click="() => spawnItem()">
        + Предмет (−10)
      </button>
      <button class="btn btn--danger" @click="() => restartGame()">
        Сбросить
      </button>
    </div>
    <div class="game-wrapper__field">
      <div v-for="(row, y) in grid" :key="y" class="game-wrapper__row">
        <CellItem
          v-for="(cell, x) in row"
          :key="x"
          :item="cell"
          :x="x"
          :y="y"
          @drag-start="(pos) => onDragStart(pos)"
          @drop="(pos) => onDrop(pos)"
          @cell-click="(data) => onCellClick(data)"
          @cell-right-click="(pos) => onCellRightClick(pos)"
        />
      </div>
    </div>
    <div class="game-wrapper__legend">
      <span>Уровни: 1 → 2 → 3 → <b>4 (макс)</b></span>
      <span class="game-wrapper__legend-sep">|</span>
      <span>ПКМ (ур. 2+) — продать</span>
      <span class="game-wrapper__legend-sep">|</span>
      <span>Клик по <b>4</b> — призвать ветку (−5)</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import CellItem from '../ui/CellItem.vue'

const store = useStore()

const grid = computed(() => store.getters['game/getGrid'])
const score = computed(() => store.getters['game/getScore'])
const expandInfo = computed(() => store.getters['game/getExpandInfo'])

const dragged = ref(null)

onMounted(() => store.dispatch('game/initGame'))

const spawnItem = () => store.dispatch('game/spawn')
const expandField = () => store.dispatch('game/expandGrid')

const restartGame = () => {
  if (!confirm('Точно хочешь начать заново?')) return
  store.dispatch('game/restart')
}

const onDragStart = (pos) => { dragged.value = pos }

const onDrop = (positionTo) => {
  if (!dragged.value) return
  store.dispatch('game/handleDrop', { positionFrom: dragged.value, positionTo })
  dragged.value = null
}

const onCellClick = ({ item }) => {
  if (item && item.level === 4) store.dispatch('game/spawnFromMax', item.branch)
}

const onCellRightClick = (position) => {
  store.dispatch('game/sellItem', position)
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
    align-items: flex-start;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 5px;
    background: #0f3460;
    padding: 8px;
    border-radius: 12px;
    border: 1px solid #1a4a7a;
    width: fit-content;
    margin: 0 auto;
  }

  &__row {
    display: flex;
    gap: 5px;
    justify-content: center;
  }

  &__legend {
    margin-top: 10px;
    color: #8a9ab5;
    font-size: 13px;
    text-align: center;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 6px;

    b { color: #f7d354; }
  }

  &__legend-sep {
    color: #3a4a6a;
  }
}

.btn--blue {
  background: #1a6fbf;
  display: flex;
  flex-direction: column;
  align-items: center;

  &__hint {
    font-size: 11px;
    color: #cce0ff;
    margin-top: 3px;
  }
}
</style>
