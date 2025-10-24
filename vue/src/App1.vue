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
        <Toolbar @set-mode="(mode) => setGameModeHandler(mode)" :current-mode="gameMode" />
        <ObjectSelector @select-object="(object) => setSelectedObjectHandler(object)" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'; 
import GameBoard from './components/GameBoard1.vue';
import ObjectSelector from './components/ObjectSelector1.vue';
import Toolbar from './components/Toolbar1.vue';

export default {
  name: 'App',
  components: {
    GameBoard,
    ObjectSelector,
    Toolbar,
  },
  computed: {
    ...mapGetters([
      'getGridWidth',
      'getGridHeight',
      'getSelectedObject',
      'getGameMode'
    ]),
    gridWidth() { return this.getGridWidth; },
    gridHeight() { return this.getGridHeight; },
    selectedObject() { return this.getSelectedObject; },
    gameMode() { return this.getGameMode; }
  },
  methods: {
    ...mapActions([
      'setGameMode',
      'setSelectedObject'
    ]),
    setGameModeHandler(mode) {
      this.setGameMode(mode);
    },
    setSelectedObjectHandler(object) {
      this.setSelectedObject(object);
    }
  }
};
</script>

<style scoped lang="less"> 
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