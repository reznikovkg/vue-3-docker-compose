<template>
  <div class="map" @mousemove="(e) => handleMouseCoords(e)">
    <Bullet v-for="bullet in getBullets" :key="bullet.id" :x="bullet.x" :y="bullet.y" :id="bullet.id" />
    <div class="map__player" :style="styles" />
    <Enemy v-for="enemy in getEnemies" :key="enemy.id" :x="enemy.x" :y="enemy.y" :id="enemy.id" />
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
    ]),
    styles () {
      return {
        transform: `translate(-50%, -50%) translateX(${this.getCoords.x}px) translateY(${this.getCoords.y}px)`
      }
    }
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
    pressedArrow (e) {
      if (!this.getGameStatus) {
        return
      }
      if (e.key === 'ArrowRight') {
        this.moveRight()
      }
      if (e.key === 'ArrowLeft') {
        this.moveLeft()
      }
      if (e.key === 'ArrowUp') {
        this.moveUp()
      }
      if (e.key === 'ArrowDown') {
        this.moveDown()
      }
    },
    handleMouseCoords (e) {
      this.mouseCoords.x = e.clientX
      this.mouseCoords.y = e.clientY
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
