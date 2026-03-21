<template>
  <div class="controls">
    <h1>Настройки</h1>
    <div class="control-row">
      Количество колб
      <button @click="delFlask" class="setting-btn">-</button>
      {{ FLASK_COUNT }}
      <button @click="addFlask" class="setting-btn">+</button>
    </div>
    <div class="control-row">
      Количество слоев
      <button @click="delLayer" class="setting-btn">-</button>
      {{ LAYERS_PER_FLASK }}
      <button @click="addLayer" class="setting-btn">+</button>
    </div>
    <div class="control-row">
      Сложный режим
      <button
        @click="changeHardMode"
        :class="['setting-btn', 'hard-mode-btn', { active: isHardMode }]"
      >
        {{ isHardMode ? 'Включен' : 'Выключен' }}
      </button>
    </div>
  </div>
  <RouterLink :to="{ name: $routes.INDEX }">Сохранить</RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const FLASK_COUNT = computed(() => store.getters.getFlaskCount)
const LAYERS_PER_FLASK = computed(() => store.getters.getLayersPerFlask)
const isHardMode = computed(() => store.getters.getHardMode)

const addFlask = () => {
  if (FLASK_COUNT.value < 16) {
    store.commit('INC_FLASK_COUNT')
  }
}

const delFlask = () => {
  if (FLASK_COUNT.value > 3) {
    store.commit('DEC_FLASK_COUNT')
  }
}

const addLayer = () => {
  if (LAYERS_PER_FLASK.value < 10) {
    store.commit('INC_LAYERS_PER_FLASK')
  }
}

const delLayer = () => {
  if (LAYERS_PER_FLASK.value > 3) {
    store.commit('DEC_LAYERS_PER_FLASK')
  }
}

const changeHardMode = () => {
  store.commit('CHANGE_MODE')
}
</script>

<style lang="scss" scoped>
$btn-color: #36c9ff;
$btn-color-disactive: #1c7190;
$btn-color-active: #36ff62;
$text-btn-color: #333;

.controls {
  text-align: center;
  padding: 20px;
  gap: 15px;
  display: flex;
  flex-direction: column;
  font-size: 16px;
}
.control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.setting-btn {
  padding: 10px 20px;
  font-size: 20px;
  background: $btn-color;
  color: $text-btn-color;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.hard-mode-btn {
  background: $btn-color-disactive;
}
.hard-mode-btn.active {
  background: $btn-color-active;
}
</style>
