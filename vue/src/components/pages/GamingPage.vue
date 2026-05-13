<template>
  <div v-if="gameOver" class="gameOver">
    <h2>{{ gameOverMessage }}</h2>
    <button class="gameOver__restart" @click="() => restartGame()" >Играть заново</button>
  </div>

  <div class="game">

    <PlayingField 
    :fieldSize="fieldSize" 
    :islandPosition="islandPosition"
    :corePosition="corePosition"
    :figures="getFigures"
    :bombs="getBombs"
    />

    <div class="game__controls">
      <div>
        <label>Field Size (нечетное число):</label>

        <div class="game__fieldSize">
        <input v-model="value" type="number" step="2" min="1" class="game__fieldSize--input">
        <button class="game__fieldSize--btn" @click="() => incFieldSize()" >Применить</button>
        </div>
      </div>

      <div class="game__stats">
        <div class="game__stats--score">
          Очки: <strong>{{ getScore }}</strong>
        </div>

        <div class="game__stats--highscore">
          Рекорд: <strong>{{ highScore }}</strong>
        </div>

        <div class="game__stats--timer">
          Время: <strong>{{ timeLeft }}</strong> сек
        </div>

        <div class="game__stats--besttime">
          Лучшее время: <strong>{{ bestTime }}</strong> сек
        </div>
      </div>

      <div class="game__movement">

        <div class="game__arrow">
          <button class="game__arrow--btn" @click="() => moveIsland('up')">
            <img :src="upArrow" class="game__arrow--icon">
          </button>

          <div class="game__arrow--row">
            <button class="game__arrow--btn" @click="() => moveIsland('left')">
              <img :src="leftArrow" class="game__arrow--icon">
            </button>

            <button class="game__arrow--btn" @click="() => moveIsland('right')" >
              <img :src="rightArrow" class="game__arrow--icon">
            </button>  
          </div>

          <button class="game__arrow--btn" @click="() => moveIsland('down')" >
            <img :src="downArrow" class="game__arrow--icon">
          </button>
        </div>

        <div class="game__rotateArrow">
          <button class="game__rotateArrow--btn" @click="() => rotateIsland('counterclockwise')">
            <img :src="clockwiseArrow" class="game__rotateArrow--icon">
          </button>

          <button class="game__rotateArrow--btn" @click="() => rotateIsland('clockwise')" >
            <img :src="counterwiseArrow" class="game__rotateArrow--icon">
          </button>
        </div>

        <div class="game__sideButtons">

          <div class="game__speedArrow">
            <button class="game__speedArrow--btn" :class="{'accelerated': isAccelerated}" @click="() => accelerateFigures()" >
              {{ isAccelerated ? 'Турбо ВКЛ': 'Ускорить фигуры' }}
              <img :src="speedArrow" class="game__speedArrow--icon">
            </button>
          </div>

          <div class="game__speedArrow">
            <button class="game__speedArrow--btn" :class="{'accelerated': isSpeedModeActive}" @click="() => toggleSpeedMode()">
              {{ isSpeedModeActive ? 'Разгон ВКЛ' : 'Режим разгона' }}
              <img :src="speedArrow" class="game__speedArrow--icon">
            </button>
          </div>

          <div class="game__bomb">
            <button class="game__bomb--btn" :class="{'accelerated': isBombModeActive}" @click="() => toggleBombMode()">
              {{ isBombModeActive ? 'Бомбы ВКЛ' : 'Режим бомб' }}
              <img :src="blackBomb" class="game__bomb--icon">
            </button>
          </div>

        </div>


      </div>
    </div>

  </div>
</template>

<script lang="ts">

import { mapGetters, mapActions } from 'vuex'
import PlayingField from '../ui/PlayingField.vue'

