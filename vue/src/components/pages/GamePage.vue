<template>
  <div class = "game">
    <ModeSelector 
      class = "game__mode-selector"
      :show = "showModeSelector" 
      @selectMode = "(mode) => startGame(mode)"
    />
    <template v-if = "!showModeSelector">
      <div class = "game__score">
        Очки: {{ score }}
      </div>
    
      <div class = "game__timer">
        ⏱️ {{ timeLeft }}с
      </div>
    
      <h1 class = "game__title">Островная игра</h1>
    
      <div class = "game__arena">
        <GameField 
          :gridSize = "gridSize"
          :islandCells = "islandCells"
          :baseRow = "baseRow"
          :baseCol = "baseCol"
          :currentFigure = "currentFigure"
          :bombs = "bombs"
        />
      
        <div class = "game__controls">
          <ControlButtons 
            @moveUp = "() => move('up')"
            @moveDown = "() => move('down')"
            @moveLeft = "() => move('left')"
            @moveRight = "() => move('right')"
            @rotateLeft = "() => rotate('counterclockwise')"
            @rotateRight = "() => rotate('clockwise')"
          />
          <SpeedButton />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import GameField from './../ui/GameField.vue'
import ControlButtons from './../ui/ControlButtons.vue'
import SpeedButton from './../ui/SpeedButton.vue'
import ModeSelector from './../ui/ModeSelector.vue'

export default {
  name: 'GamePage',
  components: { 
    GameField, 
    ControlButtons,
    SpeedButton,
    ModeSelector
  },
  data()
  {
    return {
      showModeSelector: true,
      figureInterval: null,   
      bombInterval: null,
      timerInterval: null
    }
  },
  computed: {
    ...mapGetters('game', [
      'gridSize',
      'islandCells',
      'baseRow',
      'baseCol',
      'score',
      'figureSpeed',
      'timeLeft',
      'currentFigure',
      'bombs'
    ])
  },
  methods: {
    ...mapActions('game', [
      'moveIsland',
      'moveFigure',
      'rotateIsland',
      'updateTime',
      'setGameMode',
      'moveBombs'
    ]),
    move(direction) {
      this.moveIsland(direction)
    },
    rotate(direction) {
      this.rotateIsland(direction)
    },
    startGame(mode) {
      this.setGameMode(mode)
      this.showModeSelector = false
      this.figureInterval = setInterval(() => this.moveFigure(), this.figureSpeed)
      this.bombInterval = setInterval(() => this.moveBombs(), 1000)
      this.timerInterval = setInterval(() => this.updateTime(), 1000)
    }
  },
  mounted() {
  },
  beforeUnmount() {
    clearInterval(this.figureInterval)
    clearInterval(this.bombInterval)
    clearInterval(this.timerInterval)  
  },
  watch: {
    figureSpeed: {
      handler(newSpeed,oldSpeed) {
        if (newSpeed === oldSpeed) return
        clearInterval(this.figureInterval)
        this.figureInterval = setInterval(() => this.moveFigure(), newSpeed)
      },
    }
  }
}
</script>

<style scoped lang = "scss">
.game {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  
  &__title {  
    margin-bottom: 10px;
    font-size: 30px;
    font-weight: 500;
  }
  &__score {
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 24px;
    font-weight: bold;
    color: #333;
    background: rgba(255, 255, 255, 0.8);
    padding: 10px 20px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 100;
  }
  &__timer {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 24px;
    font-weight: bold;
    color: #333;
    background: rgba(255, 255, 255, 0.8);
    padding: 10px 20px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 100;
  }
  &__arena {
    display: flex;
  }
  &__controls {
    display: flex;
    flex-direction: column;
  }
}
</style>
