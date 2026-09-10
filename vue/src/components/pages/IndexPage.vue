<template>
  <div class="game">
    <div class="game__header">
      <span class="game__stat">Счёт: {{ Math.floor(getScore) }} м</span>
      <span class="game__stat">Скорость: {{ kmh }} км/ч</span>
      <span class="game__stat">
        <svg v-for="n in getPlayer.lives" :key="n" viewBox="0 0 24 24" class="game__heart">
          <path d="M12 21s-6.7-4.35-9.33-8.11C.9 10.35 1.96 6.5 5.2 5.5c2.03-.62 4.07.06 5.3 1.75L12 8.7l1.5-1.45c1.23-1.69 3.27-2.37 5.3-1.75 3.24 1 4.3 4.85 2.53 7.39C18.7 16.65 12 21 12 21z"/>
        </svg>
      </span>
      <span class="game__stat">Рекорд: {{ getRecord }} м</span>
    </div>
    <div v-if="getIsOver" class="game__finished">
      <div>Игра окончена! Итоговый счёт: {{ Math.floor(getScore) }} м</div>
      <div class="game__record">Рекорд: {{ getRecord }} м</div>
      <button class="game__restart" @click="restart">Начать заново</button>
    </div>
    <div class="game__world">
      <div class="game__road">
        <svg width="100%" height="100%">
          <line v-for="line in 3" :key="line" class="game__line" :style="roadLineStyle" stroke-dasharray="50,40" :x1="line * 25 + '%'" y1="0" :x2="line * 25 + '%'" y2="100%" stroke="#f2f2f2" stroke-width="2" />
        </svg>
        <Car :color="PLAYER_COLOR" :x="getPlayer.x" :y="playerY" />
        <template v-for="obstacle in getObstacles" :key="obstacle.id">
          <Car v-if="obstacle.type === 'car'" :color="obstacle.color" :direction="obstacle.direction" :x="obstacle.x" :y="obstacle.y" :hit="obstacle.hit" />
          <div v-else-if="obstacle.type === 'hole'" class="game__hole" :style="placeObject(obstacle.x, obstacle.y, 6.5)" />
          <div v-else class="game__barrier" :style="placeObject(obstacle.x, obstacle.y, 8.5)" />
        </template>
        <template v-for="bonus in getBonuses" :key="bonus.id">
          <div class="game__bonus" :class="'game__bonus--' + bonus.type" :style="placeObject(bonus.x, bonus.y, 4.5)">
            <svg v-if="bonus.type === 'heart'" viewBox="0 0 24 24" class="game__bonus-icon">
              <path d="M12 21s-6.7-4.35-9.33-8.11C.9 10.35 1.96 6.5 5.2 5.5c2.03-.62 4.07.06 5.3 1.75L12 8.7l1.5-1.45c1.23-1.69 3.27-2.37 5.3-1.75 3.24 1 4.3 4.85 2.53 7.39C18.7 16.65 12 21 12 21z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" class="game__bonus-icon">
              <path d="M13 2 L4 14 H11 L9 22 L20 8 H12 Z"/>
            </svg>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Car from '../ui/Car.vue';
import { mapGetters, mapActions } from 'vuex';

const X_STEP = 6
const PLAYER_COLOR = '#d64545'
const PLAYER_Y = 65

function boxesOverlap(a: any, b: any) {
  return !(b.x > a.x + a.w ||
    b.x + b.w < a.x ||
    b.y > a.y + a.h ||
    b.y + b.h < a.y)
}

