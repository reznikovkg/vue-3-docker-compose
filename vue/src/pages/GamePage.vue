<template>
  <div class = "game-page">
    <div class = "game-page__header">
      <div class = "game-page__coins"> Coins: {{ coins }}</div>
      <div class = "game-page__controls">
        <button class = "game-page__btn" @click="() => addTestEnemy()">
          Add Enemy
        </button>
        <button class = "game-page__btn" @click="() => clearEnemies()">
          Clear Enemies
        </button>
      </div>
    </div>

    <div class = "game-page__game-area" @click="() => handleGameAreaClick($event)">
    <svg class = "game-page__route-svg" viewBox = "0 0 900 600">
      <path
        v-for = "route in level.routes"
        :key = "route.id"
        :d = "getRoutePath(route)"
        class = "game-page__route-path"
        fill = "none"
        stroke = "#e94560"
        stroke-width = "40"
        stroke-linecap = "round"
        stroke-linejoin = "round"
        opacity = "0.3"
      />
      <path
        v-for = "route in level.routes"
        :key = "'line-' + route.id"
        :d = "getRoutePath(route)"
        class = "game-page__route-line"
        fill = "none"
        stroke = "#e94560"
        stroke-width = "3"
        stroke-dasharray = "5,5"
        stroke-linecap = "round"
        stroke-linejoin = "round"
      />
    </svg>

      <div
        v-for = "position in towerPositions"
        :key = "position.id"
        class = "game-page__tower-slot"
        :style = "getSlotStyle(position)"
        @click.stop = "() => placeTower(position)"
      ></div>

      <Tower
        v-for = "tower in towers"
        :key = "tower.id"
        :tower = "tower"
        :is-selected = "selectedTower && selectedTower.id === tower.id"
        @select = "() => selectTower(tower)"
        @remove = "() => removeTower(tower.id)"
        @upgrade = "() => upgradeTower(tower.id)"
      />

      <Enemy
        v-for = "enemy in enemies"
        :key = "enemy.id"
        :enemy = "enemy"
        @move = "() => selectEnemy(enemy)"
      />
    </div>

    <div v-if = "selectedTower" class="game-page__tower-panel">
      <h3 class = "game-page__panel-title">Tower Stats</h3>
      <div class = "game-page__stat">Level: {{ selectedTower.level }}</div>
      <div class = "game-page__stat">Damage: {{ selectedTower.damage }}</div>
      <div class = "game-page__stat">Health: {{ selectedTower.health }}</div>
      <div class = "game-page__stat">Fire Rate: {{ selectedTower.fireRate }}ms</div>
      <div class = "game-page__stat">Range: {{ selectedTower.range }}px</div>
      <button
        class = "game-page__upgrade-btn"
        @click = "() => upgradeTower(selectedTower.id, 'damage')"
      >
        Upgrade Damage ({{ selectedTower.level * 30 }})
      </button>
      <button
        class = "game-page__upgrade-btn"
        @click = "() => upgradeTower(selectedTower.id, 'health')"
      >
        Upgrade Health ({{ selectedTower.level * 30 }})
      </button>
      <button
        class = "game-page__upgrade-btn"
        @click = "() => upgradeTower(selectedTower.id, 'fireRate')"
      >
        Upgrade Speed ({{ selectedTower.level * 30 }})
      </button>
      <button
        class = "game-page__upgrade-btn"
        @click = "() => upgradeTower(selectedTower.id, 'range')"
      >
        Upgrade Range ({{ selectedTower.level * 30 }})
      </button>
      <button class = "game-page__remove-btn" @click="() => removeTower(selectedTower.id)">
        Remove Tower (+25)
      </button>
    </div>

    <div class = "game-page__info">
      <p>Click on slots to place towers (50)</p>
      <p>Click on tower to select and upgrade</p>
      <p>Use arrow keys to move enemies</p>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Tower from '../ui/Tower.vue'
import Enemy from '../ui/Enemy.vue'

