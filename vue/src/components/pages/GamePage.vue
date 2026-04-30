<template>
  <div class="map" @mousemove="(e) => handleMouseCoords(e)">
    <Bullet v-for="bullet in getBullets" :key="bullet.id" :x="cameraOffsetX(bullet.x)" :y="cameraOffsetY(bullet.y)" :id="bullet.id" />
    <div class="map__player" />
    <Enemy v-for="enemy in getEnemies" :key="enemy.id" :x="cameraOffsetX(enemy.x)" :y="cameraOffsetY(enemy.y)" :id="enemy.id" />
    <div v-if="!getGameStatus" class="map__over">
      Игра окончена
      <button class="map__over__restart" @click="() => restart()">
        Сыграть ещё
      </button>
    </div>
  </div>
</template>

<script>
import Bullet from './../ui/Bullet.vue'
import Enemy from './../ui/Enemy.vue'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'GamePage',
  components: {
    Bullet,
    Enemy
  },
  data () {
    return {
      mouseCoords: {
        x: 0,
        y: 0
      },
      cameraCoords: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      }
    }
  },
  computed: {
    ...mapGetters('game', [
      'getCoords',
      'getPoints',
      'getBullets',
      'getEnemies',
      'getGameStatus'
    ])
  },
  mounted () {
    window.addEventListener('keydown', (e) => this.pressedArrow(e))
    this.bulletMovement()
    this.enemyMovement()
  },
  beforeUnmount () {
    window.removeEventListener('keydown', (e) => this.pressedArrow(e))
  },
  methods: {
    ...mapActions('game', [
      'pushBullet',
      'pushEnemy',
      'moveLeft',
      'moveRight',
      'moveUp',
      'moveDown',
      'moveBullets',
      'moveEnemies',
      'setGameStatus'
    ]),
    cameraOffsetX (x) {
      return x - this.cameraCoords.x + window.innerWidth / 2
    },
    cameraOffsetY (y) {
      return y - this.cameraCoords.y + window.innerHeight / 2
    },
    pressedArrow (e) {
      if (!this.getGameStatus) {
        return
      }
      const step = 20
      if (e.key === 'ArrowRight' && this.getCoords.x < window.innerWidth) {
        this.moveRight()
        this.cameraCoords.x += step
      }
      if (e.key === 'ArrowLeft' && this.getCoords.x > 0) {
        this.moveLeft()
        this.cameraCoords.x -= step
      }
      if (e.key === 'ArrowUp' && this.getCoords.y > 0) {
        this.moveUp()
        this.cameraCoords.y -= step
      }
      if (e.key === 'ArrowDown' && this.getCoords.y < window.innerHeight) {
        this.moveDown()
        this.cameraCoords.y += step
      }
    },
    handleMouseCoords (e) {
      this.mouseCoords.x = e.clientX + this.cameraCoords.x - window.innerWidth / 2
      this.mouseCoords.y = e.clientY + this.cameraCoords.y - window.innerHeight / 2
    },
    bulletMovement () {
      setInterval(() => {
        this.pushBullet({
          playerX: this.getCoords.x,
          playerY: this.getCoords.y,
          cursorX: this.mouseCoords.x,
          cursorY: this.mouseCoords.y
        })
      }, 600)
      setInterval(() => {
        this.moveBullets()
      }, 16)
    },
    enemyMovement () {
      setInterval(() => {
        this.pushEnemy({
          playerX: this.getCoords.x,
          playerY: this.getCoords.y
        })
      }, 1600)
      setInterval(() => {
        this.moveEnemies({
          playerX: this.getCoords.x,
          playerY: this.getCoords.y
        })
      }, 400)
    },
    restart () {
      this.setGameStatus(true)
      this.cameraCoords.x = window.innerWidth / 2
      this.cameraCoords.y = window.innerHeight / 2
    }
  }
}
</script>

<style scoped lang="scss">
.map {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: rgba(5, 61, 38, 0.836);

  &__player {
    position: absolute;
    border-radius: 50%;
    background: red;
    width: 80px;
    height: 80px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: 0.2s;
  }

  &__over {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 46px;
    gap: 10px;
    position: absolute;
    width: 600px;
    height: 300px;
    top: 50%;
    left: 50%;
    color: white;
    background-color: rgb(43, 51, 168);
    border-radius: 2%;
    transform: translate(-50%, -50%);
    border: 2px solid gold;

    &__restart {
      border: 2px solid gold;
      background-color: rgb(43, 51, 168);
      color: white;
      font-size: 30px;
      padding: 10px 20px;
    }
  }
}
</style>