export default {
  name: 'IndexPage',
  components: {
    Car
  },
  data () {
    return {
      PLAYER_COLOR,
      playerY: PLAYER_Y,
      gameInterval: null as any,
    }
  },
  computed: {
    ...mapGetters('game', [
      'getScore',
      'getRecord',
      'getSpeed',
      'getPlayer',
      'getObstacles',
      'getBonuses',
      'getInvulnerable',
      'getIsStunned',
      'getIsOver',
    ]),
    kmh() {
      return Math.round(this.getSpeed * 28.6)
    },
    roadLineStyle() {
      if (this.getIsOver || this.getSpeed < 0.05) {
        return {
          animation: 'none'
        }
      }
      return {
        animationDuration: 1 / this.getSpeed + 's'
      }
    },
  },
  mounted() {
    window.addEventListener('keydown', this.arrow)
    this.runGame()
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.arrow)
    clearInterval(this.gameInterval)
  },
  methods: {
    ...mapActions('game', [
      'updatePlayerX',
      'updateGame',
      'handleAccident',
      'handleBonus',
      'gameOver',
      'removeObjects',
      'resetGame',
    ]),
    arrow(event: KeyboardEvent) {
      if (this.getIsOver) {
        if (event.key === 'Enter') {
          this.restart()
        }
        return
      }
      if (event.key === 'ArrowLeft') {
        this.updatePlayerX(this.getPlayer.x - X_STEP)
      }
      if (event.key === 'ArrowRight') {
        this.updatePlayerX(this.getPlayer.x + X_STEP)
      }
    },
    restart() {
      this.resetGame()
      this.runGame()
    },
    runGame() {
      clearInterval(this.gameInterval)
      this.gameInterval = setInterval(() => {
        this.updateGame()
        this.collectBonus()
        this.isAccident()
        if (this.getPlayer.lives <= 0) {
          this.gameOver()
          clearInterval(this.gameInterval)
          return
        }
        this.removeObjects()
      }, 50)
    },
    placeObject(x: number, y: number, halfWidth: number) {
      return {
        top: y + '%',
        left: `${x - halfWidth}%`,
      }
    },
    playerBox() {
      return {
        x: this.getPlayer.x - 6,
        y: PLAYER_Y + 2,
        w: 12,
        h: 26,
      }
    },
    obstacleBox(obstacle: any) {
      if (obstacle.type === 'hole') {
        return { x: obstacle.x - 4.5, y: obstacle.y + 1, w: 9, h: 10 }
      }
      if (obstacle.type === 'barrier') {
        return { x: obstacle.x - 6, y: obstacle.y + 1, w: 12, h: 7 }
      }
      return { x: obstacle.x - 6, y: obstacle.y + 2, w: 12, h: 26 }
    },
    isAccident() {
      if (this.getInvulnerable > 0) return
      const player = this.playerBox()
      for (const obstacle of this.getObstacles) {
        if (obstacle.hit) continue
        if (boxesOverlap(player, this.obstacleBox(obstacle))) {
          this.handleAccident(obstacle.id)
          return
        }
      }
    },
    collectBonus() {
      const player = this.playerBox()
      for (const bonus of this.getBonuses) {
        const box = { x: bonus.x - 5, y: bonus.y + 1, w: 10, h: 9 }
        if (boxesOverlap(player, box)) {
          this.handleBonus({ bonusId: bonus.id, bonusType: bonus.type })
          return
        }
      }
    },
  },
}
</script>

<style scoped lang="scss">
.game {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #141b30 0%, #2e4370 60%, #0d1220 100%);

  &__header {
    position: absolute;
    width: 100%;
    height: 6%;
    top: 0;
    left: 0;
    font-size: 18px;
    color: #ffd166;
    background-color: rgba(18, 22, 32, 0.92);
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 26px;
  }

  &__stat {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__heart {
    width: 16px;
    height: 16px;
    fill: #ff4d5a;
  }

  &__finished {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 22px;
    color: white;
    background-color: rgba(15, 18, 28, 0.92);
    padding: 26px 44px;
    border-radius: 12px;
    z-index: 20;
    text-align: center;
    border: 2px solid #d64545;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }

  &__record {
    font-size: 16px;
    color: #9aa4bd;
  }

  &__restart {
    padding: 10px 28px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 700;
    color: #121620;
    background-color: #ffd166;
    cursor: pointer;

    &:hover {
      background-color: #ffe08a;
    }
  }

  &__world {
    position: absolute;
    inset: 0;
    transform-style: preserve-3d;
    transform: perspective(900px) rotateX(30deg);
    transform-origin: center top;
    background: repeating-linear-gradient(
      90deg,
      #2f7d50 0px,
      #2f7d50 90px,
      #2a6f46 90px,
      #2a6f46 180px
    );
  }

  &__road {
    position: absolute;
    top: 0;
    left: 20%;
    width: 60%;
    height: 100%;
    background-color: #34343a;
    border-left: 3px solid #e8e8e8;
    border-right: 3px solid #e8e8e8;
    transform-style: preserve-3d;
  }

  &__line {
    animation: moveRoad linear infinite;
  }

  &__hole {
    position: absolute;
    width: 13%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: radial-gradient(circle at 50% 42%, #060709 0 52%, #1b1e25 70%, #34343a 100%);
    box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.9), 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  &__barrier {
    position: absolute;
    width: 17%;
    height: 8%;
    border-radius: 4px;
    border: 2px solid #101218;
    background: repeating-linear-gradient(45deg, #f4c531 0px, #f4c531 10px, #1a1d24 10px, #1a1d24 20px);
    box-shadow: 0 4px 0 rgba(0, 0, 0, 0.45);
  }

  &__bonus {
    position: absolute;
    width: 9%;
    aspect-ratio: 1;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.04) 60%, transparent 100%);
    animation: bonusPulse 1.1s ease-in-out infinite;

    &--heart .game__bonus-icon {
      fill: #ff4d5a;
    }

    &--boost .game__bonus-icon {
      fill: #ffd166;
    }
  }

  &__bonus-icon {
    width: 70%;
    height: 70%;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6));
  }

  @keyframes bonusPulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.65;
    }
  }

  @keyframes moveRoad {
    from {
      stroke-dashoffset: 0;
    }
    to {
      stroke-dashoffset: -90;
    }
  }
}
</style>
