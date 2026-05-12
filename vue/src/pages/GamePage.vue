<template>
  <div class = "game-page">
    <div class = "game-page__header">
      <div class = "game-page__coins"> Монеты: {{ getCoins }}</div>
        <div class = "game-page__level-controls">
        <button 
            class = "game-page__btn" 
            :class = "{ 'game-page__btn--active': currentLevel === 1 }" 
            @click = "() => changeLevel(1)"
        >Уровень 1</button>
        <button 
          class = "game-page__btn" 
          :class = "{ 'game-page__btn--active': currentLevel === 2 }" 
          @click = "() => changeLevel(2)"
        >Уровень 2</button>
        </div>
    </div>

    

    <div ref = "gameArea" class = "game-page__game-area" @click="handleGameAreaClick">
    <svg class = "game-page__route-svg" viewBox = "0 0 900 600">
      <path
        v-for = "route in getLevel.routes"
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
        v-for = "route in getLevel.routes"
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
        v-for = "position in getTowerPositions"
        :key = "position.id"
        class = "game-page__tower-slot"
        :style = "getSlotStyle(position)"
        @click.stop = "() => placeTower(position)"
      ></div>

      <Tower
        v-for = "tower in getTowers"
        :key = "tower.id"
        :tower = "tower"
        :is-selected = "getSelectedTower && getSelectedTower.id === tower.id"
        @select = "() => selectTower(tower)"
        @remove = "() => removeTower(tower.id)"
      />

      <Enemy
        v-for = "enemy in getEnemies"
        :key = "enemy.id"
        :enemy = "enemy"
        @select = "() => selectEnemy(enemy)"
        @move = "(e) => handleEnemyDrag(enemy, e)"
      />
    </div>

    <div v-if = "getSelectedTower" class = "game-page__tower-panel">
      <h3 class = "game-page__panel-title">Характеристики башни</h3>
      <div class = "game-page__stat">Уровень: {{ getSelectedTower.level }}</div>
      <div class = "game-page__stat">Урон: {{ getSelectedTower.damage }}</div>
      <div class = "game-page__stat">Здоровье: {{ getSelectedTower.health }}</div>
      <div class = "game-page__stat">Скорость стрельбы: {{ getSelectedTower.fireRate }}ms</div>
      <div class = "game-page__stat">Дальность: {{ getSelectedTower.range }}px</div>
      <button
        class = "game-page__upgrade-btn"
        @click="() => upgradeTower({ towerId: getSelectedTower.id, upgradeType: 'damage' })"
      >
        Улучшить урон ({{ getSelectedTower.level * 30 }})
      </button>
      <button
        class = "game-page__upgrade-btn"
        @click="() => upgradeTower({ towerId: getSelectedTower.id, upgradeType: 'health' })"
      >
        Улучшить здоровье ({{ getSelectedTower.level * 30 }})
      </button>
      <button
        class = "game-page__upgrade-btn"
        @click = "() => upgradeTower({ towerId: getSelectedTower.id, upgradeType: 'fireRate' })"
      >
        Улучшить скорость ({{ getSelectedTower.level * 30 }})
      </button>
      <button
        class = "game-page__upgrade-btn"
        @click = "() => upgradeTower({ towerId: getSelectedTower.id, upgradeType: 'range' })"
      >
        Улучшить дальность ({{ getSelectedTower.level * 30 }})
      </button>
      <button class = "game-page__remove-btn" @click = "() => removeTower(getSelectedTower.id)">
        Убрать башню (+25)
      </button>
    </div>

    <div class = "game-page__info">
      <p>Нажмите на слоты для размещения башен (50)</p>
      <p>Нажмите на башню для выбора и улучшения</p>
      <p>Используйте стрелки для перемещения врагов</p>
    </div>

    <div v-if="isGameOver" class="game-over-overlay" @click.stop>
      <div class="game-over-content">
        <h2>Игра окончена!</h2>
        <p>Противник прорвался. Вы проиграли.</p>
        <button class="game-over-btn" @click.stop="restartGame"> Начать заново</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Tower from '../ui/Tower.vue'
