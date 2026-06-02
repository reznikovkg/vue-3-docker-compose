<template>
  <div class = "map" @mousemove = "(event) => drag(event)" @mouseup = "() => stopDrag()" @mouseleave = "() => stopDrag()">
    <div class = "map__levels">
      <button 
        class = "map__levels-btn" 
        v-for = "lvl in 3" 
        :key = "lvl" 
        @click = "() => selectLevel(lvl)"
        :class = "{ 'map__levels-btn--active': getCurLevelMap === lvl }"
      >
        Level {{ lvl }}
      </button>
    </div>
    <div class = "map__stats" v-if = "!getIsGameOver">
      <div class = "map__stats-item">Money: {{ getMoney }}</div>
      <div class = "map__stats-item">Points: {{ getPoints }}</div>
    </div>
    <div class = "map__game-over" v-if = "getIsGameOver">
      <div class = "map__game-over-text">GAME OVER</div>
      <button class = "map__game-over-btn" @click = "() => restartGame()">Restart</button>
    </div>
    <svg 
      v-if = "getCurLevelData" 
      width = "100%" 
      height = "100%" 
      viewBox = "0 0 100 100"
      preserveAspectRatio = "none"
      style = "position: absolute; top: 0; left: 0;"
    >
      <polyline
        :points = "svgPathPoints"
        fill = "none"
        stroke = "#f5e878"
        stroke-width = "13"
        stroke-linejoin = "round"
        stroke-linecap = "round"
      ></polyline>
    </svg>
    <div v-if = "getCurLevelData">
      <addButton v-for = "slot in slotTower" :key = "slot.id" :x = "slot.x" :y = "slot.y" 
        @click = "() => plusClick(slot)">
      </addButton>
      <tower v-for = "tower in getActiveTowers" :key = "tower.id" :id = "tower.id" :x = "tower.x" :y = "tower.y" 
        :level = "tower.levelId" :stats = "tower" @upgrade = "(id) => upgradeTower(id)" @delete = "(id) => deleteTower(id)">
      </tower>
      <enemy v-for = "enemy in getActiveEnemies" :key = "enemy.id" :x = "enemy.x" :y = "enemy.y" @mousedown = "() => startDrag(enemy.id)"></enemy>
      <div class = "map__bullets" v-for = "bullet in getActiveBullets" :key = "bullet.id" :style = "{left: bullet.x + '%',top: bullet.y + '%'}"></div>
    </div>
  </div>
</template>

<script lang = "ts">
import addButton from '../ui/addButton.vue';
import tower from '../ui/tower.vue';
import enemy from '../ui/enemy.vue';
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'GamePage',
  components: {
    addButton,
    tower,
    enemy
  },
  data () {
    return {
      gameTimer: 0,
      isDragging: false,
      draggingEnemyId: null,
    }
  },
  computed: {
    ...mapGetters('game', [
      'getCurLevelMap',
      'getActiveTowers',
      'getCurLevelData',
      'getActiveEnemies',
      'getActiveBullets',
      'getIsGameOver',
      'getMoney',
      'getPoints'
    ]),
    pathPoints () {
      const level = this.getCurLevelData
      return level ? level.path : []
    },
    svgPathPoints () {
      return this.pathPoints.map((point: {x: number, y: number}) => `${point.x},${point.y}`).join(' ')
    },
    slotTower () {
      const level = this.getCurLevelData
      if (!level) return []
      return level.slots.filter(slot => !this.getActiveTowers.some(t => t.id === slot.id))
    }, 
  },
  mounted () {
    this.initLevel(1)
    this.spawnEnemies(1)
    this.run()
  },
  beforeUnmount() {
    if (this.gameTimer) {
      clearTimeout(this.gameTimer)
    }
  },
  methods: {
    ...mapActions('game', [
      'initLevel', 
      'buildTower',
      'upgradeTower',
      'deleteTower',
      'moveEnemy',
      'gameLoop',
      'clearGameState',
      'spawnEnemies',
      'restartGame'
    ]),
    run () {
      this.gameLoop()
      this.gameTimer = setTimeout(() => {
        this.run()
      }, 30)
    },
    plusClick (slot) {
      this.buildTower({
        slotId: slot.id,
        levelId: 1,
      })
    },
    startDrag (enemyId) {
      this.isDragging = true
      this.draggingEnemyId = enemyId
    },
    drag (event) {
      if (this.isDragging) {
        const pos = this.$el.getBoundingClientRect()
        const percentX = ((event.clientX - pos.left) / pos.width) * 100
        const percentY = ((event.clientY - pos.top) / pos.height) * 100
        this.moveEnemy({
          id: this.draggingEnemyId,
          x: percentX,
          y: percentY
        })
      }
    },
    stopDrag () {
      this.isDragging = false
      this.draggingEnemyId = null
    },
    selectLevel (levelId) {
      this.initLevel(levelId)
      this.clearGameState()
      this.spawnEnemies(levelId)
    },
    restartGame () {
      this.clearGameState()
      this.spawnEnemies(this.getCurLevelMap)
    }
  },
}
</script>

<style scoped lang = "scss">
.map {
  background-color: rgb(111, 186, 196);
  width: 100vw;
  height: 100vh;
  position: relative;
  user-select: none;

  &__levels {
    position: absolute;
    top: 15px;
    left: 15px;
    z-index: 10;
    display: flex;
    gap: 10px;

    &-btn {
      padding: 6px 12px;
      border: 2px solid #333;
      background: #fff;
      cursor: pointer;
      font-weight: bold;
      border-radius: 4px;

      &--active {
        background: #4caf50;
        color: white;
        border-color: #2e7d32;
      }
    }
  }

  &__stats {
    position: absolute;
    top: 15px;
    right: 15px;
    z-index: 10;
    display: flex;
    gap: 20px;
    
    &-item {
      background: #f4f4f4;
      color: #000;
      padding: 8px 16px;
      border: 2px solid #333;
      border-radius: 4px;
      font-weight: bold;
      font-size: 16px;
    }
  }

  &__game-over {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 100;
    
    &-text {
      font-size: 72px;
      color: #f00;
      font-weight: bold;
      margin-bottom: 30px;
    }
    
    &-btn {
      padding: 15px 40px;
      font-size: 24px;
      background: #4caf50;
      color: #fff;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      
      &:hover {
        background: #45a049;
      }
    }
  }

  &__bullets {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: black;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
}
</style>