<template>
  <div id="app">
    <div class="container">
      <div class="grid">
        <GameBoard
          :grid-width="gridWidth"
          :grid-height="gridHeight"
          :selected-object="selectedObject"
          :game-mode="gameMode"
          ref="gameBoard"
        />
      </div>
      <div class="objects">
        <Toolbar @set-mode="mode => store.dispatch('setGameMode', mode)" :current-mode="gameMode" />
        <ObjectSelector @select-object="object => store.dispatch('setSelectedObject', object)" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import GameBoard from './components/GameBoard.vue';
import ObjectSelector from './components/ObjectSelector.vue';
import Toolbar from './components/Toolbar.vue';

const store = useStore();

const gridWidth = computed(() => store.getters.getGridWidth);
const gridHeight = computed(() => store.getters.getGridHeight);
const selectedObject = computed(() => store.getters.getSelectedObject);
const gameMode = computed(() => store.getters.getGameMode);

</script>

<style leng="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #000000;
  margin-top: 60px;
  align-items: center;
  display: flex;           
  flex-direction: column;
}

.container { 
  display: flex;
  width: 80%; 
  margin: 0 auto; 
}

.objects {
  margin-top: 100px;
  margin-right: 100px;
  margin-left: 200px;
  display: flex;
  flex-direction: column; 
  align-items: center; 
}

.grid {
  margin-top: 100px;
  margin-right: 100px;
  margin-left: 100px;
}
</style>