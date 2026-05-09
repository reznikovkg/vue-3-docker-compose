<template>
  <div class="game">
    <div class="game__header">
      <button @click="pause">{{ isPaused ? '▶' : '⏸' }}</button>
      Cчёт: {{ Math.floor(score) }} м. Жизни:
      <div class="game__heart" v-for="n in player.lives" :key="n">❤️️</div>
    </div>
    <div v-if="isOver" class="game__finished">
      Игра окончена! Итоговый счёт: {{ Math.floor(score) }} м. Рекорд: {{ record }} м.
    </div>
    <div class="game__road">
      <svg width="100%" height="100%">
        <line class="game__line" :style="roadLineStyle" stroke-dasharray="50,40" x1="24.5%" y1="0" x2="24.5%" y2="100%" stroke="#ffffff" stroke-width="2%" />
        <line class="game__line" :style="roadLineStyle" stroke-dasharray="50,40" x1="50%" y1="0" x2="50%" y2="100%" stroke="#ffffff" stroke-width="2%" />
        <line class="game__line" :style="roadLineStyle" stroke-dasharray="50,40" x1="75.5%" y1="0" x2="75.5%" y2="100%" stroke="#ffffff" stroke-width="2%" />
      </svg>

      <Car ref="playerCar" :x="player.x" :y="playerY" />

      <template v-for="obstacle in obstacles" :key="obstacle.id">
        <Car v-if="obstacle.type === 'car'" :data-id="obstacle.id" :x="obstacle.x" :direction="obstacle.direction" :y="obstacle.y"/>
        <div class="game__obstacle" v-else-if="obstacle.type === 'hole'" :data-id="obstacle.id" :style="obstacleStyle(obstacle)"/>
        <div class="game__obstacle" v-else-if="obstacle.type === 'barrier'" :data-id="obstacle.id" :style="obstacleStyle(obstacle)"/>
      </template>

      <template v-for="bonus in bonuses" :key="bonus.id">
        <div class="game__bonus" :data-id="bonus.id" :style="{top: bonus.y + '%', left: bonus.x + '%'}">
          {{ bonus.type === 'heart' ? '❤️' : '⚡' }}
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import Car from '../ui/Car.vue'
import holeImg from './../../assets/hole.png'
import barrierImg from './../../assets/barrier.png'

