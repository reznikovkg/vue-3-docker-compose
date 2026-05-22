<template>
  <div class = "bubble-playground">
    <div class = "bubble-playground__header">
      <div class = "bubble-playground__score">{{ points.toFixed(0) }}</div>
      <div
          class = "bubble-playground__timer"
          :class = "{ 'bubble-playground__timer--urgent': remaining <= 15 }"
      >
        {{ timeDisplay }}
      </div>
    </div>

    <div v-if = "tutorialVisible" class = "bubble-playground__hint">
      <div class = "bubble-playground__hint__content">
        <p>Лопай шарики нужного цвета!</p>
        <img :src = "targetIcon" :alt = "targetLabel" class = "bubble-playground__hint__image" />
      </div>
    </div>

    <div
        ref = "stageRef"
        class = "bubble-playground__stage"
        :class = "{ 'bubble-playground__stage--bomb': bombActive }"
        :style = "{ cursor: currentCursor }"
        @mousedown = "(event) => onMouseDown(event)"
        @mousemove = "(event) => onMouseMove(event)"
        @mouseup = "() => onMouseUp()"
        @mouseleave = "() => onMouseLeave()"
    >
      <div
          v-for = "mark in marks"
          :key = "mark.id"
          class = "bubble-playground__mark"
          :style = "{ left: mark.x + 'px', top: mark.y + 'px' }"
      ></div>

      <div
          v-for = "item in items"
          :key = "item.id"
          class = "bubble-playground__bubble"
          :class = "`bubble-playground__bubble--${item.size}`"
          :style = "{
          width: (item.radius * 2) + 'px',
          height: (item.radius * 2) + 'px',
          backgroundImage: `url(${COLOR_IMAGES[item.color]})`,
          transform: `translate(${item.x}px, ${item.y}px)`
        }"
      ></div>
    </div>

    <div class = "bubble-playground__controls">
      <div class = "controls-group">
        <button @click = "() => setMode('standard')" :class = "{ active: currentMode === 'standard' }">Клик</button>
        <button @click = "() => setMode('laser')" :class = "{ active: currentMode === 'laser' }">Лазер</button>
        <button @click = "() => setMode('auto')" :class = "{ active: currentMode === 'auto' }">Автомат</button>
      </div>

      <div class = "controls-stats">
        <span class = "combo--good">Комбо: x{{ combo.toFixed(1) }}</span>
        <span class = "combo--bad">Штраф: x{{ penaltyCombo.toFixed(1) }}</span>
      </div>

      <div class = "controls-group">
        <button
            class = "bomb-btn"
            @click = "() => toggleBomb()"
            :disabled = "bombs <= 0"
            :class = "{ active: bombActive }"
        >
          💣 Бомба ({{ bombs }})
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { COLOR_IMAGES } from '@/config/gameConfig'

export default {
  name: 'BubblePlayground',
  props: {
    totalColors: { type: Number, required: true },
    targetColor: { type: String, required: true },
    spawnRate: { type: Number, required: true },
    pointsForCorrect: { type: Number, default: 1 },
    pointsForWrong: { type: Number, default: -5 },
    onStart: { type: Function, default: () => {} },
    onScore: { type: Function, default: () => {} },
    onFinish: { type: Function, default: () => {} },
    gameDuration: { type: Number, default: 60 }
  },
  data() {
    return {
      resizeHandler: null
    }
  },
  computed: {
    ...mapState('game', [
      'points', 'remaining', 'sessionEnded', 'items', 'stageWidth', 'stageHeight',
      'tutorialVisible', 'tutorialBlocking', 'currentMode', 'marks', 'combo', 'penaltyCombo',
      'bombs', 'bombActive'
    ]),
    ...mapGetters('game', [
      'timeDisplay', 'targetIcon', 'targetLabel', 'COLOR_IMAGES', 'currentCursor'
    ]),
  },
  mounted() {
    this.resizeHandler = () => this.updateStageSize({ stageRef: this.$refs.stageRef })

    this.$nextTick(() => {
      this.resizeHandler()
      window.addEventListener('resize', this.resizeHandler)
      this.initGame({
        totalColors: this.totalColors,
        targetColor: this.targetColor,
        spawnRate: this.spawnRate,
        pointsForCorrect: this.pointsForCorrect,
        pointsForWrong: this.pointsForWrong,
        gameDuration: this.gameDuration,
        onStart: this.onStart,
        onScore: this.onScore,
        onFinish: this.onFinish,
      })
    })
  },
  beforeDestroy() {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler)
    }
  },
  methods: {
    ...mapActions('game', ['setMode', 'toggleBomb', 'setDragging', 'resetGame', 'updateStageSize', 'initGame']),

    onMouseDown(event) {
      this.$store.dispatch('game/handleMouseDown', { event, stageRef: this.$refs.stageRef })
    },
    onMouseMove(event) {
      this.$store.dispatch('game/handleMouseMove', { event, stageRef: this.$refs.stageRef })
    },
    onMouseUp() {
      this.setDragging(false)
    },
    onMouseLeave() {
      this.setDragging(false)
    },
    restartGame() {
      this.$store.dispatch('game/resetGame')
    }
  }
}
</script>