import upArrow from '@/components/icons/icons8-up-arrow-80.png'
import downArrow from '@/components/icons/icons8-down-arrow-80.png'
import leftArrow from '@/components/icons/icons8-left-arrow-80.png'
import rightArrow from '@/components/icons/icons8-right-arrow-80.png'
import clockwiseArrow from '@/components/icons/icons8-curved-arrow-down-80.png'
import counterwiseArrow from'@/components/icons/icons8-curved-arrow-downward-80.png'
import speedArrow from '@/components/icons/icons8-speed-80.png'
import redBomb from '@/components/icons/icons8-bomb-80.png'
import blackBomb from '@/components/icons/icons8-bomb-80(1).png'
import greenBomb from '@/components/icons/icons8-bomb-80(2).png'

export default{
  name: 'GamingPage',
  components:{
    PlayingField
  },
  data(){
    const initialFieldSize = 11
    return{
      value: 11,
      timeout: 0,
      fieldSize: initialFieldSize,
      islandPosition: [{
        row: Math.floor(initialFieldSize / 2),
        col: Math.floor(initialFieldSize / 2)
      }],
      corePosition: {row: 0, col: 0},
      upArrow,
      downArrow,
      leftArrow,
      rightArrow,
      clockwiseArrow,
      counterwiseArrow,
      speedArrow,
      moveInterval: null as ReturnType<typeof setInterval> | null,
      spawnInterval: null as ReturnType<typeof setInterval> | null,
      gameOver: false,
      gameOverMessage: '',
      timeLeft: 60,
      timerInterval: null as ReturnType<typeof setInterval> | null,
      isAccelerated: false,
      highScore: 0,
      bestTime: 0,
      speedInterval: null as ReturnType<typeof setInterval> | null,
      isSpeedModeActive: false,
      isBombModeActive: false,
      bombSpawnInterval: null as ReturnType<typeof setInterval> | null,
      blackBomb,
      greenBomb,
      redBomb
    }
  },
  computed:{
    ...mapGetters('figure',[ 
      'getFigures',
      'getScore',
      'getSpawnInterval',
      'getFiguresCount',
      'getFigureSpeed',
      'highScore',
      'bestTime',
      'getBombs',
      'getBombsCount',
    ]),
    ...mapGetters({
      count: 'getCount',
      list: 'list/getList'
    })
  },
  mounted(){
    console.log('GamingPage MOUNTED')
    window.addEventListener('keydown', this.handleKeyDown);

    this.highScore = parseInt(localStorage.getItem('islandHighScore')??'0', 10) || 0;
    this.bestTime = parseInt(localStorage.getItem('islandBestTime')??'0', 10) || 0;
    this.startGame();
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
    this.stopGame();
  },
  methods:{
    ...mapActions('figure', [
      'spawnFigure',
      'moveFigures',
      'checkCollisions',
      'startSpawning',
      'stopSpawning',
      'checkGameOver',
      'checkLayers',
      'setSpeed',
      'setHighScore',
      'setBestTime',
      'setSpeedBoostNext',
      'setGameActive',
      'resetGame',
      'subtractScore',
      'spawnBomb',
      'moveBombs',
      'checkBombCollisions',
    ]),
    ...mapActions([
      'runIncrement',
      'setCount'
    ]),
    startGame(){
      this.stopGame()
      console.log('=== START GAME ===')
      console.log('fieldSize:', this.fieldSize)

      const center = Math.floor(this.fieldSize / 2)
      this.islandPosition = [{row: center, col: center}]
      this.corePosition = {row: center, col: center}
      console.log('islandPosition:', this.islandPosition)
      this.gameOver = false
      this.gameOverMessage = ''
      this.timeLeft = 60
      this.setGameActive(true)
      this.startTimer()

      const vm = this
      this.spawnInterval = setInterval(() => {
        console.log('SPAWN TICK')
        vm.spawnFigure({fieldSize: vm.fieldSize})
      }, 2000)
      this.moveInterval = setInterval( () => {
        this.gameTick()
      }, 500)
    },
    startTimer(){
      this.timeLeft = 60
      if (this.timerInterval) clearInterval(this.timerInterval)
      this.timerInterval = setInterval(() =>{
      this.timeLeft--
      if(this.timeLeft <= 0 ){
        this.gameOverByTime()
      }
      }, 1000)
    },
    saveRecords(){
      this.setHighScore(this.getScore);
      this.setBestTime(this.timeLeft);
    },
    gameOverByTime(){
      this.stopGame()
      if (this.timerInterval){
      clearInterval(this.timerInterval)
      this.timerInterval = null
      }
      this.saveRecords()
      this.gameOver = true
      this.gameOverMessage = 'Время вышло! Игра окончена!'
    },
    gameTick() {
      console.log('--- GAME TICK --- figures:', this.getFiguresCount)
      this.checkCollisions({ islandPosition: this.islandPosition })
        .then(added1 => {
          return this.moveFigures({ fieldSize: this.fieldSize })
          .then(() => this.moveBombs({fieldSize: this.fieldSize}))
          .then(() => added1)
        })
        .then(added1 => {
          return this.checkCollisions({ islandPosition: this.islandPosition })
          .then(added2 => [...added1, ...added2])
        })
        .then(allNewCells => {
          if (allNewCells && allNewCells.length > 0) {
            this.islandPosition = [...this.islandPosition, ...allNewCells]
            console.log(` ISLAND GREW! Added ${allNewCells.length} cells => Total: ${this.islandPosition.length}`)
          }
          return this.checkBombCollisions({islandPosition: this.islandPosition})
        })
        .then(bombResult => {
          if (bombResult.hit){
            this.islandPosition = bombResult.newIsland
            if (bombResult.timePenalty && bombResult.timePenalty > 0){
              this.timeLeft = Math.max(0, this.timeLeft - bombResult.timePenalty)
              console.log(`Красная бомба! -${bombResult.timePenalty} сек. Осталось: ${this.timeLeft}`)
            } else if (bombResult.timeBonus && bombResult.timeBonus > 0){  
              this.timeLeft += bombResult.timeBonus
              console.log(`Зелёный бонус! +${bombResult.timeBonus} сек. Осталось: ${this.timeLeft}`)
            } else {
              console.log(`Чёрная бомба взорвала остров! Осталось только ядро.`)
            }
          }
          return this.checkGameOver({
            islandPosition: this.islandPosition,
            fieldSize: this.fieldSize
          })
        })
        .then(isGameOver => {
          if (isGameOver){
            this.gameOver = true
            this.gameOverMessage = 'Игра окончена! Остров коснулся стены.'
            this.saveRecords()
            this.stopGame()
            alert('Игра окончена! Остров коснулся стены.')
          }
          return this.checkLayers({
            islandPosition: this.islandPosition,
            fieldSize: this.fieldSize
          })
        })
        .then(result => {
          if (result && result.newIsland){
            this.islandPosition = result.newIsland;
            if (result.cleared > 0 && result.newIsland.length === 1){
              this.corePosition = {...result.newIsland[0]}
            }
            if (result.cleared > 0){
              console.log(`Слой очищен! Остров сброшен до ядра. +${result.cleared * 5 + result.fallen * 1} очков`)
              if (result.timeBonus && result.timeBonus > 0){
                this.timeLeft += result.timeBonus;
                console.log(`+${result.timeBonus} секунд к таймеру! Новое время: ${this.timeLeft}`);
              }
            }
          }
        })
        .catch(err => console.error('Game tick error:', err))
    },
    stopGame(){
      this.stopSpawning()
      if (this.spawnInterval) {
        clearInterval(this.spawnInterval)
        this.spawnInterval = null
      }
      if (this.moveInterval){ 
        clearInterval(this.moveInterval)
        this.moveInterval = null
      }
      if (this.timerInterval){
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
      if (this.speedInterval) {
        clearInterval(this.speedInterval)
        this.speedInterval = null
      }
      if (this.bombSpawnInterval) {
        clearInterval(this.bombSpawnInterval)
        this.bombSpawnInterval = null
      }
      this.isBombModeActive = false
      this.isSpeedModeActive = false
      this.setGameActive(false)
      this.resetGame()
    },
    restartGame(){
      this.stopGame()
      const center = Math.floor(this.fieldSize / 2)
      this.islandPosition = [{row: center, col: center}]
      this.gameOver = false
      this.gameOverMessage = ''
      this.timeLeft = 60
      this.resetGame()
      this.startGame()
    },
    inc(){
      this.runIncrement(this.value)
    },
    setValue(){
      this.setCount({
        value: this.value,
        timeout: this.value
      })
    },
    incFieldSize() {
      this.fieldSize = this.value
      const center = Math.floor(this.fieldSize / 2)
      this.islandPosition = [{
        row: center,
        col: center
      }]
    },
    rotateIsland(direction: string){
      if (this.gameOver || this.islandPosition.length <= 1) return
      const centerRow = this.corePosition.row;
      const centerCol = this.corePosition.col;

      const newPositions = this.islandPosition.map(cell =>{
      const relRow = cell.row - centerRow;
      const relCol = cell.col - centerCol;

      let newRelRow, newRelCol;
      if (direction === 'clockwise'){
        newRelRow = relCol;
        newRelCol = -relRow;
      }
      else{
        newRelRow = -relCol;
        newRelCol = relRow;
      }
      const newRow = newRelRow + centerRow;
      const newCol = newRelCol + centerCol;

      return{
        row: Math.max(0, Math.min(this.fieldSize - 1, newRow)),
        col: Math.max(0, Math.min(this.fieldSize - 1, newCol))
      }
      })
      this.islandPosition = newPositions;
      console.log(`Остров повернут ${direction === 'clockwise' ? 'по часовой':'против часовой'}`)
    },
    handleKeyDown(e: KeyboardEvent){
      if (this.gameOver) return

      const preventKeys = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ']
      if (preventKeys.includes(e.key)) e.preventDefault()

      switch (e.key){
        case 'ArrowUp':
          this.moveIsland('up'); break;
        case 'ArrowDown':
          this.moveIsland('down'); break;
        case 'ArrowLeft':
          this.moveIsland('left'); break;
        case 'ArrowRight':
          this.moveIsland('right'); break;
        case 'q':
        case 'Q':
          this.rotateIsland('counterclockwise'); break;
        case 'e':
        case 'E':
          this.rotateIsland('clockwise'); break;
        case ' ':
          this.accelerateFigures(); break;
        case 'b':
        case 'B':
          this.toggleBombMode(); break;
        case 's':
        case 'S':
          this.toggleSpeedMode(); break;
      }
    },
    moveIsland (direction: 'up'|'down'|'left'|'right') {
      const delta={
        up: {row: -1, col: 0},
        down: {row: 1, col: 0},
        left: {row: 0, col: -1},
        right: {row: 0, col: 1}
      }[direction]
      if (!delta) return;
      const newCells = this.islandPosition.map(cell => ({
        row: Math.min(this.fieldSize - 1, Math.max(0, cell.row + delta.row)),
        col: Math.min(this.fieldSize - 1, Math.max(0, cell.col + delta.col)),
      }))
      this.corePosition = {
        row: Math.min(this.fieldSize - 1, Math.max(0, this.corePosition.row + delta.row)),
        col: Math.min(this.fieldSize - 1, Math.max(0, this.corePosition.col + delta.col)),
      }
      this.islandPosition = newCells
    },
    accelerateFigures(){
      this.setSpeedBoostNext(true);
      console.log(`Кнопка нажата - следующая фигура будет ускорена (speed = 2)`)
      this.isAccelerated = true;
      setTimeout(() => {
        this.isAccelerated = false;
      }, 800);
    },
    toggleSpeedMode(){
      this.isSpeedModeActive = !this.isSpeedModeActive
      if (this.isSpeedModeActive){
       this.speedInterval = setInterval(() => {
          const newSpeed = (this.getFigureSpeed ?? 1) + 1
          this.setSpeed(newSpeed)
          console.log(`Режим разгона: скорость увеличена до ${newSpeed}`)
        }, 15000)
        console.log('Режим постепенного разгона ВКЛЮЧЁН')
      } else {
        if (this.speedInterval){
          clearInterval(this.speedInterval)
          this.speedInterval = null
        }
        this.setSpeed(1)
        console.log('Режим постепенного разгона ВЫКЛЮЧЕН')
      }
    },

    toggleBombMode(){
      this.isBombModeActive = !this.isBombModeActive
      if (this.isBombModeActive){
        this.bombSpawnInterval = setInterval(() => {
          this.spawnBomb({fieldSize: this.fieldSize})
          console.log('Бомба spawned, всего на поле:', this.getBombsCount)
        }, 5000)
        console.log('Режим бомб ВКЛЮЧЁН')
      } else {
        if (this.bombSpawnInterval){
          clearInterval(this.bombSpawnInterval)
          this.bombSpawnInterval = null
        }
        console.log('Режим бомб ВЫКЛЮЧЕН')
      }
    },


  }
}
</script>

<style scoped lang="scss">
.gameOver{
  position: absolute;
  top: 50%;
  left: 50%;
  color: white;
  background: rgba(0, 0, 0, 0.85);
  transform: translate(-50%, -50%);
  padding: 40px 60px;
  border-radius: 15px;
  text-align: center;
  z-index: 100;

  &__restart{
    padding: 12px 30px;
    font-size: 18px;
    background: limegreen;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 20px;

    &:hover{
      background: #32cd32;
      transform: scale(1.05);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1)
    }
  }
}
.game{
  display: flex;
  gap: 40px;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 20px;
  background: white;
  min-height: 100vh;

  &__controls{
    border-radius: 16px;
    padding: 35px 28px;
    width: 320px;
    display: flex;
    flex-direction: column;
    gap: 30px;
  }
  &__fieldSize{
    display: flex;
    gap: 12px;

    &--input{
      flex: 1;
      padding: 12px 14px;
      font-size: 17px;
      border: 2px solid #ddd;
      border-radius: 8px;
      text-align: center;
    }

    &--btn{
      width: 100px;
      height: 50px;
      border: 1px solid #ccc;
      border-radius: 5px;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 5px;
      transition: background-color 0.3s ease;

      &:hover{
        background: #f0f0f0;
        transform: scale(1.05);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1)
      }
      &:active{
        transform: scale(0.95);
      }
    }
  }
  &__stats{
    display: flex;
    flex-direction: row;
    gap: 80px;
    padding: 20px;
    border-radius: 12px;

    &--timer, &--score, &--highscore, &--besttime{
      font-size: 26px;
      font-weight: bold;
      text-align: center;
      margin: 10px 0 0 0;
      color: #222;
    }
  }
  &__movement{
    display: flex;
    align-items: flex-start;
    gap: 100px;
  }
  &__sideButtons{
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;

    &__speedArrow, &__blackBomb {
      margin: 0;

      &--btn {
        width: 120px;
        height: 55px;
        font-size: 11px;
        padding: 6px 10px;
        text-align: center;
        line-height: 1.3;
      }
    }
  }
  &__rotateArrow, &__speedArrow, &__bomb{
    display: flex;
    gap: 5px;
    flex-direction: row;
    align-items: center;
    margin-top: 5px 0;

    &--icon{
      width: 30px;
      height: 30px;
    }

    &--btn{
      width: 90px;
      height: 90px;
      border: none;
      border-radius: 5px;
      background: #d1e2f0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 24px;
      color: white;
      transition: background-color 0.3s ease;

      &:hover{
        background: #f0f0f0;
        transform: scale(1.05);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }
      &:active{
        transform: scale(0.95);
      }
    }
  }
  &__arrow{
    display: flex;
    gap: 15px;
    flex-direction: column;
    align-items: center;
    margin: 20px 0;
    color: #e70d0d;
    background-color: white;

    &--row{
      display: flex;
      gap: 40px;
      flex-direction: row;
    }

    &--icon{
      width: 30px;
      height: 30px;
    }

    &--btn{
      width: 90px;
      height: 90px;
      border: none;
      border-radius: 5px;
      background: #d1e2f0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 24px;
      color: white;
      transition: background-color 0.3s ease;

      &:hover{
        background: #f0f0f0;
        transform: scale(1.05);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }
      &:active{
        transform: scale(0.95);
      }
    }
  }
}
</style>