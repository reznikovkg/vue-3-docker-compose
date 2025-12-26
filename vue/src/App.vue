<template>
  <RouterView />
  <div id="app">
    <div class="app__balance-indicator">
      Баланс парка: <strong>{{ parkBalance }} ₽</strong>
      | Уровень дорог: {{ roadLevel }}
      | Уровень карты: {{ mapLevel }}
      | Макс. посетителей: {{ maxVisitors }}
    </div>
    <div class="app__container">
      <div class="app__game-area">
        <GameBoard
          ref="gameBoard"
          @visitor-clicked="(id) => handleVisitorClick(id)"
        />
      </div>
      <div class="app__controls">
        <Toolbar @set-mode="(mode) => setGameModeHandler(mode)" :current-mode="gameMode" />
        <ObjectSelector @select-object="(object) => setSelectedObjectHandler(object)" />
        <UpgradesPanel />  
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import GameBoard from './components/GameBoard.vue';
import ObjectSelector from './components/ObjectSelector.vue';
import Toolbar from './components/Toolbar.vue';
import UpgradesPanel from './components/UpgradesPanel.vue';

const store = useStore();

const gameMode = computed(() => store.getters.getGameMode);
const parkBalance = computed(() => store.getters.getParkBalance);
const roadLevel = computed(() => store.getters.getRoadLevel);
const mapLevel = computed(() => store.getters.getMapLevel);
const maxVisitors = computed(() => store.getters.maxVisitors);

const setGameModeHandler = (mode) => {
  store.dispatch('setGameMode', mode);
};

const setSelectedObjectHandler = (object) => {
  store.dispatch('setSelectedObject', object);
};

const selectedVisitorId = ref(null);

const handleVisitorClick = (visitorId) => {
  selectedVisitorId.value = visitorId;
};
</script>

<style scoped lang="less">
.app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #000000;
  margin: 0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  box-sizing: border-box;
  background: #ffffff; 


  &__container {
    display: flex;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    gap: 30px;
    flex-wrap: wrap;
    align-items: flex-start;
  }

   &__game-area {
    flex: 3;
    min-width: 700px;
    background: #f8f8f8; 
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    min-height: 700px;
    border: 1px solid #ddd;
  }

  &__controls {
    flex: 1;
    min-width: 300px;
    background: #f8f8f8;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 20px;
    border: 1px solid #ddd;
  }
  &__balance-indicator {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  background: #f0f0f0;
  border-radius: 8px;
  padding: 15px 20px;
  margin-bottom: 20px;
  color: #333;
  font-size: 16px;
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
  width: 100%;
  max-width: 1400px;
  border: 1px solid #ddd;

  strong {
    color: #2e7d32; 
  }
}

}
</style>