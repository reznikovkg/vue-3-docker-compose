<template>
  <div class="map" @mousemove="(e) => handleMouseCoords(e)">
    <Bullet v-for="bullet in getBullets" :key="bullet.id" :x="cameraOffsetX(bullet.x)" :y="cameraOffsetY(bullet.y)" :megaBullet="bullet.megaBullet" :id="bullet.id" />
    <MegaShot v-if="getMegaShot" :startX="cameraOffsetX(getMegaShot.startX)" :startY="cameraOffsetY(getMegaShot.startY)" :endX="cameraOffsetX(getMegaShot.endX)" :endY="cameraOffsetY(getMegaShot.endY)" />
    <AreaShot v-if="getAreaShot" :x="cameraOffsetX(getAreaShot.x)" :y="cameraOffsetY(getAreaShot.y)" :radius="getAreaShot.radius" />
    <Bullet v-for="enemyBullet in getEnemyBullets" :key="enemyBullet.id" :x="cameraOffsetX(enemyBullet.x)" :y="cameraOffsetY(enemyBullet.y)" :id="enemyBullet.id" />
    <Character characterType="player" :x="playerScreenX" :y="playerScreenY" :direction="direction" :speedLevel="playerSpeedLevel" :isMoving="isMoving" :upgraded="upgraded" />
    <Character v-for="enemy in getEnemies" :key="enemy.id" characterType="enemy" :x="cameraOffsetX(enemy.x)" :y="cameraOffsetY(enemy.y)" :vx="enemy.vx" :vy="enemy.vy" :enemyType="enemy.type" :direction="enemy.direction" :speed="enemy.speed" :id="enemy.id" />
    <div class="map__hotbar">
      <div class="map__hotbar__slot">Points: {{ getPoints }}</div>
      <div class="map__hotbar__slot">HP: {{ getHealth }} / {{ getHealthLimit }}</div>
      <div class="map__hotbar__slot">Damage: {{ getDamage }}</div>
      <div class="map__hotbar__slot">Mana: {{ getMana }} / {{ getManaLimit }}</div>
    </div>
    <div v-if="!getGameStatus" class="map__over">
      Игра окончена
      <button class="map__over__restart" @click="() => restart()">
        Сыграть ещё
      </button>
    </div>
    <div v-if="getPause" class="map__pause">
      Пауза
      <button class="map__pause__upgrade" @click="() => buyHeal()"> Купить хил (10) </button>
      <button class="map__pause__upgrade" @click="() => increaseDamageUpgrade()"> Увеличение урона (25) </button>
      <button class="map__pause__upgrade" @click="() => buyMana()"> Купить ману (15) </button>
      <button class="map__pause__upgrade" @click="() => increaseHealthLimitUpGrade()"> Увеличить лимит хп (20) </button>
      <button class="map__pause__upgrade" @click="() => increaseManaLimitUpgrade()"> Увеличить лимит маны (30) </button>
      <button class="map__pause__upgrade" @click="() => increaseSpeedUpgrade()"> Увеличить скорость (15) </button>
    </div>
  </div>
</template>

