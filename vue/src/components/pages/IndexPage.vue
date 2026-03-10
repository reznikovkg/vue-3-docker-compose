<!-- components/pages/IndexPage.vue -->
<template>
  <div class="game" ref="game" @mousemove="(e) => comMouseMove(e)">
    <div class="game__hud">
      <div class="game__time">Время: {{ trueTime }}</div>
      <div class="game__killed">Убито: {{ enemiesKilled }}</div>
    </div>

    <div class="game__world">
      <div
        class="game__player"
        :style="{
          left: player.x + 'px',
          top: player.y + 'px'
        }"
      ></div>

      <div
        v-for="(bullet, index) in bullets"
        :key="index"
        class="game__bullet"
        :style="{
          left: bullet.x + 'px',
          top: bullet.y + 'px'
        }"
      ></div>

      <div
        v-for="(enemy, index) in enemies"
        :key="index"
        class="game__enemy"
        :style="{
          left: enemy.x + 'px',
          top: enemy.y + 'px'
        }"
      ></div>
    </div>
    
    <div v-if="!gameActive" class="game__game-over">
      <h2 class="game__game-over-title">Игра окончена!</h2>
      <p class="game__game-over-time">Время: {{ trueTime }}</p>
      <p class="game__game-over-killed">Убито врагов: {{ enemiesKilled }}</p>
      <button class="game__game-over-button" @click="() => restartGame()">Играть снова</button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'GamePage',
  data() {
    return {
      animationFrame: null,
      loop: null,
      lastShotTime: 0,
      lastEnemyAppear: 0,
      shotCD: 500,
      enemySpawnCD: 1000,
      gameTime: 0,
      lastTimeUpd: 0,
      enemiesKilled: 0,
      gameActive: true,
      keysPressed: {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        w: false,
        a: false,
        s: false,
        d: false
      },
      worldSize: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }
  },
  computed: {
    ...mapGetters('game', [
      'getPlayer',
      'getMousePosition',
      'getEnemies',
      'getBullets'
    ]),
    player() { 
      return this.getPlayer 
    },
    mousePos() { 
      return this.getMousePosition 
    },
    enemies() { 
      return this.getEnemies 
    },
    bullets() { 
      return this.getBullets 
    },
    trueTime() {
      const totalSeconds = Math.floor(this.gameTime / 1000)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
  },
  mounted() {
    this.init()
    window.addEventListener('keydown', this.comKeyDown)
    window.addEventListener('keyup', this.comKeyUp)
    window.addEventListener('resize', this.comResize)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.comKeyDown)
    window.removeEventListener('keyup', this.comKeyUp)
    window.removeEventListener('resize', this.comResize)
    cancelAnimationFrame(this.animationFrame)
  },
  methods: {
    ...mapActions('game', [
      'setPlayerPosition',
      'setMousePosition',
      'addEnemy',
      'updateEnemies',
      'addBullet',
      'updateBullets'
    ]),

    comMouseMove(e) {
      const rect = this.$refs.game.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      this.setMousePosition({ x, y })
    },

    comKeyDown(e) {
      const key = e.key
      
      if (key.startsWith('Arrow')) {
        e.preventDefault()
        this.keysPressed[key] = true
      }
      if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
        e.preventDefault()
        this.keysPressed[key] = true
      }
    },
    
    comKeyUp(e) {
      const key = e.key
      
      if (key.startsWith('Arrow')) {
        e.preventDefault()
        this.keysPressed[key] = false
      }
      if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
        e.preventDefault()
        this.keysPressed[key] = false
      }
    },

    comResize() {
      this.worldSize = {
        width: window.innerWidth,
        height: window.innerHeight
      }
    },

    init() {
      this.gameActive = true
      this.gameTime = 0
      this.lastTimeUpd = 0
      this.enemiesKilled = 0
      this.lastShotTime = 0
      this.lastEnemyAppear = 0
      
      Object.keys(this.keysPressed).forEach(key => {
        this.keysPressed[key] = false
      })
      
      this.setPlayerPosition({ x: 200, y: 200 })
      this.updateEnemies([])
      this.updateBullets([])
      
      cancelAnimationFrame(this.animationFrame)
      this.loop = (timestamp) => {
        if (this.gameActive) 
          this.gameLoop(timestamp)
        this.animationFrame = requestAnimationFrame(this.loop)
      }
      this.animationFrame = requestAnimationFrame(this.loop)
    },

    restartGame() {
      this.init()
    },

    gameLoop(currentTime) {
      this.updateGameTime(currentTime)
      this.updatePlayerPosition()
      this.updateGame(currentTime)
    },

    updateGameTime(currentTime) {
      if (this.lastTimeUpd === 0) {
        this.lastTimeUpd = currentTime
        return
      }
      
      const deltaTime = currentTime - this.lastTimeUpd
      this.gameTime += deltaTime
      this.lastTimeUpd = currentTime
    },

    updatePlayerPosition() {
      const newPos = { ...this.player }
      
      if (this.keysPressed.ArrowUp) newPos.y -= this.player.speed
      if (this.keysPressed.ArrowDown) newPos.y += this.player.speed
      if (this.keysPressed.ArrowLeft) newPos.x -= this.player.speed
      if (this.keysPressed.ArrowRight) newPos.x += this.player.speed
      if (this.keysPressed.w) newPos.y -= this.player.speed
      if (this.keysPressed.s) newPos.y += this.player.speed
      if (this.keysPressed.a) newPos.x -= this.player.speed
      if (this.keysPressed.d) newPos.x += this.player.speed
      
      newPos.x = Math.max(20, Math.min(this.worldSize.width - 40, newPos.x))
      newPos.y = Math.max(20, Math.min(this.worldSize.height - 40, newPos.y))
      
      this.setPlayerPosition(newPos)
    },

    updateGame(currentTime) {
      this.updateBulletsPosition()
      this.updateEnemiesPosition()
      this.checkCollisions()
      this.spawnEnemyIfNeeded(currentTime)
      this.shoot(currentTime)
    },

    updateBulletsPosition() {
      const updatedBullets = this.bullets.map((bullet) => ({
        ...bullet,
        x: bullet.x + bullet.direction.x * 8,
        y: bullet.y + bullet.direction.y * 8,
        lifeTime: bullet.lifeTime - 16
      })).filter((bullet) =>
        bullet.lifeTime > 0 &&
        bullet.x >= 0 && bullet.x <= this.worldSize.width &&
        bullet.y >= 0 && bullet.y <= this.worldSize.height
      )
      
      this.updateBullets(updatedBullets)
    },

    updateEnemiesPosition() {
      const updatedEnemies = this.enemies.map((enemy) => {
        const direction = this.calculateDirection(
          enemy.x,
          enemy.y,
          this.player.x + 20,
          this.player.y + 20
        )
        return {
          ...enemy,
          x: enemy.x + direction.x * 2,
          y: enemy.y + direction.y * 2
        }
      })
      
      this.updateEnemies(updatedEnemies)
    },

    calculateDirection(fromX, fromY, toX, toY) {
      const dx = toX - fromX
      const dy = toY - fromY
      const length = Math.sqrt(dx * dx + dy * dy)
      return length > 0 ? { x: dx / length, y: dy / length } : { x: 0, y: 0 }
    },

    checkCollisions() {
      if (this.checkPlayerCollision()) {
        this.gameActive = false
        return
      }
      
      const result = this.checkBulletCollisions()
      if (result.hasChanges) {
        this.updateEnemies(result.enemies)
        this.updateBullets(result.bullets)

      }
    },

    checkPlayerCollision() {
      for (const enemy of this.enemies) {
        if (this.checkRectCollision(this.player.x, this.player.y, 40, 40, enemy.x - 15, enemy.y - 15, 30, 30)) {
          return true
        }
      }
      return false
    },

    checkBulletCollisions() {
      const enemies = [...this.enemies]
      const bullets = [...this.bullets]
      let hasChanges = false
      let killed = 0

      for (let i = enemies.length - 1; i >= 0; i--) {
        for (let j = bullets.length - 1; j >= 0; j--) {
          if (this.checkRectCollision(enemies[i].x - 15, enemies[i].y - 15, 30, 30,
          bullets[j].x - 4, bullets[j].y - 4, 8, 8)) {
            enemies.splice(i, 1)
            bullets.splice(j, 1)
            hasChanges = true
            killed++
            break
          }
        }
      }
      
      if (killed > 0) {
        this.enemiesKilled += killed
      }
      return { enemies, bullets, hasChanges }
    },

    checkRectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
      return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    },

    spawnEnemyIfNeeded(currentTime) {
      if (currentTime - this.lastEnemyAppear > this.enemySpawnCD) {
        const position = this.generateEnemyPosition()
        this.addEnemy({ x: position.x, y: position.y })
        this.lastEnemyAppear = currentTime
      }
    },

    generateEnemyPosition() {
      const side = Math.floor(Math.random() * 4)
      let x, y
      
      switch(side) {
        case 0:
          x = Math.random() * this.worldSize.width
          y = -30
          break;
        case 1:
          x = this.worldSize.width + 30
          y = Math.random() * this.worldSize.height
          break;
        case 2:
          x = Math.random() * this.worldSize.width
          y = this.worldSize.height + 30
          break;
        case 3:
          x = -30
          y = Math.random() * this.worldSize.height
          break;
      }
      return { x, y };
    },

    shoot(curTime) {
      if (curTime - this.lastShotTime > this.shotCD) {
        const direction = this.calculateDirection(
          this.player.x + 20,
          this.player.y + 20,
          this.mousePos.x,
          this.mousePos.y
        )
        
        this.addBullet({
          x: this.player.x + 20,
          y: this.player.y + 20,
          direction: direction,
          lifeTime: 2000
        })
        this.lastShotTime = curTime
      }
    }
  }
}
</script>

