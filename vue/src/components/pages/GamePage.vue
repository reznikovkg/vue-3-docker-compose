<template>
    <div class="game">
        <div class="game__score">
          Счёт {{ score.toFixed(1) }}
        </div>


        <div class="game__timer" :class="{warning: timeLeft <= 15}">
          {{ formattedTime }}
        </div>


        <div class="game__multiplier">
          {{ multiplier.toFixed(1) }}x
        </div>


        <div class="game__target">
          <div class="game__target__label">
              Цель:
          </div>

          <div class="game__target__bubble-wrapper">
            <img :src="getTargetColorImage" class="game__target__bubble" />
          </div>

          <div class="game__target__name">
              {{ getTargetColorName }}
          </div>
        </div>


        <div class="game__canvas">
          <div class="game__canvas__container">
            <Bubble v-for="bubble in bubbles" :key="bubble.id" :color="bubble.color" :initialX="bubble.initialX" :initialY="bubble.initialY" :isPaused="paused" @pop="(data) => pop(bubble.id, data)"/> 
          </div>
        </div>


        <div v-if="paused" class="game__pause">
          <div class="game__pause__content">
            <h2>Пауза</h2>


            <button @click="resumeGame" class="game__pause__button">
              Продолжить
            </button>


            <button @click="restartGame" class="game__pause__button">
                Перезапустить
            </button>


            <RouterLink :to="{ name: $routes.OPTION }" class="game__pause__button game__pause__button__link">
                Настройки
            </RouterLink>


            <RouterLink :to="{ name: $routes.MAINMENU }" class="game__pause__button game__pause__button__link">
                Меню
            </RouterLink>
          </div>
        </div>


        <div v-if="gameOver" class="game__overlay">
            <div class="game__overlay__content">
                <h2>Время вышло!</h2>


                <p>Ваш счёт: {{ score.toFixed(1) }}</p>


                <button @click="() => restartGame()" class="game__overlay__button">
                    Играть снова
                </button>


                <RouterLink :to="{ name: $routes.MAINMENU }" class="game__overlay__button game__overlay__button__menu">
                    В меню
                </RouterLink>
            </div>
        </div>
    </div>
</template>





<script lang="ts">
import Bubble from './../ui/Bubble.vue'
import { mapGetters } from 'vuex'
import blueBubble from './../../assets/bubbles/bubble_blue.png'
import greenBubble from './../../assets/bubbles/bubble_green.png'
import orangeBubble from './../../assets/bubbles/bubble_orange.png'
import pinkBubble from './../../assets/bubbles/bubble_pink.png'
import purpleBubble from './../../assets/bubbles/bubble_purple.png'
import redBubble from './../../assets/bubbles/bubble_red.png'
import whiteBubble from './../../assets/bubbles/bubble_white.png'
import yellowBubble from './../../assets/bubbles/bubble_yellow.png'


