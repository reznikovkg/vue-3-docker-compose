<template>
  <div class="map">
    <div class="map__level-menu">
      <button class="map__level-toggle" @click="() => toggleLevels()">Уровни</button>
      <div  class="map__level-list" v-if="isOpenLevels">
        <button class="map__level-item" v-for="level in levelList" :key="level.id" 
          :class="{ 'map__level-item--active': level.id === getCurLevelMap }"
          @click.stop="() => selectLevel(level.id)">уровень {{ level.id }}
        </button> 
      </div>
    </div>
    <div class="map__points"> очки: {{ getPoints }} </div>
    <svg 
      v-if="getCurLevelData" 
      width="100%" 
      height="100%" 
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style="position: absolute; top: 0; left: 0;"
    >
      <polyline
        :points="svgPathPoints"
        fill="none"
        stroke="#f5e878"
        stroke-width="60"
        stroke-linejoin="round"
        stroke-linecap="round"
        vector-effect="non-scaling-stroke"
      ></polyline>
    </svg>
    <div>
      <AddTowerBtn v-for="slot in slotTower" :x="slot.x" :y="slot.y" 
        @click="() => plusClick(slot)">
      </AddTowerBtn>
      <Tower v-for="tower in getActiveTowers" :id="tower.id" :x="tower.x" :y="tower.y" :color="tower.color"
        :level="tower.levelId" :stats="tower" @upgrade="(id) => upgradeTower(id)" @delete="(id) => deleteTower(id)">
      </Tower>
      <Enemy v-for="enemy in getActiveEnemies" :x="enemy.x" :y="enemy.y" :color="enemy.color"></Enemy>
      <div class="map__bullets" v-for="bullet in getActiveBullets" :style="{left: bullet.x + '%',top: bullet.y + '%'}"></div>
    </div>
  </div>
</template>

<script lang="ts">
import AddTowerBtn from '../ui/AddTowerBtn.vue';
import Tower from '../ui/Tower.vue';
import Enemy from '../ui/Enemy.vue';
import {levels} from '../../data/levels'
import { mapGetters, mapActions } from 'vuex';
export default {
  name: 'GamePage',
  components: {
    AddTowerBtn,
    Tower,
    Enemy
  },
  data () {
    return {
      gameTimer: 0,
      isOpenLevels: false,
    }
  },
  computed: {
    ...mapGetters('game', [
      'getCurLevelMap',
      'getActiveTowers',
      'getCurLevelData',
      'getActiveEnemies',
      'getActiveBullets',
      'getPoints',
    ]),
    levelList () {
      return levels
    },
    pathPoints () {
      const level = this.getCurLevelData
      return level ? level.path : []
    },
    svgPathPoints () {
      return this.pathPoints.map((point: {x: number, y: number}) => `${point.x},${point.y}`).join(' ')
    },
    slotTower () {
      const level = this.getCurLevelData
      return level.slots.filter(slot => !this.getActiveTowers.some(t => t.id === slot.id)
      )
    }, 
  },
  mounted () {
    this.initLevel(1)
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
      'gameLoop'
    ]),
    toggleLevels () {
      this.isOpenLevels = !this.isOpenLevels
    },
    selectLevel (levelId) {
      this.initLevel(levelId)
      this.isOpenLevels = false
    },
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
  },
}
</script>

<style scoped lang="scss">
.map {
  background-color: rgb(50, 104, 22);
  width: 100vw;
  height: 100vh;
  position: relative;
  user-select: none;

  &__level-menu {
    position: absolute;
    top: 6%;
    left: 85%;
    z-index: 10;
    width: 150px;
  }

  &__level-toggle {
    width: 100%;
    background-color: rgb(106, 178, 237);
    color: rgb(51, 25, 4);
    font-size: 24px;
    border: 3px solid rgb(36, 74, 161);
    padding: 5px 18px;
    border-radius: 7%;
    cursor: pointer;
  }

  &__level-list {
    width: 100%;
    padding: 10px;
  }

  &__level-item {
    background-color: rgb(242, 241, 205);
    color: rgb(51, 25, 4);
    border: 3px solid rgb(36, 74, 161);
    border-radius: 10px;
    padding: 8px 12px;
    font-size: 18px;
    display: block;
    width: 100%;
    margin-bottom: 8px;
    cursor: pointer;

    &__level-item--active {
    background-color: rgb(106, 178, 237);
    }
  }

  &__points {
    position: absolute;
    top: 5%;
    left: 70%;
    color: rgb(240, 235, 103);
    border: none;
    font-size: 30px;
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