<style scoped lang="scss">
.game {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #2c3e50;

  &__hud {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
    color: #ecf0f1;
    background: rgba(52, 73, 94, 0.9);
    flex-direction: column;
  }

  &__world {
    position: relative;
    width: 100%;
    height: 100%;
  }

  &__player {
    position: absolute;
    width: 40px;
    height: 40px;
    background-color: red;
    transform: translate(-50%, -50%);
    will-change: left, top;
  }

  &__bullet {
    position: absolute;
    width: 8px;
    height: 8px;
    background: yellow;
    transform: translate(-50%, -50%);
    will-change: left, top;
  }

  &__enemy {
    position: absolute;
    width: 30px;
    height: 30px;
    background: grey;
    transform: translate(-50%, -50%);
    will-change: left, top;
  }

  &__game-over {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #34495e;
    text-align: center;
    z-index: 20;
  }

  &__game-over-title {
    color: #ecf0f1;
    margin-bottom: 1rem;
    font-size: 2rem;
  }

  &__game-over-time,
  &__game-over-killed {
    color: #ecf0f1;
    font-size: 1.2rem;
    margin: 0.5rem 0;
  }

  &__game-over-button {
    display: inline-flex;
    align-items: center;
    font-size: 1rem;
    background-color: #3498db;
    color: white;
    font-weight: 500;

    &:hover {
      background-color: #2980b9;
    }
  }
}
</style>