export default {
  name: 'GamePage',
  components: {
    Tower,
    Enemy,
  },
  data() {
    return {
      currentLevel: 1,
      enemyMoveInterval: null,
      towerShootInterval: null,
      selectedEnemy: null,
    }
  },
  computed: {
    ...mapGetters('game', [
      'getLevel',
      'getTowers',
      'getEnemies',
      'getSelectedTower',
      'getCoins',
      'getTowerPositions',
    ]),
    level() {
      return this.getLevel
    },
    towers() {
      return this.getTowers
    },
    enemies() {
      return this.getEnemies
    },
    selectedTower() {
      return this.getSelectedTower
    },
    coins() {
      return this.getCoins
    },
    towerPositions() {
      return this.getTowerPositions
    },
  },
  mounted() {
    this.loadLevel(this.currentLevel)
    document.addEventListener('keydown', this.handleKeyPress)
    this.towerShooting()
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeyPress)
    if (this.enemyMoveInterval) {
      clearInterval(this.enemyMoveInterval)
    }
    if (this.towerShootInterval) {
    clearInterval(this.towerShootInterval)
  }
  },
  methods: {
    ...mapActions('game', [
      'setLevel',
      'addTower',
      'removeTower',
      'upgradeTower',
      'addEnemy',
      'moveEnemy',
      'selectTower',
    ]),
    loadLevel(levelNum) {
      const levels = {
        1: {
          routes: [
            {
              id: 1,
              points: [
                { x: 0, y: 100 },
                { x: 200, y: 100 },
                { x: 200, y: 400 },
                { x: 600, y: 400 },
                { x: 600, y: 200 },
                { x: 900, y: 200 },
              ],
            },
          ],
          towerPositions: [
            { id: 1, x: 150, y: 150 },
            { id: 2, x: 250, y: 250 },
            { id: 3, x: 400, y: 150 },
            { id: 4, x: 400, y: 350 },
            { id: 5, x: 550, y: 250 },
            { id: 6, x: 650, y: 350 },
            { id: 7, x: 750, y: 150 },
            { id: 8, x: 850, y: 250 },
          ],
        },
        2: {
          routes: [
            {
              id: 1,
              points: [
                { x: 0, y: 50 },
                { x: 300, y: 50 },
                { x: 300, y: 300 },
                { x: 100, y: 300 },
                { x: 100, y: 500 },
                { x: 500, y: 500 },
                { x: 500, y: 250 },
                { x: 900, y: 250 },
              ],
            },
          ],
          towerPositions: [
            { id: 1, x: 100, y: 100 },
            { id: 2, x: 200, y: 150 },
            { id: 3, x: 350, y: 100 },
            { id: 4, x: 250, y: 350 },
            { id: 5, x: 150, y: 450 },
            { id: 6, x: 350, y: 450 },
            { id: 7, x: 550, y: 400 },
            { id: 8, x: 450, y: 200 },
            { id: 9, x: 650, y: 300 },
            { id: 10, x: 750, y: 200 },
          ],
        },
      }

      if (levels[levelNum]) {
        this.setLevel(levels[levelNum])
      }
    },
    getRoutePath(route) {
      if (!route.points || route.points.length < 2) {
        return ''
      }
      const path = route.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
      return path
    },
    getSlotStyle(position) {
      return {
        left: `${position.x - 20}px`,
        top: `${position.y - 20}px`,
      }
    },
    handleGameAreaClick(event) {
      if (event.target === event.currentTarget) {
        this.selectTower(null)
      }
    },
    placeTower(position) {
      const existingTower = this.towers.find(
        (t) => Math.abs(t.x - position.x) < 10 && Math.abs(t.y - position.y) < 10
      )
      if (existingTower) {
        return
      }
      this.addTower({ x: position.x, y: position.y, cost: 50 })
    },
    selectTower(tower) {
      this.selectTower(tower)
    },
    selectEnemy(enemy) {
      this.selectedEnemy = enemy
    },
    handleEnemyDrag(enemy, event) {
      this.selectedEnemy = enemy
      const gameArea = document.querySelector('.game-page__game-area')
      const rect = gameArea.getBoundingClientRect()
      
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      this.moveEnemy({ enemyId: enemy.id, x, y })
    },
    removeTower(towerId) {
      this.removeTower(towerId)
      if (this.selectedTower && this.selectedTower.id === towerId) {
        this.selectTower(null)
      }
    },
    upgradeTower(towerId, upgradeType) {
      this.upgradeTower({ towerId, upgradeType })
    },
    towerShooting() {
      if (!this.towerShootInterval) {
        this.towerShootInterval = setInterval(() => {
          this.towers.forEach((tower) => {
            const enemyInRange = this.enemies.find((enemy) => {
              const dx = enemy.x - tower.x
              const dy = enemy.y - tower.y
              const distance = Math.sqrt(dx * dx + dy * dy)
              return distance <= tower.range
            })

            if (enemyInRange) {
              enemyInRange.health -= tower.damage
              if (enemyInRange.health <= 0) {
                this.$store.commit('game/SET_ENEMIES', this.enemies.filter((e) => e.id !== enemyInRange.id))
                this.$store.commit('game/SET_GAME_COINS', this.coins + 10)
              }
            }
          })
        }, 1000)
      }
    },
    addTestEnemy() {
      const startX = this.level.routes[0]?.points[0]?.x || 0
      const startY = this.level.routes[0]?.points[0]?.y || 100
      this.addEnemy({ x: startX, y: startY, health: 50 + this.currentLevel * 10 })
    },
    clearEnemies() {
      this.$store.commit('game/SET_ENEMIES', [])
    }, 
    handleKeyPress(event) {
      if (!this.selectedEnemy) return

      const step = 10
      let newX = this.selectedEnemy.x
      let newY = this.selectedEnemy.y

      switch (event.key) {
        case 'ArrowUp':
          newY -= step
          break
        case 'ArrowDown':
          newY += step
          break
        case 'ArrowLeft':
          newX -= step
          break
        case 'ArrowRight':
          newX += step
          break
        default:
          return
      }

      this.moveEnemy({ enemyId: this.selectedEnemy.id, x: newX, y: newY })
    },
  },
}
</script>

