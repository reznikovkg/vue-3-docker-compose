<template>
  <div class="game">
    <div class="game__header">
      <h1 class="game__title">Переливатор</h1>
      <div class="game__controls">
        <button class="game__btn" @click="onNewGame">Новая игра</button>
        <span class="game__timer">{{ timerDisplay }}</span>
        <span class="game__status">{{ statusText }}</span>
      </div>
      <div class="game__difficulty">
        <label v-for="mode in modes" :key="mode.key" class="game__difficulty-label">
          <input
            class="game__difficulty-radio"
            type="radio"
            :value="mode.key"
            v-model="selectedDifficulty"
            @change="setDifficulty"
          />
          {{ mode.label }}
        </label>
      </div>
    </div>

    <div v-if="blockedIdx !== null" class="game__blocked-hint">
      Заблокирована колба #{{ blockedIdx + 1 }}
    </div>

    <div class="game__flasks">
      <div
        v-for="(flask, fIdx) in flasks"
        :key="fIdx"
        class="flask"
        :class="{
          'flask--empty': flask.length === 0,
          'flask--blocked': blockedIdx === fIdx
        }"
        @click="handleFlaskClick"
        :data-flask-idx="fIdx"
      >
        <div class="flask__tube" :class="{ 'flask__tube--selected': selectedFlaskIdx === fIdx }">
          <div
            v-for="(layer, lIdx) in flask"
            :key="lIdx"
            class="flask__layer"
            :style="{ backgroundColor: layer, height: layerHeight + '%' }"
          ></div>
        </div>
        <div class="flask__percent">{{ fillPercent(flask) }}%</div>
      </div>
    </div>

    <div v-if="isWin" class="game__win">
      <span class="game__win-text">Победа! Все цвета разделены за {{ timerDisplay }}</span>
      <button class="game__btn" @click="onNewGame">Играть снова</button>
    </div>

    <div v-else-if="!hasValidMoves" class="game__over">
      <span class="game__over-text">Игра окончена. Ходов больше нет.</span>
      <button class="game__btn" @click="onNewGame">Начать заново</button>
    </div>

    <div class="game__records">
      <div v-for="mode in modes" :key="mode.key" class="game__records-block">
        <span class="game__records-title">Рекорды — {{ mode.label }}</span>
        <ol
          v-if="allRecords[mode.key] && allRecords[mode.key].length > 0"
          class="game__records-list"
        >
          <li v-for="(rec, idx) in allRecords[mode.key]" :key="idx" class="game__records-item">
            {{ formatTime(rec) }}
          </li>
        </ol>
        <p v-else class="game__records-empty">Нет рекордов</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { MODES, MAX_LAYERS } from '../../store/pourGameConfig'

const store = useStore()

const modes = Object.values(MODES)

const flasks = computed(() => store.getters['pourGame/flasks'])
const selectedFlaskIdx = computed(() => store.getters['pourGame/selectedFlaskIdx'])
const difficulty = computed(() => store.getters['pourGame/difficulty'])
const blockedIdx = computed(() => store.getters['pourGame/blockedIdx'])
const isWin = computed(() => store.getters['pourGame/isWin'])
const hasValidMoves = computed(() => store.getters['pourGame/hasValidMoves'])
const timerDisplay = computed(() => store.getters['pourGame/timerDisplay'])
const allRecords = computed(() => store.getters['pourGame/allRecords'])

const selectedDifficulty = ref(difficulty.value)

const layerHeight = computed(() => 100 / MAX_LAYERS)

const fillPercent = (flask) => Math.round((flask.length / MAX_LAYERS) * 100)

const statusText = computed(() => {
  if (selectedFlaskIdx.value !== null) return 'Выберите целевую колбу'
  return 'Выберите колбу для переливания'
})

const onNewGame = () => {
  store.dispatch('pourGame/initGame')
}

const setDifficulty = () => {
  store.commit('pourGame/SET_DIFFICULTY', selectedDifficulty.value)
  store.dispatch('pourGame/initGame')
}

const handleFlaskClick = (event) => {
  const idx = Number(event.currentTarget.dataset.flaskIdx)
  if (selectedFlaskIdx.value === null) {
    if (flasks.value[idx].length === 0) return
    store.commit('pourGame/SET_SELECTED', idx)
  } else if (selectedFlaskIdx.value === idx) {
    store.commit('pourGame/SET_SELECTED', null)
  } else {
    store.dispatch('pourGame/pour', { fromIdx: selectedFlaskIdx.value, toIdx: idx })
    store.commit('pourGame/SET_SELECTED', null)
  }
}

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

onMounted(() => {
  store.dispatch('pourGame/initGame')
  store.dispatch('pourGame/loadRecords')
})
</script>

<style scoped lang="scss">
.game {
  padding: 24px;
  font-family: sans-serif;
  max-width: 900px;
  margin: 0 auto;

  &__title {
    margin: 0;
    font-size: 24px;
  }

  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__btn {
    padding: 8px 16px;
    cursor: pointer;
  }

  &__timer {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    min-width: 50px;
    text-align: center;
  }

  &__status {
    color: #666;
    font-size: 14px;
  }

  &__difficulty {
    display: flex;
    gap: 16px;

    &-label {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      font-size: 14px;
    }

    &-radio {
      cursor: pointer;
    }
  }

  &__blocked-hint {
    text-align: center;
    font-size: 14px;
    color: #e67e22;
    margin-bottom: 16px;
  }

  &__flasks {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    justify-content: center;
  }

  &__win {
    margin-top: 32px;
    text-align: center;
    font-size: 20px;
    color: #2ecc71;

    &-text {
      display: block;
      margin-bottom: 12px;
    }
  }

  &__over {
    margin-top: 32px;
    text-align: center;
    font-size: 20px;
    color: #e74c3c;

    &-text {
      display: block;
      margin-bottom: 12px;
    }
  }

  &__records {
    margin-top: 32px;
    display: flex;
    gap: 40px;
    justify-content: center;

    &-block {
      min-width: 120px;
    }

    &-title {
      display: block;
      margin: 0 0 12px;
      font-size: 16px;
      font-weight: bold;
    }

    &-empty {
      font-size: 13px;
      color: #aaa;
      margin: 0;
    }

    &-list {
      margin: 0;
      padding-left: 20px;
    }

    &-item {
      font-size: 13px;
      color: #555;
    }
  }
}

.flask {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  width: 56px;

  > * + * {
    margin-top: 6px;
  }

  &--empty {
    cursor: default;
  }

  &--blocked {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &__tube {
    position: relative;
    width: 50px;
    height: 160px;
    border: 3px solid #555;
    border-top: none;
    border-radius: 0 0 12px 12px;
    display: flex;
    flex-direction: column-reverse;
    overflow: hidden;
    background: #fafafa;
    transition: border-color 0.1s;

    &--selected {
      border-color: #e74c3c;
      background-color: #fff0f0;
    }
  }

  &__layer {
    width: 100%;
    flex-shrink: 0;
  }

  &__percent {
    font-size: 13px;
    color: #666;
    height: 16px;
    width: 40px;
    text-align: center;
  }
}
</style>
