<template>
  <div class="game">
    <div class="game__header">
      Счёт: {{ Math.floor(score) }} м. Осталось жизней: {{ player.lives }}.
    </div>
    <div v-if="isOver" class="game__finished">
      <div>Игра окончена! Итоговый счёт: {{ Math.floor(score) }} м</div>
      <button class="game__restart" @click="restart">Начать заново</button>
    </div>
    <div class="game__world">
      <div class="game__road">
        <svg width="100%" height="100%">
          <line v-for="line in 3" :key="line" class="game__line" :style="roadLineStyle" stroke-dasharray="50,40" :x1="line * 25 + '%'" y1="0" :x2="line * 25 + '%'" y2="100%" stroke="#f2f2f2" stroke-width="2" />
        </svg>
        <Car :color="player.color" :x="player.x" :y="playerY" />
        <Car v-for="obstacle in obstacles" :key="obstacle.id" :color="obstacle.color" :x="obstacle.x" :y="obstacle.y" :hit="obstacle.hit" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Car from '../ui/Car.vue';

interface Obstacle {
  id: number
  color: string
  x: number
  y: number
  hit: boolean
  changeTimer: number
}

const X_MIN = 7.5
const X_MAX = 52.5
const X_STEP = 6
const X_CENTERS = [7.5, 22.5, 37.5, 52.5]

export default {
  name: 'IndexPage',
  components: {
    Car
  },
  data () {
    return {
      score: 0,
      speed: 1,
      carId: 0,
      playerY: 65,
      player: {
        color: '#d64545',
        x: 30,
        lives: 3,
      },
      obstacles: [] as Obstacle[],
      isMoving: false,
      isOver: false,
      invulnerable: 0,
      spawnProgress: 0,
      spawnGap: 45,
      gameInterval: null as any,
    }
  },
  computed: {
    roadLineStyle() {
      if (this.isOver) {
        return {
          animation: 'none'
        }
      }
      return {
        animationDuration: 1 / this.speed + 's'
      }
    },
    colors() {
      return ['#4a7fd4', '#4fae5c', '#e8c64a', '#e88a3a']
    },
  },
  mounted() {
    window.addEventListener('keydown', this.arrow)
    this.runGame()
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.arrow)
    clearInterval(this.gameInterval)
  },
  methods: {
    arrow(event: KeyboardEvent) {
      if (this.isOver) {
        if (event.key === 'Enter') {
          this.restart()
        }
        return
      }
      if (event.key === 'ArrowLeft') {
        this.movePlayer(-X_STEP)
      }
      if (event.key === 'ArrowRight') {
        this.movePlayer(X_STEP)
      }
    },
    movePlayer(delta: number) {
      if (this.isMoving) return
      this.player.x = Math.min(X_MAX, Math.max(X_MIN, this.player.x + delta))
      this.isMoving = true
      setTimeout(() => {
        this.isMoving = false
      }, 250)
    },
    newObstacle() {
      const color = this.colors[Math.floor(Math.random() * this.colors.length)]
      const x = X_CENTERS[Math.floor(Math.random() * X_CENTERS.length)]
      this.obstacles.push({
        id: this.carId++,
        color: color,
        x: x,
        y: -30,
        hit: false,
        changeTimer: this.randomChangeTimer(),
      })
    },
    randomChangeTimer() {
      return Math.floor(60 + Math.random() * 100)
    },
    changeObstacleTrajectory(obstacle: Obstacle) {
      if (obstacle.y > 40) return
      const options = X_CENTERS.filter((center) => Math.abs(center - obstacle.x) > 1)
      obstacle.x = options[Math.floor(Math.random() * options.length)]
    },
    isAccident() {
      if (this.invulnerable > 0) return
      for (const obstacle of this.obstacles) {
        const closeByX = Math.abs(obstacle.x - this.player.x) < 14
        const closeByY = obstacle.y > 35 && obstacle.y < 95
        if (!obstacle.hit && closeByX && closeByY) {
          this.player.lives -= 1
          obstacle.hit = true
          this.invulnerable = 16
          if (this.player.lives <= 0) {
            this.gameOver()
          }
          return
        }
      }
    },
    gameOver() {
      this.isOver = true
      clearInterval(this.gameInterval)
    },
    restart() {
      this.score = 0
      this.speed = 1
      this.carId = 0
      this.player.lives = 3
      this.player.x = 30
      this.obstacles = []
      this.isOver = false
      this.invulnerable = 0
      this.spawnProgress = 0
      this.spawnGap = 45
      this.runGame()
    },
    runGame() {
      this.gameInterval = setInterval(() => {
        this.score += 0.05 * this.speed
        this.speed = Math.min(this.speed + 0.0015, 3.5)
        if (this.invulnerable > 0) {
          this.invulnerable -= 1
        }
        this.spawnProgress += 1.5 * this.speed
        if (this.spawnProgress >= this.spawnGap) {
          this.spawnProgress = 0
          this.spawnGap = 38 + Math.random() * 14
          this.newObstacle()
        }
        for (const obstacle of this.obstacles) {
          obstacle.y += 1.5 * this.speed
          obstacle.changeTimer -= 1
          if (obstacle.changeTimer <= 0) {
            this.changeObstacleTrajectory(obstacle)
            obstacle.changeTimer = this.randomChangeTimer()
          }
        }
        this.isAccident()
        this.obstacles = this.obstacles.filter((obstacle) => obstacle.y < 120)
      }, 50)
    },
  },
}
</script>

<style scoped lang="scss">
.game {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #141b30 0%, #2e4370 60%, #0d1220 100%);

  &__header {
    position: absolute;
    width: 100%;
    height: 6%;
    top: 0;
    left: 0;
    font-size: 22px;
    color: #ffd166;
    background-color: rgba(18, 22, 32, 0.92);
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__finished {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 22px;
    color: white;
    background-color: rgba(15, 18, 28, 0.92);
    padding: 26px 44px;
    border-radius: 12px;
    z-index: 20;
    text-align: center;
    border: 2px solid #d64545;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  &__restart {
    padding: 10px 28px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 700;
    color: #121620;
    background-color: #ffd166;
    cursor: pointer;

    &:hover {
      background-color: #ffe08a;
    }
  }

  &__world {
    position: absolute;
    inset: 0;
    transform-style: preserve-3d;
    transform: perspective(900px) rotateX(30deg);
    transform-origin: center top;
    background: repeating-linear-gradient(
      90deg,
      #2f7d50 0px,
      #2f7d50 90px,
      #2a6f46 90px,
      #2a6f46 180px
    );
  }

  &__road {
    position: absolute;
    top: 0;
    left: 20%;
    width: 60%;
    height: 100%;
    background-color: #34343a;
    border-left: 3px solid #e8e8e8;
    border-right: 3px solid #e8e8e8;
    transform-style: preserve-3d;
  }

  &__line {
    animation: moveRoad linear infinite;
  }

  @keyframes moveRoad {
    from {
      stroke-dashoffset: 0;
    }
    to {
      stroke-dashoffset: -90;
    }
  }
}
</style>
