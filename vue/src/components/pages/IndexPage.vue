<template>
  <div class="game">
    <div class="game__header">
      Счёт: {{ Math.floor(score) }} м. Осталось жизней: {{ player.lives }}.
    </div>
    <div v-if="isOver" class="game__finished">
      <div>Игра окончена! Итоговый счёт: {{ Math.floor(score) }} м</div>
      <button class="game__restart" @click="restart">Начать заново</button>
    </div>
    <div class="game__road">
      <svg width="100%" height="100%">
        <line v-for="line in 3" :key="line" class="game__line" :style="roadLineStyle" stroke-dasharray="50,40" :x1="line * 25 + '%'" y1="0" :x2="line * 25 + '%'" y2="100%" stroke="#f2f2f2" stroke-width="2" />
      </svg>
      <Car :image="player.image" :lane="player.lane" :y="playerY" />
      <Car v-for="obstacle in obstacles" :key="obstacle.id" :image="obstacle.image" :lane="obstacle.lane" :y="obstacle.y" :hit="obstacle.hit" />
    </div>
  </div>
</template>

<script lang="ts">
import Car from '../ui/Car.vue';
import blueCar from './../../assets/cars/blue.svg'
import greenCar from './../../assets/cars/green.svg'
import yellowCar from './../../assets/cars/yellow.svg'
import orangeCar from './../../assets/cars/orange.svg'
import redCar from './../../assets/cars/red.svg'

interface Obstacle {
  id: number
  image: string
  lane: number
  y: number
  hit: boolean
  changeTimer: number
}

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
      playerY: 68,
      player: {
        image: redCar,
        lane: 2,
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
      return [blueCar, greenCar, yellowCar, orangeCar]
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
        this.changeLane(-1)
      }
      if (event.key === 'ArrowRight') {
        this.changeLane(1)
      }
    },
    changeLane(delta: number) {
      if (this.isMoving) return
      const lane = this.player.lane + delta
      if (lane < 1 || lane > 4) return
      this.player.lane = lane
      this.isMoving = true
      setTimeout(() => {
        this.isMoving = false
      }, 350)
    },
    newObstacle() {
      const image = this.colors[Math.floor(Math.random() * this.colors.length)]
      const lane = Math.floor(Math.random() * 4) + 1
      this.obstacles.push({
        id: this.carId++,
        image: image,
        lane: lane,
        y: -20,
        hit: false,
        changeTimer: this.randomChangeTimer(),
      })
    },
    randomChangeTimer() {
      return Math.floor(60 + Math.random() * 100)
    },
    changeObstacleLane(obstacle: Obstacle) {
      if (obstacle.y > 45) return
      const options = [1, 2, 3, 4].filter((lane) => lane !== obstacle.lane)
      obstacle.lane = options[Math.floor(Math.random() * options.length)]
    },
    isAccident(lane: number) {
      for (const obstacle of this.obstacles) {
        if (!obstacle.hit && obstacle.lane === lane && obstacle.y > 46 && obstacle.y < 90) {
          this.player.lives -= 1
          obstacle.hit = true
          this.invulnerable = 16
          if (this.player.lives <= 0) {
            this.gameOver()
          }
          return true
        }
      }
      return false
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
      this.player.lane = 2
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
            this.changeObstacleLane(obstacle)
            obstacle.changeTimer = this.randomChangeTimer()
          }
        }
        if (this.invulnerable <= 0) {
          this.isAccident(this.player.lane)
        }
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
  background-color: #2f7d50;

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

  &__road {
    position: relative;
    background-color: #34343a;
    width: 60%;
    height: 100%;
    left: 20%;
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
