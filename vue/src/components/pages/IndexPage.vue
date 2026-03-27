<template>
  <div class="game" @mousemove="onMouseMove">
    
    <div class="game__hud">
      <div>Время: {{ formattedTime }}</div>
      <div>Убито: {{ enemiesKilled }}</div>
    </div>

    <div
      class="game__world"
      :style="{
        transform: `translate(${centerX - player.x}px, ${centerY - player.y}px)`
      }"
    >
      <PlayerEntity :x="player.x" :y="player.y" />

      <BulletEntity
        v-for="(bullet, index) in bullets"
        :key="'b' + index"
        :x="bullet.x"
        :y="bullet.y"
      />

      <EnemyEntity
        v-for="(enemy, index) in enemies"
        :key="'e' + index"
        :x="enemy.x"
        :y="enemy.y"
      />
    </div>

    <div v-if="!gameActive" class="game__game-over">
      <h2>Вы погибли.</h2>
      <p>Время в живых: {{ formattedTime }}</p>
      <p>Убито врагов: {{ enemiesKilled }}</p>
      <button @click="restartGame">Играть снова</button>
    </div>

  </div>
</template>

<script>
import PlayerEntity from "../game/PlayerEntity.vue"
import EnemyEntity from "../game/EnemyEntity.vue"
import BulletEntity from "../game/BulletEntity.vue"

export default {
  name: "IndexPage",

  components: {
    PlayerEntity,
    EnemyEntity,
    BulletEntity
  },

  data() {
    return {
      player: { x: 500, y: 500, speed: 4 },
      mouse: { x: 0, y: 0 },

      enemies: [],
      bullets: [],

      keys: {},

      gameActive: true,
      enemiesKilled: 0,

      gameTime: 0,
      lastTime: 0,

      lastShotTime: 0,
      shotCooldown: 400,

      lastSpawnTime: 0,
      spawnCooldown: 1000,

      animationFrame: null,

      centerX: window.innerWidth / 2,
      centerY: window.innerHeight / 2
    }
  },

  computed: {
    formattedTime() {
      const totalSeconds = Math.floor(this.gameTime / 1000)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60

      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    }
  },

  mounted() {
    window.addEventListener("keydown", this.onKeyDown)
    window.addEventListener("keyup", this.onKeyUp)
    window.addEventListener("resize", this.onResize)

    this.loop()
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.onKeyDown)
    window.removeEventListener("keyup", this.onKeyUp)
    window.removeEventListener("resize", this.onResize)

    cancelAnimationFrame(this.animationFrame)
  },

  methods: {

    onResize() {
      this.centerX = window.innerWidth / 2
      this.centerY = window.innerHeight / 2
    },

    onMouseMove(e) {
      const rect = e.currentTarget.getBoundingClientRect()
      this.mouse.x = e.clientX - rect.left
      this.mouse.y = e.clientY - rect.top
    },

    onKeyDown(e) {
      this.keys[e.key] = true
    },

    onKeyUp(e) {
      this.keys[e.key] = false
    },

    loop() {
      const step = (time) => {
        if (this.gameActive) {
          this.updateTime(time)
          this.updatePlayer()
          this.updateEnemies()
          this.updateBullets()
          this.spawnEnemies(time)
          this.shoot(time)
          this.checkCollisions()
        }

        this.animationFrame = requestAnimationFrame(step)
      }

      this.animationFrame = requestAnimationFrame(step)
    },

    updateTime(time) {
      if (!this.lastTime) {
        this.lastTime = time
        return
      }

      const delta = time - this.lastTime
      this.gameTime += delta
      this.lastTime = time
    },

    updatePlayer() {
      if (this.keys["ArrowUp"] || this.keys["w"]) this.player.y -= this.player.speed
      if (this.keys["ArrowDown"] || this.keys["s"]) this.player.y += this.player.speed
      if (this.keys["ArrowLeft"] || this.keys["a"]) this.player.x -= this.player.speed
      if (this.keys["ArrowRight"] || this.keys["d"]) this.player.x += this.player.speed
    },

    spawnEnemies(time) {
      if (time - this.lastSpawnTime > this.spawnCooldown) {
        const side = Math.floor(Math.random() * 4)

        let x, y
        const offset = 300

        if (side === 0) { x = this.player.x + (Math.random() - 0.5) * 1000; y = this.player.y - offset }
        if (side === 1) { x = this.player.x + offset; y = this.player.y + (Math.random() - 0.5) * 1000 }
        if (side === 2) { x = this.player.x + (Math.random() - 0.5) * 1000; y = this.player.y + offset }
        if (side === 3) { x = this.player.x - offset; y = this.player.y + (Math.random() - 0.5) * 1000 }

        this.enemies.push({ x, y })
        this.lastSpawnTime = time
      }
    },

    updateEnemies() {
      this.enemies = this.enemies.map(enemy => {
        const dx = this.player.x - enemy.x
        const dy = this.player.y - enemy.y
        const len = Math.sqrt(dx * dx + dy * dy)

        if (len === 0) return enemy

        return {
          x: enemy.x + (dx / len) * 1.5,
          y: enemy.y + (dy / len) * 1.5
        }
      })
    },

    shoot(time) {
      if (time - this.lastShotTime > this.shotCooldown) {
        const dx = this.mouse.x - this.centerX
        const dy = this.mouse.y - this.centerY
        const len = Math.sqrt(dx * dx + dy * dy)

        if (len === 0) return

        const dir = { x: dx / len, y: dy / len }

        this.bullets.push({
          x: this.player.x,
          y: this.player.y,
          dir
        })

        this.lastShotTime = time
      }
    },

    updateBullets() {
      this.bullets = this.bullets.map(b => ({
        x: b.x + b.dir.x * 6,
        y: b.y + b.dir.y * 6,
        dir: b.dir
      }))
    },

    checkCollisions() {
      this.enemies.forEach(enemy => {
        if (
          Math.abs(enemy.x - this.player.x) < 20 &&
          Math.abs(enemy.y - this.player.y) < 20
        ) {
          this.gameActive = false
        }
      })

      const bulletsToRemove = new Set()

      this.enemies = this.enemies.filter(enemy => {
        const hitIndex = this.bullets.findIndex((bullet, index) => {
          if (bulletsToRemove.has(index)) return false

          return (
            Math.abs(enemy.x - bullet.x) < 10 &&
            Math.abs(enemy.y - bullet.y) < 10
          )
        })

        if (hitIndex !== -1) {
          bulletsToRemove.add(hitIndex)
          this.enemiesKilled++
          return false
        }

        return true
      })

      this.bullets = this.bullets.filter((_, index) => !bulletsToRemove.has(index))
    },

    restartGame() {
      this.player.x = 500
      this.player.y = 500

      this.enemies = []
      this.bullets = []

      this.enemiesKilled = 0
      this.gameTime = 0
      this.lastTime = 0

      this.gameActive = true
    }
  }
}
</script>

<style lang="scss" scoped>
.game {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #2c3e50;

  &__world {
    position: absolute;
    width: 100%;
    height: 100%;
    will-change: transform;
  }

  &__hud {
    position: absolute;
    top: 10px;
    right: 10px;
    color: white;
    z-index: 10;
  }

  &__game-over {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #34495e;
    padding: 20px;
    color: white;
    text-align: center;
  }
}
</style>