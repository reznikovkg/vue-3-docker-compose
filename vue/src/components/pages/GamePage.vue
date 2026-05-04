<template>
  <div class="map" @click="(event) => mapClick(event)">
    <div class="map__level-menu">
      <button class="map__level-toggle" @click.stop="() => toggleLevels()">Уровни</button>
      <div class="map__level-list" v-if="isOpenLevels">
        <button class="map__level-item" v-for="level in levelList" :key="level.id" 
          :class="{ 'map__level-item--active': level.id === getCurLevelMap }"
          @click.stop="() => selectLevel(level.id)">уровень {{ level.id }}
        </button> 
      </div>
    </div>
    <button class="map__shop-toggle" @click.stop="() => toggleShop()">Магазин</button>
    <div class="map__shop" v-if="isOpenShop" @click.stop> 
      <div class="map__shop-col">
        <div class="map__shop-title">Покупка</div>
        <button class="map__shop-btn" v-for="ally in allyCosts" :key="ally.id" @click.stop="() => buyAlly(ally)">
          боец {{ ally.typeId }} - {{ ally.cost }}
        </button>
        <button class="map__shop-btn" @click.stop="() => selectArtillery()">артиллерия - {{ artilleryCost }}</button>
      </div>
      <div class="map__shop-col">
        <div class="map__shop-title">Цены</div>
        <div class="map__shop-price">башня 1 ур. - {{ towerCosts[0].cost }}</div>
        <div class="map__shop-price" v-for="tower in towerCosts.slice(1)" :key="tower.level">
          улучшение до {{ tower.level }} ур. - {{ tower.cost }}
        </div>
        <div class="map__shop-price">заграждение - {{ barrierCost }}</div>
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
      <BuildBtn v-for="slot in slotTower" :key="slot.id" :x="slot.x" :y="slot.y" variant="tower"
        @click="() => plusClick(slot)">
      </BuildBtn>
      <Tower v-for="tower in getActiveTowers" :key="tower.id" :id="tower.id" :x="tower.x" :y="tower.y" :color="tower.color"
        :level="tower.levelId" :stats="tower" @upgrade="(id) => upgradeTower(id)" @delete="(id) => deleteTower(id)">
      </Tower>
      <Character v-for="enemy in getActiveEnemies" :key="enemy.id" :x="enemy.x" :y="enemy.y" :color="enemy.color" variant="enemy"></Character>
      <BuildBtn v-for="slot in slotBarrier" :key="slot.id" :x="slot.x" :y="slot.y" :angle="slot.angle"
        variant="barrier" @click="() => plusClickBarrier(slot)"> 
      </BuildBtn>
      <Barrier v-for="barrier in getActiveBarriers" :key="barrier.id" :id="barrier.id" :x="barrier.x" :y="barrier.y" 
        :angle="barrier.angle" :stats="barrier">
      </Barrier>
      <Character v-for="ally in getActiveAllies" :key="ally.id" :x="ally.x" :y="ally.y" :color="ally.color" variant="ally"></Character>
      <div class="map__bullets" v-for="bullet in getActiveBullets" :key="bullet.id" 
          :class="{ 'map__bullets--tower' :bullet.type === 'tower', 'map__bullets--ally' :bullet.type === 'ally', 
          'map__bullets--enemy' :bullet.type === 'enemy' }" :style="{ left: bullet.x + '%', top: bullet.y + '%' }">
      </div>
      <div class="map__artillery" v-for="effect in artilleryEffects" :key="effect.id"
        :style="{ left: effect.x + '%', top: effect.y + '%', width: effect.size + 'px', height: effect.size + 'px' }">
        <div class="map__artillery-center"></div>
        <div class="map__artillery-periphery"></div>
      </div>
    </div>
    <div class="map__result" v-if="getGameStatus !== 'playing'" @click.stop>
      <div class="map__result-card">
        <div class="map__result-title">
          {{ getGameStatus === 'loss' ? 'Поражение' : 'Победа' }}
        </div>
        <div class="map__result-buttons">
        <button class="map__result-btn" @click.stop="() => restartClick()">
          Повторить
        </button>
        <button class="map__result-btn"  v-if="getGameStatus === 'win' && getNextLevel" @click.stop="() => nextLevelClick()">
          Следующий уровень
        </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import BuildBtn from '../ui/BuildBtn.vue';