<style lang="scss" scoped>
$bgGradientStart: #fce9e1;
$bgGradientEnd: #fff9f0;
$textLight: #a58d7b;
$textMuted: #d39974;
$accentPastel: #f3b3a1;
$borderSoft: #f0d9cf;
$timerWarning: #f3b3a1;
$successColor: #8fcd8f;
$dangerColor: #e57373;

.bubble-playground {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(160deg, $bgGradientStart 0%, $bgGradientEnd 100%);
  user-select: none;
  overflow: hidden;

  &__header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 20px;
    box-sizing: border-box;
    z-index: 20;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(5px);
    border-bottom: 2px solid $borderSoft;
    pointer-events: none;
  }

  &__score {
    font-size: 2rem;
    font-weight: bold;
    color: $textLight;
    text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.8);
    background: transparent;
    padding: 0;
    border: none;
    letter-spacing: 1px;
  }

  &__timer {
    font-size: 2rem;
    font-weight: bold;
    color: $textLight;
    text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;

    &--urgent {
      color: $timerWarning;
      text-shadow: 0 0 5px $timerWarning;
    }
  }

  &__hint {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 245, 235, 0.95);
    backdrop-filter: blur(8px);
    border-radius: 60px;
    padding: 20px 40px;
    border: 2px solid $accentPastel;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    z-index: 100;
    pointer-events: none;
    text-align: center;
    animation: fadeInOut 0.3s ease-out;

    &__content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;

      p {
        font-size: 1.8rem;
        font-weight: bold;
        color: $textLight;
        margin: 0;
        white-space: nowrap;
      }
    }

    &__image {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 3px solid $accentPastel;
      box-shadow: 0 0 15px rgba($accentPastel, 0.5);
    }
  }

  &__stage {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;

    &--bomb {
      cursor: crosshair !important;
    }
  }

  &__bubble {
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 50%;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    transition: transform 0.05s linear;
    will-change: transform;
  }

  &__mark {
    position: absolute;
    width: 30px;
    height: 30px;
    background: radial-gradient(circle, rgba(255,100,100,0.8) 0%, transparent 60%);
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 10;
    animation: markFade 2s forwards;
  }

  &__controls {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    background: rgba(255, 255, 255, 0.7);
    padding: 15px 25px;
    border-radius: 30px;
    backdrop-filter: blur(10px);
    border: 2px solid $borderSoft;
    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
    align-items: center;
    justify-content: center;
    z-index: 50;

    .controls-group {
      display: flex;
      gap: 10px;
    }

    .controls-stats {
      display: flex;
      flex-direction: column;
      font-weight: bold;
      font-size: 1.1rem;
      text-align: center;
      min-width: 120px;
      .combo--good { color: $successColor; }
      .combo--bad { color: $dangerColor; }
    }

    button {
      padding: 10px 20px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 1rem;
      cursor: pointer;
      background: #fff;
      color: $textLight;
      border: 2px solid $accentPastel;
      transition: all 0.2s;
      &:hover { background: #fafafa; }
      &.active { background: $accentPastel; color: #fff; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
      &.bomb-btn { border-color: #ffb74d; color: #ffb74d; &.active { background: #ffb74d; color: #fff; } }
    }
  }
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
  15% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
}

@keyframes markFade {
  0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
  20% { transform: translate(-50%, -50%) scale(1.2); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
}
</style>