<style scoped lang = "scss">
.game-page {
  width: 100%;
  min-height: 100vh;
  background: #1a1a2e;
  padding: 20px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px;
    background: #16213e;
    border-radius: 10px;
  }

  &__coins {
    font-size: 24px;
    font-weight: bold;
    color: #ffd700;
  }

  &__controls {
    display: flex;
    gap: 10px;
  }

  &__btn {
    padding: 10px 20px;
    background: #0f3460;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.3s;

    &:hover {
      background: #e94560;
    }
  }

  &__game-area {
    position: relative;
    width: 900px;
    height: 600px;
    background: #0f0f23;
    border-radius: 10px;
    overflow: hidden;
    margin: 0 auto;
  }

  &__route {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }
    &__route-path {
      filter: drop-shadow(0 0 5px rgba(233, 69, 96, 0.5));
    }

    &__route-line {
      opacity: 0.6;
    }
    
  

  &__tower-slot {
    position: absolute;
    width: 40px;
    height: 40px;
    background: rgba(15, 52, 96, 0.5);
    border: 2px dashed rgba(233, 69, 96, 0.5);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: rgba(233, 69, 96, 0.3);
      border-color: #e94560;
    }
  }

  &__tower-panel {
    position: fixed;
    right: 20px;
    top: 100px;
    width: 250px;
    padding: 20px;
    background: #16213e;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  }

  &__panel-title {
    color: #e94560;
    margin-bottom: 15px;
    font-size: 18px;
  }

  &__stat {
    color: white;
    margin-bottom: 8px;
    font-size: 14px;
  }

  &__upgrade-btn {
    width: 100%;
    padding: 8px;
    margin-bottom: 8px;
    background: #0f3460;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 12px;
    transition: background 0.3s;

    &:hover {
      background: #e94560;
    }
  }

  &__remove-btn {
    width: 100%;
    padding: 8px;
    margin-top: 10px;
    background: #e94560;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 12px;
    transition: background 0.3s;

    &:hover {
      background: #c73e54;
    }
  }

  &__info {
    margin-top: 20px;
    padding: 15px;
    background: #16213e;
    border-radius: 10px;
    color: #aaa;
    text-align: center;
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;

    p {
      margin: 5px 0;
    }
  }
}
</style>