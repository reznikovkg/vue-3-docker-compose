<template>
  <div class="game" @mousemove="onMouseMove">
    <div class="hud">
      <div>Время: {{ formattedTime }}</div>
      <div>Убито: {{ enemiesKilled }}</div>
    </div>

    <div class="world">
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

    <div v-if="!gameActive" class="game-over">
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
      player: { x: 200, y: 200, speed: 4 },
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

      animationFrame: null
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

    this.loop()
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.onKeyDown)
    window.removeEventListener("keyup", this.onKeyUp)

    cancelAnimationFrame(this.animationFrame)
  },

  methods: {

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

      this.player.x = Math.max(20, Math.min(window.innerWidth - 20, this.player.x))
      this.player.y = Math.max(20, Math.min(window.innerHeight - 20, this.player.y))
    },

    spawnEnemies(time) {
      if (time - this.lastSpawnTime > this.spawnCooldown) {
        const side = Math.floor(Math.random() * 4)

        let x, y

        if (side === 0) { x = Math.random() * window.innerWidth; y = -20 }
        if (side === 1) { x = window.innerWidth + 20; y = Math.random() * window.innerHeight }
        if (side === 2) { x = Math.random() * window.innerWidth; y = window.innerHeight + 20 }
        if (side === 3) { x = -20; y = Math.random() * window.innerHeight }

        this.enemies.push({ x, y })

        this.lastSpawnTime = time
      }
    },

    updateEnemies() {
      this.enemies = this.enemies.map(enemy => {
        const dx = this.player.x - enemy.x
        const dy = this.player.y - enemy.y
        const len = Math.sqrt(dx * dx + dy * dy)

        if (len === 0) {
          return { ...enemy }
        }

        return {
          x: enemy.x + (dx / len) * 1.5,
          y: enemy.y + (dy / len) * 1.5
        }
      })
    },

    shoot(time) {
      if (time - this.lastShotTime > this.shotCooldown) {
        const dx = this.mouse.x - this.player.x
        const dy = this.mouse.y - this.player.y
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

      const enemies = [...this.enemies]
      const bullets = [...this.bullets]

      for (let i = enemies.length - 1; i >= 0; i--) {
        for (let j = bullets.length - 1; j >= 0; j--) {
          if (
            Math.abs(enemies[i].x - bullets[j].x) < 10 &&
            Math.abs(enemies[i].y - bullets[j].y) < 10
          ) {
            enemies.splice(i, 1)
            bullets.splice(j, 1)
            this.enemiesKilled++
            break
          }
        }
      }

      this.enemies = enemies
      this.bullets = bullets
    },

    restartGame() {
      this.player.x = 200
      this.player.y = 200

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
  background: #2c3e50;

  .world {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .hud {
    position: absolute;
    top: 10px;
    right: 10px;
    color: white;
    z-index: 10;
  }

  &-over {
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