import Enemy from '../ui/Enemy.vue'

const LEVELS = {
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

export default {
  name: 'GamePage',
  components: {
    Tower,
    Enemy,
  },
  data() {
    return {
      currentLevel: 1,
      selectedEnemy: null,
      animationFrameId: null,
      waveInterval: null,
      enemiesSpawned: 0,
      maxEnemiesPerWave: 5,
      towerShootInterval: null,
      enemyTypes: ['basic', 'tank', 'fast'],
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
      'isGameOver',
    ]),
  },
  mounted() {
    this.loadLevel(this.currentLevel)
    document.addEventListener('keydown', this.handleKeyPress)
    this.towerShooting()
    this.startEnemyMovement()
    this.startWaveSpawner()
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeyPress)
    if (this.towerShootInterval) {
      clearInterval(this.towerShootInterval)
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
    if (this.waveInterval) {
      clearInterval(this.waveInterval)
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
      'setEnemies',
      'addCoins',
      'setGameOver',
      'resetGame',
    ]),
    stopAllLoops() {
      if (this.towerShootInterval) { clearInterval(this.towerShootInterval); this.towerShootInterval = null; }
      if (this.waveInterval) { clearInterval(this.waveInterval); this.waveInterval = null; }
      if (this.animationFrameId) { cancelAnimationFrame(this.animationFrameId); this.animationFrameId = null; }
    },
    changeLevel(level) {
      if (this.currentLevel === level) return;
      this.stopAllLoops();
      this.setEnemies([]);
      this.getTowers.forEach(t => this.removeTower(t.id));
      this.selectTower(null);
      this.currentLevel = level;
      this.enemiesSpawned = 0;
      this.loadLevel(level);
      
      this.$nextTick(() => {
        this.towerShooting();
        this.startEnemyMovement();
        this.startWaveSpawner();
      });
    },

    loadLevel(levelNum) {
      if (LEVELS[levelNum]) {
        this.setLevel(LEVELS[levelNum])
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
      const existingTower = this.getTowers.find(
        (t) => Math.abs(t.x - position.x) < 10 && Math.abs(t.y - position.y) < 10
      )
      if (existingTower) {
        return
      }
      this.addTower({ x: position.x, y: position.y, cost: 50 })
    },

    selectEnemy(enemy) {
      this.selectedEnemy = enemy
    },
    handleEnemyDrag({enemy, event}) {
      this.selectedEnemy = enemy
      const gameArea = this.$refs.gameArea
      const rect = gameArea.getBoundingClientRect()
      
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      this.moveEnemy({ enemyId: enemy.id, x, y })
    },
    towerShooting() {
      this.towerShootInterval = setInterval(() => {
        if (this.isGameOver) {
          clearInterval(this.towerShootInterval);
          this.towerShootInterval = null;
          return;
        }
        
        let coinsEarned = 0;
        const updatedEnemies = this.getEnemies.map(enemy => {
          let currentHealth = enemy.health;
          this.getTowers.forEach(tower => {
            const dx = enemy.x - tower.x;
            const dy = enemy.y - tower.y;
            if (Math.sqrt(dx * dx + dy * dy) <= tower.range) {
              currentHealth -= tower.damage;
            }
          });

          if (currentHealth <= 0) {
            coinsEarned += enemy.reward || 10;
            return null;
          }
          return { ...enemy, health: currentHealth };
        }).filter(Boolean);

        this.setEnemies(updatedEnemies);
        if (coinsEarned > 0) this.addCoins(coinsEarned);
      }, 1000);
    },

    startWaveSpawner() {
      this.enemiesSpawned = 0
      const spawnInterval = this.currentLevel === 1 ? 10000 : 800
      this.waveInterval = setInterval(() => {
        if (this.isGameOver) {
          clearInterval(this.waveInterval)
          return
        }

        if (this.enemiesSpawned < this.maxEnemiesPerWave) {
          const type = this.enemyTypes[Math.floor(Math.random() * this.enemyTypes.length)];
          this.addTestEnemy(type)
          this.enemiesSpawned++
        } else {
          if (this.enemiesSpawned >= this.maxEnemiesPerWave) {
             clearInterval(this.waveInterval);
          }
        }
      }, spawnInterval)
    },

    restartGame() {
      this.stopAllLoops();
      this.resetGame();
      this.currentLevel = 1;
      this.enemiesSpawned = 0;
      this.selectedEnemy = null;
      this.selectTower(null);
      this.loadLevel(1);

      this.$nextTick(() => {
        this.towerShooting();
        this.startEnemyMovement();
        this.startWaveSpawner();
      });
    },

    addTestEnemy(type = 'basic') {
      const route = this.getLevel.routes[0]
      if (!route || !route.points || route.points.length === 0) return
      
      const startPoint = route.points[0]
      
      this.addEnemy({ 
        x: startPoint.x, 
        y: startPoint.y, 
        type: type || 'basic',
        routeId: route.id,
        currentPointIndex: 0,
      })
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

    startEnemyMovement() {
      const move = () => {
        if (this.isGameOver) {
          this.stopAllLoops();
          return;
        }

        if (this.getEnemies.length === 0) {
          this.animationFrameId = requestAnimationFrame(move);
          return;
        }

        let reachedEnd = false;
        const updatedEnemies = this.getEnemies.map(enemy => {
          if (!enemy.routeId) return enemy;
          
          const route = this.getLevel.routes.find(r => r.id === enemy.routeId);
          if (!route || !route.points || route.points.length === 0) return enemy;

          const nextIndex = enemy.currentPointIndex + 1;
          const nextPoint = route.points[nextIndex];

          if (!nextPoint) {
            reachedEnd = true;
            return null;
          }
          
          const dx = nextPoint.x - enemy.x;
          const dy = nextPoint.y - enemy.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const speed = enemy.speed || 1.5;

          let newX, newY, newIndex;
          if (dist <= speed) {
            newX = nextPoint.x;
            newY = nextPoint.y;
            newIndex = nextIndex;
          } else {
            newX = enemy.x + (dx / dist) * speed;
            newY = enemy.y + (dy / dist) * speed;
            newIndex = enemy.currentPointIndex;
          }
          return { ...enemy, x: newX, y: newY, currentPointIndex: newIndex };
        }).filter(Boolean);

        this.setEnemies(updatedEnemies);

        if (reachedEnd) {
          this.stopAllLoops();
          this.setGameOver();
          return;
        }

        this.animationFrameId = requestAnimationFrame(move);
      };
      
      this.animationFrameId = requestAnimationFrame(move);
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
    flex-wrap: wrap;
    gap: 10px;
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

   &__level-controls {
    display: flex;
    gap: 8px;
    margin-left: 15px;
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

    &--active {
      background: #e94560 !important;
      font-weight: bold;
      box-shadow: 0 0 8px rgba(233, 69, 96, 0.6);
    }

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

  &__route-svg {
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

  .game-over-overlay {
  position: fixed !important;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.85) !important;
  display: flex !important;
  justify-content: center;
  align-items: center;
  z-index: 99999 !important;
  backdrop-filter: blur(5px);
}

.game-over-content {
  background: #16213e;
  padding: 40px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 0 30px rgba(233, 69, 96, 0.6);
  border: 2px solid #e94560;

  h2 { color: #e94560; font-size: 32px; margin: 0 0 10px; }
  p { color: #ccc; font-size: 18px; margin: 0 0 25px; }
}

.game-over-btn {
  padding: 12px 35px;
  background: #e94560;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;

  &:hover {
    background: #c73e54;
    transform: scale(1.05);
  }
}
}
</style>