export default {
  name: 'GamePage',
  components: {
    Bubble
  },
  data() {
    return {
      score:  0,
      multiplier: 1,
      timeLeft: 60,
      gameOver: false,
      paused: false,
      timerInterval: null as number | null,
      spawnInterval: null as number | null,
      bubbles: [] as Array<{ id: number; color: string }>,
      colorImages: {
        blue: blueBubble,
        green: greenBubble,
        orange: orangeBubble,
        pink: pinkBubble,
        purple: purpleBubble,
        red: redBubble,
        white: whiteBubble,
        yellow: yellowBubble
      },
      colorNames: {
        blue: 'Синий',
        green: 'Зелёный',
        orange: 'Оранжевый',
        pink: 'Розовый',
        purple: 'Фиолетовый',
        red: 'Красный',
        white: 'Белый',
        yellow: 'Жёлтый'
      }
    }
  },
  computed: {
    ...mapGetters([
      'getTotalColors',
      'getTargetColor',
      'getSpawnRate',
      'getPointsForCorrect',
      'getPointsForWrong'
    ]),
    formattedTime(): string {
      const minutes = Math.floor(this.timeLeft / 60)
      const seconds = this.timeLeft % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    },
    availableColors(): string[] {
      const allColors = ['white', 'blue', 'red', 'green', 'yellow', 'purple', 'pink', 'orange']
      let colors = allColors.slice(0, this.getTotalColors)
      
      if (!colors.includes(this.getTargetColor)) {
        colors = colors.slice(0, -1)
        colors.push(this.getTargetColor)
      }
      
      return colors
    },
    getTargetColorImage(): string {
      return this.colorImages[this.getTargetColor as keyof typeof this.colorImages] || whiteBubble
    },
    getTargetColorName(): string {
      return this.colorNames[this.getTargetColor as keyof typeof this.colorNames] || this.getTargetColor
    }
  },
  methods: {
    spawnBubble() {
      if (this.gameOver || this.paused) 
        return

      const windowWidth = window.innerWidth
    
      const spawnAreaWidth = windowWidth * 0.6
      const spawnAreaStart = (windowWidth - spawnAreaWidth) / 2
      
      const randomX = spawnAreaStart + Math.random() * spawnAreaWidth

      const newBubble = {
        id: Date.now() + Math.random(),
        color: this.availableColors[Math.floor(Math.random() * this.availableColors.length)],
        initialX: randomX,
        initialY: -150
      }
      
      this.bubbles.push(newBubble)
    },
     startSpawning() {
      if (this.spawnInterval) {
        clearInterval(this.spawnInterval)
      }

      const intervalMs = 1000 / this.getSpawnRate
      
      this.spawnInterval = setInterval(() => { this.spawnBubble() }, intervalMs)
    },
    startTimer() {
      this.timerInterval = setInterval(() => {
        if (!this.paused && !this.gameOver) {
          if (this.timeLeft > 0) {
            this.timeLeft--
          } else {
            this.endGame()
          }
        }
      }, 1000)
    },
    endGame() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
      this.gameOver = true
      this.paused = false
      this.$emit('gameComplete', { score: this.score, timeElapsed: 60 })
    },
    restartGame() {
      this.score = 0
      this.multiplier = 1
      this.timeLeft = 60
      this.gameOver = false
      this.paused = false
      this.bubbles = []
      this.startSpawning()
      this.startTimer()
    },
    pop (bubbleId: number, bubbleData: { color: string, reason: string}) {
      if (this.gameOver || this.paused) 
        return

      const { color, reason } = bubbleData

      if (reason === 'out-of-bounds') {
        this.bubbles = this.bubbles.filter(b => b.id !== bubbleId)
        return
      }

      const isCorrect = color === this.getTargetColor
      const points = isCorrect ? this.getPointsForCorrect : this.getPointsForWrong

      if (isCorrect) {
        this.score += points * this.multiplier
        this.multiplier = Math.min(3, this.multiplier + 0.1)
      } else {
        this.score += points
        this.multiplier = 1
      }

      this.bubbles = this.bubbles.filter(b => b.id !== bubbleId)
    },
    updateMultiplier(value: number) {
      this.multiplier = Math.max(1, value)
    },
    togglePause() {
      if (this.gameOver) 
        return
      this.paused = !this.paused
    },
    pauseGame() {
      if (!this.gameOver) {
        this.paused = true
      }
    },
    resumeGame() {
      this.paused = false
    },
    handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        this.togglePause()
      }
    }
  },
  mounted() {
    this.startSpawning()
    this.startTimer()
    window.addEventListener('keydown', this.handleKeyDown)
  },
  beforeDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
    }
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval)
    }
    window.removeEventListener('keydown', this.handleKeyDown)
  }
}
</script>





