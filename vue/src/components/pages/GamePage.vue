<template>
  <div class = "game">
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
        :figureRow = "figureRow"
        :figureCol = "figureCol"
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
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import GameField from './../ui/GameField.vue'
import ControlButtons from './../ui/ControlButtons.vue'
import SpeedButton from './../ui/SpeedButton.vue'

export default {
  name: 'GamePage',
  components: { 
    GameField, 
    ControlButtons,
    SpeedButton
  },
  computed: {
    ...mapGetters('game', [
      'gridSize',
      'islandCells',
      'baseRow',
      'baseCol',
      'figureRow',
      'figureCol',
      'score',
      'figureSpeed',
      'timeLeft'  
    ])
  },
  methods: {
    ...mapActions('game', [
      'moveIsland',
      'moveFigure',
      'rotateIsland',
      'updateTime'  
    ]),
    move(direction) {
      this.moveIsland(direction)
    },
    rotate(direction) {
      this.rotateIsland(direction)
    }
  },
  mounted() {
    this.intervalId = setInterval(() => this.moveFigure(), this.figureSpeed)
    this.timerInterval = setInterval(() => {
      this.updateTime()
    }, 1000)
  },
  beforeUnmount() {
    clearInterval(this.intervalId)
    clearInterval(this.timerInterval)  
  },
  watch: {
    figureSpeed(newSpeed) {
      clearInterval(this.intervalId)
      this.intervalId = setInterval(() => this.moveFigure(), newSpeed)
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