export default {
  name: 'IndexPage',
  components: {
    Car
  },
  data () {
    return {
      score: 0,
      record: parseInt(localStorage.getItem('gameRecord') || '0'),
      speed: 1,
      maxSpeed: 5,
      worldSpeed: 1.5,
      carId: 0,
      player: {
        x: 55,
        lives: 3,
      },
      obstacles: [] as any[],
      bonuses: [] as any[],
      isStunned: false,
      isPaused: false,
      isOver: false,
      gameInterval: null as any,
      spawnInterval: null as any,
      holeImg,
      barrierImg,
    }
  },
  computed: {
    roadLineStyle() {
      if (this.isOver || this.isPaused) {
        return {
          animation: 'none'
        }
      }
      return {
        animationDuration: 1 / this.speed + 's'
      }
    },
    obstacleStyle() {
      return (obstacle: any) => {
        const image = obstacle.type === 'hole' ? `url(${this.holeImg})` : `url(${this.barrierImg})`
        return {
          top: obstacle.y + '%',
          left: obstacle.x + '%',
          backgroundImage: image
        }
      }
    },
    playerY() {
      return 65;
    },
  },
  mounted() {
    window.addEventListener('keydown', this.arrow)
    document.addEventListener('visibilitychange', this.tabSwitch)
    this.runGame()
    this.spawn()
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.arrow)
    document.removeEventListener('visibilitychange', this.tabSwitch)
    clearInterval(this.gameInterval)
    clearInterval(this.spawnInterval)
  },
  methods: {
    pause() {
      if (this.isOver) return
      this.isPaused = !this.isPaused
      if (this.isPaused) {
        clearInterval(this.gameInterval)
        clearInterval(this.spawnInterval)
      }
      else {
        this.runGame()
        this.spawn()
      }
    },
    tabSwitch() {
      if (document.hidden) {
        if (!this.isPaused && !this.isOver) {
          this.pause()
        }
      }
      else {
        if (this.isPaused && !this.isOver) {
          this.pause()
        }
      }
    },
    arrow(event: KeyboardEvent) {
      if(this.isOver) return;
      const step = 8
      let newX = this.player.x
      if (event.key === 'ArrowLeft') {
        if (newX > 1 + step) {
          newX -= step
        }
        else return
      }
      else if (event.key === 'ArrowRight') {
        if (newX < 83.5 - step) {
          newX += step
        }
        else return
      }
      else return
      this.player.x = newX
    },
    newObstacle() {
      const rand = Math.random()
      let type = 'car'
      if (rand < 0.2)
        type = 'hole'
      else if (rand < 0.4)
        type = 'barrier'
      const centers = [4.25, 29.25, 54.75, 79.75]
      const x = centers[Math.floor(Math.random() * centers.length)]
      const id = this.carId++
      this.obstacles.push({
        id: id,
        type: type,
        x: x,
        direction: 1,
        y: -50,
        hit: false,
      })
    },
    newBonus() {
      const type = Math.random() < 0.5 ? 'heart' : 'boost'
      const centers = [4.25, 29.25, 54.75, 79.75]
      const x = centers[Math.floor(Math.random() * centers.length)]
      const id = this.carId++
      this.bonuses.push({
        id: id,
        type: type,
        x: x,
        y: -50
      })
    },
    isIntersection(r1: DOMRect, r2: DOMRect) {
      return !(r2.left > r1.right ||
          r2.right < r1.left ||
          r2.top > r1.bottom ||
          r2.bottom < r1.top)
    },
    collectBonus() {
      const playerEl = (this.$refs.playerCar as any).$el
      if (!playerEl) return
      const playerRect = playerEl.getBoundingClientRect()

      for (let i = 0; i < this.bonuses.length; i++) {
        const b = this.bonuses[i]
        const bonusEl = document.querySelector(`[data-id="${b.id}"]`)
        if (!bonusEl) continue
        const bonusRect = bonusEl.getBoundingClientRect()
        if (this.isIntersection(playerRect, bonusRect)) {
          if (b.type === 'heart') {
            this.player.lives = Math.min(this.player.lives + 1, 4)
          }
          else if (b.type === 'boost') {
            this.applyBoost()
          }
          this.bonuses.splice(i, 1)
          return
        }
      }
    },
    applyBoost() {
      const originalSpeed = this.speed
      this.speed = Math.min(this.speed * 2, this.maxSpeed * 1.2)
      setTimeout(() => {
        if (this.speed > originalSpeed) {
          this.speed = originalSpeed
        }
      }, 6000)
    },
    spawn() {
      if (this.spawnInterval) clearInterval(this.spawnInterval)
      this.spawnInterval = setInterval(() => {
        this.newObstacle()
        if (Math.random() < 0.1) {
          this.newBonus()
        }
      }, 1700 / this.speed)
    },
    gameOver() {
      this.isOver = true
      if (Math.floor(this.score) > this.record) {
        this.record = Math.floor(this.score)
        localStorage.setItem('gameRecord', String(this.record))
      }
      clearInterval(this.gameInterval)
      clearInterval(this.spawnInterval)
    },
    handleAccident(obstacle: any) {
      if (obstacle.hit) return
      this.player.lives -= 1
      obstacle.hit = true

      if (!this.isStunned) {
        this.isStunned = true
        this.speed = 0.01
        setTimeout(() => {
          this.isStunned = false
          if (this.speed < 0.2) this.speed = 0.2
        }, 500)
      }
      setTimeout(() => {
        const index = this.obstacles.indexOf(obstacle)
        if (index !== -1)
          this.obstacles.splice(index, 1)
      }, 200)
      if (this.player.lives <= 0)
        this.gameOver()
    },
    isAccident() {
      const playerEl = (this.$refs.playerCar as any)?.$el
      if (!playerEl) return false
      const playerRect = playerEl.getBoundingClientRect()

      for (const obs of this.obstacles) {
        if (obs.hit) continue
        const obsEl = document.querySelector(`[data-id="${obs.id}"]`)
        if (!obsEl) continue
        const obsRect = obsEl.getBoundingClientRect()
        if (this.isIntersection(playerRect, obsRect)) {
          this.handleAccident(obs)
          return true
        }
      }
      return false
    },
    runGame() {
      if(this.gameInterval) clearInterval(this.gameInterval)
      this.gameInterval = setInterval(() => {
        this.score += 0.05 * this.speed
        if (this.speed < this.maxSpeed) {
          this.speed += 0.003
        }
        else {
          this.speed += 0.00001
        }

        if (this.worldSpeed < this.maxSpeed) {
          this.worldSpeed += 0.0001
        }

        this.obstacles.forEach(obstacle => obstacle.y += 1.5 * this.worldSpeed)
        this.bonuses.forEach(b => b.y += 1.5 * this.worldSpeed)
        this.collectBonus()
        this.isAccident()
        if (this.player.lives <= 0)
        {
          this.gameOver()
          return
        }
        this.obstacles = this.obstacles.filter(obstacle => obstacle.y < 120)
        this.bonuses = this.bonuses.filter(bonus => bonus.y < 120)
      }, 45)
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
  background: linear-gradient(145deg, #2b5876 0%, #4e4376 100%);

  &__header {
    position: absolute;
    width: 100%;
    height: 5%;
    top: 0;
    left: 0;
    font-size: 25px;
    color: red;
    background-color: rgba(0, 0, 0, 1);
    z-index: 10;
    text-align: center;
  }

  &__heart {
    display: inline-block;
  }

  &__finished {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 24px;
    color: white;
    background-color: rgba(0, 0, 0, 0.8);
    padding: 20px 40px;
    border-radius: 10px;
    z-index: 20;
    text-align: center;
    border: 2px solid red;
  }

  &__road {
    position: relative;
    background-color: #282828 ;
    width: 60%;
    height: 95%;
    top: 5%;
    left: 20%;
    transform-style: preserve-3d;
    transform: perspective(900px) rotateX(30deg);
    transform-origin: center top;
  }

  &__line {
    animation: moveRoad linear infinite;
  }

  &__obstacle {
    position: absolute;
    width: 15.5%;
    height: 10%;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center;
    z-index: 5;
  }

  &__bonus {
    position: absolute;
    width: 10%;
    height: 8%;
    font-size: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 6;
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