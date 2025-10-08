<template>
  <div id="app">
    <div class="container"> 
      <div class="grid">
        <GameBoard
          :grid-width="gridWidth"
          :grid-height="gridHeight"
          :selected-object="selectedObject"
          :game-mode="gameMode"
          @update-grid="gameGrid = $event"
          ref="gameBoard"
        />
      </div>
      <div class="objects">
        <Toolbar @set-mode="setGameMode" :current-mode="gameMode" />
        <ObjectSelector @select-object="selectedObject = $event" />
      </div>
    </div>
  </div>
</template>

<script>
import GameBoard from './components/GameBoard.vue';
import ObjectSelector from './components/ObjectSelector.vue';
import Toolbar from './components/Toolbar.vue';

export default {
  name: 'App',
  components: {
    GameBoard,
    ObjectSelector,
    Toolbar,
  },
  data() {
    return {
      gridWidth: 10, 
      gridHeight: 10,
      selectedObject: null,
      gameMode: 'place',
      gameGrid: []
    };
  },
  methods: {
    setGameMode(mode) {
      this.gameMode = mode;
    }
  }
};
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

