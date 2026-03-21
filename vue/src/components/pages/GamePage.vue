<template>
  <div class="game">
    <div
      v-if="gameOver"
      class="game__overlay"
    >
      <div class="game__game-over">
        <div class="game__game-over-title">
          Игра окончена!
        </div>
        <div class="game__game-over-message">
          Враг достиг цели
        </div>
        <button
          class="game__restart-button"
          @click="() => loadLevel(currentLevelId)"
        >
          Начать заново
        </button>
      </div>
    </div>

    <div
      v-if="victory"
      class="game__overlay"
    >
      <div class="game__victory">
        <div class="game__victory-title">
          Победа!
        </div>
        <div class="game__victory-message">
          Все враги уничтожены
        </div>
        <button
          v-if="currentLevelId < levels.length"
          class="game__next-level-button"
          @click="() => loadLevel(currentLevelId + 1)"
        >
          Следующий уровень
        </button>
        <button
          class="game__restart-button"
          @click="() => loadLevel(currentLevelId)"
        >
          Начать заново
        </button>
      </div>
    </div>

    <div class="game__header">
      <LevelButtons
        :levels="levels"
        :current-id="currentLevelId"
        class="game__level-buttons"
        @select="(id) => loadLevel(id)"
      />

      <div class="game__economy">
        <div class="game__points">
          Очки: {{ points }}
        </div>
        <div class="game__kills">
          Убито: {{ totalKills }} / {{ maxEnemies }}
        </div>
        <div class="game__build-controls">
          <button
            class="game__build-button"
            :class="{
              'game__build-button--active': placeMode === 'barricade'
            }"
            @click="() => setPlaceMode('barricade')"
          >
            Заграждение ({{ BARRICADE_COST }})
          </button>
          <button
            class="game__build-button"
            :class="{
              'game__build-button--active': placeMode === 'artillery'
            }"
            @click="() => setPlaceMode('artillery')"
          >
            Артиллерия ({{ ARTILLERY_COST }})
          </button>
          <button
            class="game__spawn-ally"
            :disabled="points < ALLY_COST"
            @click="() => spawnAlly()"
          >
            Союзник ({{ ALLY_COST }})
          </button>
        </div>
      </div>
    </div>

    <div class="game__layout">
      <div
        ref="gameArea"
        class="game__area"
        @click="(e) => handleClick(e)"
      >
        <Path
          class="game__path"
          :path-points="pathPoints"
        />

        <Tower
          v-for="position in towerPositions"
          :key="position.id"
          :x="position.x"
          :y="position.y"
          :level="getTowerAtPosition(position.id)?.level || 1"
          :radius="getTowerAtPosition(position.id)?.radius || 80"
          :selected="selectedTowerId === position.id"
          :has-tower="!!getTowerAtPosition(position.id)"
          :health="getTowerAtPosition(position.id)?.health || 100"
          :max-health="getTowerAtPosition(position.id)?.maxHealth || 100"
          :is-hit="getTowerAtPosition(position.id)?.isHit || false"
          class="game__tower"
          @click="() => selectTowerPosition(position.id)"
        />

        <Barricade
          v-for="barricade in barricades"
          :key="barricade.id"
          :x="barricade.x"
          :y="barricade.y"
          :health="barricade.health"
          :max-health="barricade.maxHealth"
          class="game__barricade"
        />

        <ArtilleryStrike
          v-for="strike in artilleryStrikes"
          :key="strike.id"
          :x="strike.x"
          :y="strike.y"
          :max-radius="strike.maxRadius"
          :elapsed="strike.elapsed"
          :duration="strike.duration"
          class="game__artillery"
        />

        <Shot
          v-for="shot in allShots"
          :key="shot.id"
          :x1="shot.x1"
          :y1="shot.y1"
          :length="shot.length"
          :angle="shot.angle"
          :variant="shot.type"
          class="game__shot"
        />

        <Enemy
          v-for="enemy in enemies"
          :key="enemy.id"
          :x="enemy.x"
          :y="enemy.y"
          :health="enemy.health"
          :max-health="enemy.maxHealth"
          :color="enemy.color"
          class="game__enemy"
        />

        <ShooterEnemy
          v-for="enemy in shooterEnemies"
          :key="enemy.id"
          :x="enemy.x"
          :y="enemy.y"
          :health="enemy.health"
          :max-health="enemy.maxHealth"
          :color="enemy.color"
          :shoot-range="enemy.shootRange || 90"
          :is-shooting="enemy.isShooting"
          class="game__shooter-enemy"
        />

        <Ally
          v-for="ally in allies"
          :key="ally.id"
          :x="ally.x"
          :y="ally.y"
          :health="ally.health"
          :max-health="ally.maxHealth"
          :color="ally.color"
          :attack-range="ally.attackRange || 80"
          :is-attacking="ally.isAttacking"
          class="game__ally"
        />
      </div>

      <InfoPanel
        :selected-tower="selectedTower"
        :points="points"
        :tower-cost="TOWER_COST"
        :upgrade-cost="upgradeCost"
        class="game__info-panel"
        @upgrade-tower="() => upgradeTower()"
      />
    </div>

    <div
      v-if="showInsufficientFunds"
      class="game__notification game__notification--error"
    >
      Недостаточно очков!
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import LevelButtons from '@/components/ui/LevelButtons.vue'
import InfoPanel from '@/components/ui/InfoPanel.vue'
import Path from '@/components/game/Path.vue'
import Tower from '@/components/game/Tower.vue'
import Enemy from '@/components/game/Enemy.vue'
import ShooterEnemy from '@/components/game/ShooterEnemy.vue'
import Ally from '@/components/game/Ally.vue'
import Barricade from '@/components/game/Barricade.vue'
import ArtilleryStrike from '@/components/game/ArtilleryStrike.vue'
import Shot from '@/components/game/Shot.vue'
import { COSTS } from '@/store/game/constants'