<style scoped lang="scss">
.game {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(160deg, #5d4065 0%, #1b191d 100%);
  user-select: none;
  

  &__score {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    font-size: 3rem;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    z-index: 20;
    background: rgba(0, 0, 0, 0.4);
    padding: 15px 40px;
    border-radius: 60px;
    backdrop-filter: blur(5px);
    border: 2px solid rgba(255, 215, 0, 0.3);
    letter-spacing: 2px;
    cursor: default;
    pointer-events: none;
  }


  &__timer {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    font-size: 2rem;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    z-index: 30;
    background: rgba(0, 0, 0, 0.5);
    padding: 10px 30px;
    border-radius: 50px;
    backdrop-filter: blur(5px);
    border: 2px solid rgba(255, 255, 255, 0.2);
    cursor: default;
    pointer-events: none;


    &.warning {
      color: #ff6b6b;
      border-color: #ff6b6b;
      background: rgba(0, 0, 0, 0.6);
    }
  }

  
  &__multiplier {
    position: absolute;
    bottom: 30px;
    left: 30px;
    color: #00d389;
    font-size: 4rem;
    font-weight: bold;
    text-shadow: 0 0 20px rgba(0, 211, 137, 0.5);
    z-index: 10;
    background: rgba(0, 0, 0, 0.3);
    padding: 10px 30px;
    border-radius: 15px;
    backdrop-filter: blur(5px);
    animation: pulse 1.5s ease-in-out infinite;
    cursor: default;
    pointer-events: none;
  }
  

  &__target {
    position: absolute;
    bottom: 30px;
    right: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    z-index: 10;
    background: rgba(0, 0, 0, 0.3);
    padding: 15px 25px;
    border-radius: 20px;
    backdrop-filter: blur(5px);
    border: 2px solid rgba(255, 215, 0, 0.3);
    cursor: default;
    pointer-events: none;


    &__label {
      color: rgba(255, 255, 255, 0.8);
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 5px;
    }


    &__bubble-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 3px solid rgba(255, 215, 0, 0.5);
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
      margin: 0;
      padding: 0;
    }


    &__bubble {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      object-fit: cover;
      display: block;
    }


    &__name {
      color: white;
      font-size: 1.2rem;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 5px;
    }
  }


  &__canvas {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;


    &__container {
      width: 100%;
      height: 100%;
      position: relative;
          

      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;
      gap: 10px;
      padding: 80px 20px 100px 20px;
    }
  }


  &__pause {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
    backdrop-filter: blur(8px);


    &__content {
      background: #565b61;
      padding: 50px;
      border-radius: 30px;
      text-align: center;
      color: white;
      max-width: 450px;
      width: 90%;
      border: 2px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);


      h2 {
        font-size: 3rem;
        margin-bottom: 30px;
        color: #00d389;
        text-shadow: 0 0 20px rgba(0, 211, 137, 0.3);
        letter-spacing: 2px;
      }
    }


    &__button {
      display: block;
      width: 100%;
      padding: 15px 30px;
      margin: 15px 0;
      font-size: 1.3rem;
      font-weight: 600;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 1px;
      text-decoration: none;
      text-align: center;
      background: #3a3f44;
      color: white;


      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
        background: #4a4f54;
      }


      &:active {
        transform: translateY(0);
      }


      &__link {
        background: #3a3f44;
        color: white;
        text-decoration: none;
        display: block;


        &:hover {
          background: #4a4f54;
        }
      }
    }
  }


  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    backdrop-filter: blur(5px);
    user-select: none;


    &__content {
      background: #565b61;
      padding: 40px;
      border-radius: 20px;
      text-align: center;
      color: white;
      max-width: 400px;
      width: 90%;


      h2 {
        font-size: 2.5rem;
        margin-bottom: 20px;
        color: #ff6b6b;
      }


      p {
        font-size: 1.5rem;
        margin-bottom: 30px;
      }
    }


    &__button {
      display: block;
      width: 100%;
      padding: 15px 30px;
      margin: 10px 0;
      font-size: 1.2rem;
      font-weight: 600;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-decoration: none;
      text-align: center;


      &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }


      &__menu {
        background: #3a3f44;
        color: white;


        &:hover {
          background: #4a4f54;
        }
      }
    }
  }
}


@keyframes pulse {
  0% { 
    transform: scale(1); 
  }
  50% { 
    transform: scale(1.1); 
    text-shadow: 0 0 30px rgba(0, 211, 137, 0.8);
    box-shadow: 0 0 20px rgba(0, 211, 137, 0.3);
  }
  100% { 
    transform: scale(1); 
  }
}

</style>
