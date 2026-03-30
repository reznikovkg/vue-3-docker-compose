<template>
  <div class="game" @mousemove="onMouseMove">
    
    <!-- HUD -->
    <div class="game__hud">
      <div class="game__hud-item">Время: {{ formattedTime }}</div>
      <div class="game__hud-item">Убито: {{ enemiesKilled }}</div>
      <div class="game__hud-item">HP: {{ player.hp }} / {{ player.maxHp }}</div>
      <div class="game__hud-item">Mana: {{ Math.floor(mana) }} / {{ maxMana }}</div>
      <div class="game__hud-item">Coins: {{ coins }}</div>

      <button class="game__pause-button" @click="togglePause">
        {{ isPaused ? "Продолжить" : "Пауза" }}
      </button>
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

      <BulletEntity
        v-for="(bullet, index) in enemyBullets"
        :key="'eb' + index"
        :x="bullet.x"
        :y="bullet.y"
      />

      <EnemyEntity
        v-for="(enemy, index) in enemies"
        :key="'e' + index"
        :x="enemy.x"
        :y="enemy.y"
        :type="enemy.type"
      />
    </div>

    <div v-if="isPaused && gameActive" class="game__pause">
      <h2>Пауза / Магазин</h2>

      <p>Coins: {{ coins }}</p>

      <button @click="buyHeal">Хилка (10)</button>
      <button @click="upgradeDamage">+ Урон (20)</button>
      <button @click="upgradeMaxHp">+ Max HP (30)</button>
      <button @click="upgradeMaxMana">+ Max Mana (30)</button>
      <button @click="buyMana">+ Mana (15)</button> 

      <hr />

      <button @click="togglePause">Продолжить</button>
    </div>

    <div v-if="!gameActive" class="game__game-over">
      <h2>Вы погибли.</h2>
      <p>Время: {{ formattedTime }}</p>
      <p>Убито: {{ enemiesKilled }}</p>
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
      player: {
        x: 500,
        y: 500,
        speed: 4,
        damage: 1,
        hp: 100,
        maxHp: 100
      },

      mouse: { x: 0, y: 0 },

      enemies: [],
      bullets: [],
      enemyBullets: [],

      keys: {},

      gameActive: true,
      isPaused: false,

      enemiesKilled: 0,
      coins: 0,

      mana: 0,
      maxMana: 100,
      manaRegenRate: 0.01,

      gameTime: 0,
      lastTime: 0,

      lastShotTime: 0,
      shotCooldown: 400,

      lastSpawnTime: 0,
      spawnCooldown: 1000,

      enemyShotCooldown: 1500,

      animationFrame: null,

      centerX: window.innerWidth / 2,
      centerY: window.innerHeight / 2,

      lastDamageTime: 0,
      damageCooldown: 500
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

    takeDamage(amount, time) {
      if (time - this.lastDamageTime < this.damageCooldown) return

      this.player.hp -= amount
      this.lastDamageTime = time

      if (this.player.hp <= 0) {
        this.player.hp = 0
        this.gameActive = false
      }
    },

    togglePause() {
      this.isPaused = !this.isPaused
    },

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

      if (e.key === "Escape") this.togglePause()
      if (e.key === "q") this.useAoe()
      if (e.key === "e") this.useUltimateShot()
    },

    onKeyUp(e) {
      this.keys[e.key] = false
    },

    loop() {
      const step = (time) => {
        if (this.gameActive && !this.isPaused) {
          this.updateTime(time)
          this.updatePlayer()
          this.updateEnemies(time)
          this.updateBullets()
          this.updateEnemyBullets()
          this.spawnEnemies(time)
          this.shoot(time)
          this.checkCollisions(time)
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

      this.mana = Math.min(this.maxMana, this.mana + this.manaRegenRate * delta)
    },

    updatePlayer() {
      if (this.keys["ArrowUp"] || this.keys["w"]) this.player.y -= this.player.speed
      if (this.keys["ArrowDown"] || this.keys["s"]) this.player.y += this.player.speed
      if (this.keys["ArrowLeft"] || this.keys["a"]) this.player.x -= this.player.speed
      if (this.keys["ArrowRight"] || this.keys["d"]) this.player.x += this.player.speed
    },

    spawnEnemies(time) {
      if (time - this.lastSpawnTime > this.spawnCooldown) {
        const x = this.player.x + (Math.random() - 0.5) * 2000
        const y = this.player.y + (Math.random() - 0.5) * 2000

        const type = Math.random() < 0.3 ? "shooter" : "melee"

        this.enemies.push({ x, y, health: 3, type, lastShot: 0 })

        this.lastSpawnTime = time
      }
    },

    updateEnemies(time) {
      this.enemies.forEach(enemy => {
        const dx = this.player.x - enemy.x
        const dy = this.player.y - enemy.y
        const len = Math.sqrt(dx * dx + dy * dy)

        const dir = { x: dx / len, y: dy / len }

        enemy.x += dir.x * 1.5
        enemy.y += dir.y * 1.5

        if (enemy.type === "shooter" && time - enemy.lastShot > this.enemyShotCooldown) {
          this.enemyBullets.push({
            x: enemy.x,
            y: enemy.y,
            dir,
            life: 2000
          })
          enemy.lastShot = time
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
          dir,
          damage: this.player.damage
        })

        this.lastShotTime = time
      }
    },

    updateBullets() {
      this.bullets = this.bullets.map(b => ({
        x: b.x + b.dir.x * 6,
        y: b.y + b.dir.y * 6,
        dir: b.dir,
        damage: b.damage
      }))
    },

    updateEnemyBullets() {
      const newBullets = []

      this.enemyBullets.forEach(b => {
        const newBullet = {
          x: b.x + b.dir.x * 4,
          y: b.y + b.dir.y * 4,
          dir: b.dir,
          life: b.life - 16
        }

        const hit =
          Math.abs(newBullet.x - this.player.x) < 15 &&
          Math.abs(newBullet.y - this.player.y) < 15

        if (hit) {
          this.takeDamage(20, performance.now())
          return
        }

        if (newBullet.life > 0) newBullets.push(newBullet)
      })

      this.enemyBullets = newBullets
    },

    checkCollisions(time) {
      this.enemies.forEach(enemy => {
        if (
          Math.abs(enemy.x - this.player.x) < 20 &&
          Math.abs(enemy.y - this.player.y) < 20
        ) {
          this.takeDamage(20, time)
        }
      })

      const bulletsToRemove = new Set()

      this.enemies = this.enemies.filter(enemy => {
        this.bullets.forEach((bullet, index) => {
          if (bulletsToRemove.has(index)) return

          const hit =
            Math.abs(enemy.x - bullet.x) < 10 &&
            Math.abs(enemy.y - bullet.y) < 10

          if (hit) {
            bulletsToRemove.add(index)
            enemy.health -= (bullet.damage || this.player.damage)
          }
        })

        if (enemy.health <= 0) {
          this.enemiesKilled++
          this.coins += 5
          return false
        }

        return true
      })

      this.bullets = this.bullets.filter((_, index) => !bulletsToRemove.has(index))
    },

    
    useAoe() {
      const cost = 30
      if (this.mana < cost) return

      this.mana -= cost

      this.enemies = this.enemies.filter(enemy => {
        const dx = enemy.x - this.player.x
        const dy = enemy.y - this.player.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 150) {
          this.enemiesKilled++
          this.coins += 5
          return false
        }

        return true
      })
    },

    useUltimateShot() {
      const cost = 50
      if (this.mana < cost) return

      this.mana -= cost

      const dx = this.mouse.x - this.centerX
      const dy = this.mouse.y - this.centerY
      const len = Math.sqrt(dx * dx + dy * dy)

      if (len === 0) return

      const dir = { x: dx / len, y: dy / len }

      this.bullets.push({
        x: this.player.x,
        y: this.player.y,
        dir,
        damage: 10
      })
    },

    

    buyHeal() {
      if (this.coins >= 10) {
        this.coins -= 10
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 50)
      }
    },

    upgradeDamage() {
      if (this.coins >= 20) {
        this.coins -= 20
        this.player.damage += 1
      }
    },

    upgradeMaxHp() {
      if (this.coins >= 30) {
        this.coins -= 30
        this.player.maxHp += 20
        this.player.hp += 20
      }
    },

    upgradeMaxMana() {
      if (this.coins >= 30) {
        this.coins -= 30
        this.maxMana += 20
      }
    },

    
    buyMana() {
      if (this.coins >= 15) {
        this.coins -= 15
        this.mana = Math.min(this.maxMana, this.mana + 50)
      }
    },

    restartGame() {
      location.reload()
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
    left: 50%;
    transform: translateX(-50%);

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;

    color: white;
    z-index: 10;
  }

  &__hud-item {
    font-size: 14px;
  }

  &__pause-button {
    padding: 5px 10px;
    background: #f1c40f;
    border: none;
    cursor: pointer;
  }

  &__pause {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #34495e;
    padding: 20px;
    color: white;
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