<script>
import Bullet from './../ui/Bullet.vue'
import MegaShot from './../ui/MegaShot.vue'
import AreaShot from './../ui/AreaShot.vue'
import Character from './../ui/Character.vue'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'GamePage',
  components: {
    Bullet,
    MegaShot,
    AreaShot,
    Character
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
      },
      direction: 'up',
      speedLevel: 1,
      isMoving: false,
      upgraded: false
    }
  },
  computed: {
    ...mapGetters('game', [
      'getCoords',
      'getPoints',
      'getHealth',
      'getHealthLimit',
      'getDamage',
      'getMana',
      'getManaLimit',
      'getSpeed',
      'getBullets',
      'getEnemyBullets',
      'getEnemies',
      'getMegaShot',
      'getAreaShot',
      'getGameStatus',
      'getPause'
    ]),
    playerScreenX () {
      return window.innerWidth / 2
    },
    playerScreenY () {
      return window.innerHeight / 2
    },
    playerSpeedLevel () {
      if (this.getSpeed < 25) {
        return 1
      }
      if (this.getSpeed > 25 && this.getSpeed < 35) {
        return 2
      }
      return 3
    }
  },
  mounted () {
    window.addEventListener('keydown', (e) => this.pressedKey(e))
    window.addEventListener('keyup', () => this.upKey())
    this.bulletMovement()
    this.enemyMovement()
  },
  beforeUnmount () {
    window.removeEventListener('keydown', (e) => this.pressedKey(e))
  },
  methods: {
    ...mapActions('game', [
      'pushBullet',
      'pushEnemyBullet',
      'pushEnemy',
      'moveLeft',
      'moveRight',
      'moveUp',
      'moveDown',
      'moveBullets',
      'moveEnemyBullets',
      'moveEnemies',
      'megaShot',
      'areaShot',
      'buyHeal',
      'increaseDamage',
      'buyMana',
      'increaseHealthLimit',
      'increaseManaLimit',
      'increaseSpeed',
      'setGameStatus',
      'setPause'
    ]),
    cameraOffsetX (x) {
      return x - this.cameraCoords.x + window.innerWidth / 2
    },
    cameraOffsetY (y) {
      return y - this.cameraCoords.y + window.innerHeight / 2
    },
    pressedKey (e) {
      if (!this.getGameStatus) {
        return
      }
      this.isMoving = true
      const step = this.getSpeed
      if (e.key === 'Escape') {
        this.setPause(!this.getPause)
      }
      if (e.key === 'z') {
        this.megaShot({
          playerX: this.getCoords.x,
          playerY: this.getCoords.y,
          cursorX: this.mouseCoords.x,
          cursorY: this.mouseCoords.y
        })
      }
      if (e.key === 'x') {
        this.areaShot({
          playerX: this.getCoords.x,
          playerY: this.getCoords.y
        })
      }
      if (e.key === 'ArrowUp' && this.direction === 'left') {
        this.direction = 'upLeft'
      }
      else if (e.key === 'ArrowLeft' && this.direction === 'up') {
        this.direction = 'upLeft'
      }
      else if (e.key === 'ArrowUp' && this.direction === 'right') {
        this.direction = 'upRight'
      }
      else if (e.key === 'ArrowRight' && this.direction === 'up') {
        this.direction = 'upRight'
      }
      else if (e.key === 'ArrowDown' && this.direction === 'left') {
        this.direction = 'downLeft'
      }
      else if (e.key === 'ArrowLeft' && this.direction === 'down') {
        this.direction = 'downLeft'
      }
      else if (e.key === 'ArrowDown' && this.direction === 'right') {
        this.direction = 'downRight'
      }
      else if (e.key === 'ArrowRight' && this.direction === 'down') {
        this.direction = 'downRight'
      }
      else if (e.key === 'ArrowUp') {
        this.direction = 'up'
      }
      else if (e.key === 'ArrowDown') {
        this.direction = 'down'
      }
      else if (e.key === 'ArrowLeft') {
        this.direction = 'left'
      }
      else if (e.key === 'ArrowRight') {
        this.direction = 'right'
      }
      if (e.key.includes('Right')) {
        this.moveRight()
        this.cameraCoords.x += step
      }
      if (e.key.includes('Left')) {
        this.moveLeft()
        this.cameraCoords.x -= step
      }
      if (e.key.includes('Up')) {
        this.moveUp()
        this.cameraCoords.y -= step
      }
      if (e.key.includes('Down')) {
        this.moveDown()
        this.cameraCoords.y += step
      }
    },
    upKey () {
      this.isMoving = false
    },
    handleMouseCoords (e) {
      this.mouseCoords.x = e.clientX + this.cameraCoords.x - window.innerWidth / 2
      this.mouseCoords.y = e.clientY + this.cameraCoords.y - window.innerHeight / 2
    },
    increaseDamageUpgrade () {
      this.increaseHealthLimit()
      this.upgraded = true
    },
    increaseHealthLimitUpGrade () {
      this.increaseHealthLimit()
      this.upgraded = true
    },
    increaseManaLimitUpgrade () {
      this.increaseManaLimit()
      this.upgraded = true
    },
    increaseSpeedUpgrade () {
      this.increaseSpeed()
      this.upgraded = true
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
        this.pushEnemyBullet({
          playerX: this.getCoords.x,
          playerY: this.getCoords.y
        })
      }, 1600)
      setInterval(() => {
        this.moveBullets()
      }, 16)
      setInterval(() => {
        this.moveEnemyBullets()
      }, 32)
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

  &__hotbar {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    font-size: 46px;
    gap: 10px;
    position: absolute;
    left: 50%;
    bottom: 10px;
    padding: 10px;
    color: white;
    background-color: rgb(43, 51, 168);
    border-radius: 2%;
    transform: translateX(-50%);
    border: 2px solid gold;
    box-sizing: border-box;

    &__slot {
      width: 300px;
      height: 100px;
      font-size: 30px;
      padding: 10px 20px;
      text-align: center;
    }
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

  &__pause {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 46px;
    gap: 10px;
    position: absolute;
    width: 900px;
    height: 525px;
    top: 50%;
    left: 50%;
    color: white;
    background-color: rgb(43, 51, 168);
    border-radius: 2%;
    transform: translate(-50%, -50%);
    border: 2px solid gold;

    &__upgrade {
      width: 450px;
      height: 60px;
      border: 2px solid gold;
      background-color: rgb(43, 51, 168);
      color: white;
      font-size: 30px;
      padding: 10px 20px;
    }
  }
}
</style>