export default {
  name: 'Game',
  components: {
    LevelButtons,
    InfoPanel,
    Path,
    Tower,
    Enemy,
    Shot,
    ShooterEnemy,
    Ally,
    Barricade,
    ArtilleryStrike
  },
  data() {
    return {
      lastFrameTime: 0,
      animationFrameId: null
    }
  },
  computed: {
    ...mapGetters('game', [
      'selectedTower',
      'upgradeCost',
      'pathPoints',
      'levels',
      'currentLevelId',
      'maxEnemies',
      'towerPositions',
      'towers',
      'enemies',
      'allies',
      'barricades',
      'artilleryStrikes',
      'allShots',
      'points',
      'totalKills',
      'selectedTowerId',
      'gameOver',
      'victory',
      'placeMode',
      'showInsufficientFunds',
      'shooterEnemies'
    ]),
    TOWER_COST: () => COSTS.TOWER,
    ALLY_COST: () => COSTS.ALLY,
    BARRICADE_COST: () => COSTS.BARRICADE,
    ARTILLERY_COST: () => COSTS.ARTILLERY
  },
  mounted() {
    this.initGame()
    this.startGameLoop()
  },
  beforeUnmount() {
    this.stopGameLoop()
  },
  methods: {
    ...mapActions('game', [
      'initGame',
      'loadLevel',
      'spawnAlly',
      'selectTowerPosition',
      'upgradeTower',
      'updateGame',
      'handleGameClick',
      'setPlaceMode'
    ]),
    getTowerAtPosition(positionId) {
      return this.towers.find(t => t.positionId === positionId) || null
    },
    handleClick(event) {
      const rect = this.$refs.gameArea.getBoundingClientRect()
      this.handleGameClick({ event, rect })
    },
    startGameLoop() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId)
      }
      this.lastFrameTime = performance.now()
      this.gameLoop()
    },
    gameLoop() {
      const now = performance.now()
      const deltaTime = now - this.lastFrameTime
      
      if (deltaTime > 5 && deltaTime < 200) {
        this.updateGame(deltaTime)
        this.lastFrameTime = now
      } else if (deltaTime >= 200) {
        this.lastFrameTime = now
      }
      
      this.animationFrameId = requestAnimationFrame(() => this.gameLoop())
    },
    stopGameLoop() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId)
        this.animationFrameId = null
      }
    }
  }
}
</script>

<style scoped lang="scss">
.game {
  padding: 20px;
  font-family: Arial, sans-serif;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  &__economy {
    display: flex;
    gap: 20px;
    background: #f5f5f5;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 18px;
    font-weight: bold;
  }

  &__points {
    color: #f57c00;
  }

  &__kills {
    color: #4caf50;
  }

  &__area {
    position: relative;
    width: 800px;
    height: 600px;
    border: 2px solid #333;
    background: #2d5a27;
    overflow: hidden;
    cursor: crosshair;
  }

  &__layout {
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }

  &__level-buttons {
    margin-bottom: 0;
  }

  &__overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  &__game-over {
    background: white;
    padding: 30px 50px;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  &__game-over-title {
    margin: 0 0 10px 0;
    color: #d32f2f;
    font-size: 28px;
  }

  &__game-over-message {
    margin: 0 0 20px 0;
    font-size: 18px;
    color: #666;
  }

  &__victory {
    background: white;
    padding: 30px 50px;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  &__victory-title {
    margin: 0 0 10px 0;
    color: #4caf50;
    font-size: 28px;
  }

  &__victory-message {
    margin: 0 0 20px 0;
    font-size: 18px;
    color: #666;
  }

  &__restart-button {
    padding: 12px 30px;
    font-size: 16px;
    background: #4caf50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    margin: 0 5px;

    &:hover {
      background: #45a049;
    }
  }

  &__next-level-button {
    padding: 12px 30px;
    font-size: 16px;
    background: #2196f3;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    margin: 0 5px;

    &:hover {
      background: #1976d2;
    }
  }

  &__build-controls {
    display: flex;
    gap: 10px;
    margin-left: 20px;
  }

  &__build-button {
    padding: 8px 16px;
    background: #ddd;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.2s;

    &:hover {
      background: #ccc;
    }

    &--active {
      background: #4caf50;
      color: white;

      &:hover {
        background: #45a049;
      }
    }
  }

  &__spawn-ally {
    padding: 8px 16px;
    background: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.2s;

    &:hover:not(:disabled) {
      background: #357abd;
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }

  &__notification {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    border-radius: 6px;
    font-weight: bold;
    z-index: 2000;

    &--error {
      background: #f44336;
      color: white;
      box-shadow: 0 2px 10px rgba(244, 67, 54, 0.5);
    }
  }
}
</style>