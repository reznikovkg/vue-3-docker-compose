<template>
  <div class="game">
    <div class="game__header">
      <button @click="() => pause()">{{ isPaused ? '▶' : '⏸' }}</button>
      Cчёт: {{ Math.floor(getScore) }} м. Жизни:
      <div class="game__heart" v-for="n in getPlayer.lives" :key="n">❤️️</div>
    </div>
    <div v-if="getIsOver" class="game__finished">
      Игра окончена! Итоговый счёт: {{ Math.floor(getScore) }} м. Рекорд: {{ getRecord }} м.
    </div>
    <div class="game__road">
      <svg width="100%" height="100%">
        <line class="game__line" :style="roadLineStyle" stroke-dasharray="50,40" x1="24.5%" y1="0" x2="24.5%" y2="100%" stroke="#ffffff" stroke-width="2%" />
        <line class="game__line" :style="roadLineStyle" stroke-dasharray="50,40" x1="50%" y1="0" x2="50%" y2="100%" stroke="#ffffff" stroke-width="2%" />
        <line class="game__line" :style="roadLineStyle" stroke-dasharray="50,40" x1="75.5%" y1="0" x2="75.5%" y2="100%" stroke="#ffffff" stroke-width="2%" />
      </svg>

      <Car ref="playerCar" :x="getPlayer.x" :y="playerY" />

      <template v-for="obstacle in getObstacles" :key="obstacle.id">
        <Car v-if="obstacle.type === 'car'" :data-id="obstacle.id" :x="obstacle.x" :direction="obstacle.direction" :y="obstacle.y"/>
        <div class="game__obstacle" v-else-if="obstacle.type === 'hole'" :data-id="obstacle.id" :style="obstacleStyle(obstacle)"/>
        <div class="game__obstacle" v-else-if="obstacle.type === 'barrier'" :data-id="obstacle.id" :style="obstacleStyle(obstacle)"/>
      </template>

      <template v-for="bonus in getBonuses" :key="bonus.id">
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
import { mapGetters, mapActions } from "vuex";

export default {
  name: 'IndexPage',
  components: {
    Car
  },
  data () {
    return {
      isPaused: false,
      gameInterval: null as any,
      spawnInterval: null as any,
      holeImg,
      barrierImg,
    }
  },
  computed: {
    ...mapGetters('game', [
        'getScore',
        'getRecord',
        'getSpeed',
        'getWorldSpeed',
        'getPlayer',
        'getObstacles',
        'getBonuses',
        'getIsStunned',
        'getIsOver',
    ]),
    roadLineStyle() {
      if (this.getIsOver || this.isPaused) {
        return {
          animation: 'none'
        }
      }
      return {
        animationDuration: 1 / this.getSpeed + 's'
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
    ...mapActions('game', [
        'updatePlayerX',
        'newObstacle',
        'newBonus',
        'applyBoost',
        'handleBonus',
        'gameOver',
        'handleAccident',
        'updateGame',
        'removeObjects'
    ]),
    pause() {
      if (this.getIsOver) return
      this.isPaused = !this.isPaused
      if (this.isPaused) {
        this.stopIntervals()
      }
      else {
        this.runGame()
        this.spawn()
      }
    },
    tabSwitch() {
      if (document.hidden) {
        if (!this.isPaused && !this.getIsOver) {
          this.pause()
        }
      }
      else {
        if (this.isPaused && !this.getIsOver) {
          this.pause()
        }
      }
    },
    arrow(event: KeyboardEvent) {
      if (this.getIsOver) return
      const step = 8
      let newX = this.getPlayer.x
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
      this.updatePlayerX(newX)
    },
    isIntersection(r1: DOMRect, r2: DOMRect) {
      const r1Left = r1.left + r1.width * 0.2
      const r1Right = r1.right - r1.width * 0.2
      const r1Top = r1.top + r1.height * 0.15
      const r1Bottom = r1.bottom - r1.height * 0.15

      const r2Left = r2.left + r2.width * 0.2
      const r2Right = r2.right - r2.width * 0.2
      const r2Top = r2.top + r2.height * 0.15
      const r2Bottom = r2.bottom - r2.height * 0.15

      return !(r2Left > r1Right ||
          r2Right < r1Left ||
          r2Top > r1Bottom ||
          r2Bottom < r1Top)
    },
    collectBonus() {
      const playerEl = (this.$refs.playerCar as any).$el
      if (!playerEl) return
      const playerRect = playerEl.getBoundingClientRect()

      for (let i = 0; i < this.getBonuses.length; i++) {
        const b = this.getBonuses[i]
        const bonusEl = document.querySelector(`[data-id="${b.id}"]`)
        if (!bonusEl) continue
        const bonusRect = bonusEl.getBoundingClientRect()
        if (this.isIntersection(playerRect, bonusRect)) {
          this.handleBonus({
            bonusId: b.id,
            bonusType: b.type
          })
          return
        }
      }
    },
    spawn() {
      if (this.spawnInterval) clearInterval(this.spawnInterval)
      this.spawnInterval = setInterval(() => {
        this.newObstacle()
        if (Math.random() < 0.1) {
          this.newBonus()
        }
      }, 1700 / this.getSpeed)
    },
    stopIntervals() {
      clearInterval(this.gameInterval)
      clearInterval(this.spawnInterval)
    },
    isAccident() {
      const playerEl = (this.$refs.playerCar as any)?.$el
      if (!playerEl) return false
      const playerRect = playerEl.getBoundingClientRect()

      for (const obs of this.getObstacles) {
        if (obs.hit) continue
        const obsEl = document.querySelector(`[data-id="${obs.id}"]`)
        if (!obsEl) continue
        const obsRect = obsEl.getBoundingClientRect()
        if (this.isIntersection(playerRect, obsRect)) {
          this.handleAccident(obs.id)
          return true
        }
      }
      return false
    },
    runGame() {
      if(this.gameInterval) clearInterval(this.gameInterval)
      this.gameInterval = setInterval(() => {
        this.updateGame()
        this.collectBonus()
        this.isAccident()
        if (this.getPlayer.lives <= 0)
        {
          this.gameOver()
          this.stopIntervals()
          return
        }
        this.removeObjects()
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