import Tower from '../ui/Tower.vue';
import Character from '../ui/Character.vue';
import Barrier from '../ui/Barrier.vue';
import {levels} from '../../data/levels'
import {allyTypes} from '../../data/allyTypes'
import {characteristics} from '../../data/characteristics'
import {barrier} from '../../data/barrier'
import {artillery} from '../../data/artillery'
import { mapGetters, mapActions } from 'vuex';
export default {
  name: 'GamePage',
  components: {
    BuildBtn,
    Tower,
    Character,
    Barrier,
  },
  data () {
    return {
      gameTimer: 0,
      isOpenLevels: false,
      isOpenShop: false,
      selectedTool: null,
      artilleryEffects: [] as { id: number, x: number, y: number, size: number }[],
    }
  },
  computed: {
    ...mapGetters('game', [
      'getCurLevelMap',
      'getActiveTowers',
      'getCurLevelData',
      'getActiveEnemies',
      'getActiveBullets',
      'getActiveBarriers',
      'getActiveAllies',
      'getPoints',
      'getGameStatus',
      'getNextLevel'
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
      return level.slots.filter(slot => !this.getActiveTowers.some(t => t.id === slot.id))
    }, 
    slotBarrier () {
      const level = this.getCurLevelData
      return level.barrierSlots.filter(slot => !this.getActiveBarriers.some(t => t.id === slot.id))
    }, 
    allyCosts() {
      const level = this.getCurLevelData
      return level.allies.map(ally => {
        const stats = allyTypes.find(type => type.id === ally.typeId)
        return {
          ...ally,
          cost: stats.cost,
        }
      })
    },
    towerCosts () {
      return characteristics.map(tower => ({
        level: tower.id,
        cost: tower.cost,
      }))
    },
    barrierCost () {
      return barrier[0].cost
    },
    artilleryCost () {
      return artillery[0].cost
    },
    artilleryRadius () {
      return artillery[0].radius
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
      'buildBarrier',
      'spawnAlly',
      'useArtillery',
      'upgradeTower',
      'deleteTower',
      'gameLoop',
      'restartLevel',
      'nextLevel',
    ]),
    restartClick () {
      this.selectedTool = null
      this.isOpenShop = false
      this.isOpenLevels = false
      this.restartLevel()
    },
    nextLevelClick () {
      this.selectedTool = null
      this.isOpenShop = false
      this.isOpenLevels = false
      this.nextLevel()
    },
    toggleLevels () {
      this.isOpenLevels = !this.isOpenLevels
    },
    selectLevel (levelId) {
      this.initLevel(levelId)
      this.isOpenLevels = false
      this.isOpenShop = false
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
    plusClickBarrier (slot) {
      this.buildBarrier({
        slotId: slot.id,
        angle: slot.angle,
      })
    },
    toggleShop () {
      this.isOpenShop = !this.isOpenShop
    },
    selectArtillery () {
      this.selectedTool = 'artillery'
      this.isOpenShop = false
    },
    buyAlly (ally) {
      this.spawnAlly({
        id: ally.id,
        typeId: ally.typeId,
      })
    },
    mapClick (event) {
      if (this.isOpenShop) {
        this.isOpenShop = false
      }
      if (this.isOpenLevels) {
        this.isOpenLevels = false
      }
      if (this.selectedTool === 'artillery') {
        const rect = event.currentTarget.getBoundingClientRect()
        const x = ((event.clientX - rect.left) / rect.width) * 100
        const y = ((event.clientY - rect.top) / rect.height) * 100
        this.useArtillery({ x, y }).then(isSuccess => {
          if (!isSuccess) {
            this.selectedTool = null
            return
          }
          const effectId = Math.random()
          const size = Math.min(rect.width, rect.height) * this.artilleryRadius / 50
          this.artilleryEffects.push({
            id: effectId,
            x,
            y,
            size
          })
          setTimeout(() => {
            this.artilleryEffects = this.artilleryEffects.filter(effect => effect.id !== effectId)
          }, 1000)
          this.selectedTool = null
        })
      }
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
    border-radius: 8px;
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

    &--active {
      background-color: rgb(106, 178, 237);
    }
  }

  &__shop-toggle {
    position: absolute;
    transform: translateX(-50%);
    top: 14%;
    left: 75%;
    z-index: 10;
    background-color: rgb(222, 175, 226);
    color: rgb(51, 25, 4);
    border: 3px solid rgb(141, 64, 182);
    padding: 3px 8px;
    font-size: 20px;
    border-radius: 8px;
    cursor: pointer;
  }

  &__shop {
    position: absolute;
    transform: translateX(-50%);
    top: 20%;
    left: 75%;
    z-index: 10;
    width: 350px;
    box-sizing: border-box;
    padding: 8px;
    background-color: rgb(242, 241, 205);
    border: 3px solid rgb(103, 83, 16);
    border-radius: 12px;
    white-space: nowrap;
  }

  &__shop-col {
    display: inline-block;
    vertical-align: top;
    width: 165px;
    margin-right: 8px;
  }

  &__shop-title {
    color: rgb(51, 25, 4);
    font-size: 15px;
    text-align: center;
    margin-bottom: 6px;
  }

  &__shop-btn {
    display: block;
    width: 80%;
    box-sizing: border-box;
    margin-bottom: 6px;
    padding: 3px 5px;
    background-color: rgb(169, 225, 215);
    color: rgb(51, 25, 4);
    border: 3px solid rgb(78, 153, 139);
    border-radius: 8px;
    font-size: 13px;
    margin: 0 auto 6px;
    cursor: pointer;
  }

  &__shop-price {
    color: rgb(51, 25, 4);
    font-size: 13px;
    margin-bottom: 8px;
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
    transform: translate(-50%, -50%);
    pointer-events: none;

    &--tower {
      width: 10px;
      height: 10px;
      background-color: black;
      border-radius: 50%;
    }

    &--ally {
      width: 8px;
      height: 8px;
      background-color: rgb(77, 75, 75);
      border-radius: 50%;
    }

    &--enemy {
      width: 8px;
      height: 8px;
      background-color: rgb(237, 218, 45);
      border-radius: 50%;
    }
  }

  &__artillery {
    position: absolute;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 20;
  }

  &__artillery-center {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 25px;
    height: 25px;
    transform: translate(-50%, -50%);
    background-color: rgb(255, 238, 43);
    border: 4px solid rgb(255, 20, 20);
    border-radius: 50%;
    animation: artillery-center 0.7s ease-out forwards;
  }

  &__artillery-periphery {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 100%;
    height: 100%;
    transform: translate(-50%, -50%) scale(0.2);
    background-color: rgb(239, 144, 72);
    border: 5px solid rgb(231, 97, 53);
    border-radius: 50%;
    animation: artillery-periphery 2s ease-out forwards;
  }

  @keyframes artillery-center {
    0% {
      opacity: 1;
      width: 35px;
      height: 35px;
    }
    100% {
      opacity: 0;
      width: 90px;
      height: 90px;
    }
  }

  @keyframes artillery-periphery {
    0% {
      opacity: 0.9;
      transform: translate(-50%, -50%) scale(0.2);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(1);
    }
  }
  
  &__result {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 15;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.381);
  }

  &__result-card {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    padding: 25px;
    box-sizing: border-box;
    background-color: rgb(235, 229, 210);
    border: 4px solid rgb(52, 103, 180);
    border-radius: 18px;
    text-align: center;
  }

  &__result-title {
    color: rgb(51, 25, 4);
    font-size: 36px;
    margin-bottom: 20px;
  }

  &__result-buttons {
    white-space: nowrap;
  }

  &__result-btn {
    display: inline-block;
    width: 200px;
    margin: 10px 8px 0;
    padding: 8px 14px;
    background-color: rgb(158, 180, 214);
    color: rgb(51, 25, 4);
    border: 3px solid rgb(52, 103, 180);
    border-radius: 10px;
    font-size: 18px;
    cursor: pointer;
  }
}
</style>
