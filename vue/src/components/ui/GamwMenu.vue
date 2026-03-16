<template>
  <div class="c-menu">
    <h2 class="c-menu__title">Игра "Мыльные пузыри"</h2>

    <div class="c-menu__row">
      <div class="c-menu__label">Количество цветов (2-6):</div>
      <div class="c-menu__control">
        <input
          type="number"
          min="2"
          max="6"
          class="c-menu__input"
          :value="colorsCountLocal"
          @input="(e) => setColorsCount(e)"
        >
      </div>
    </div>

    <div class="c-menu__row">
      <div class="c-menu__label">Целевой цвет:</div>
      <div class="c-menu__control">
        <div class="c-menu__colorBox" :style="{ background: targetColorView }">
          <input
            type="range"
            class="c-menu__colorSlider"
            min="0"
            :max="availableColors.length - 1"
            step="1"
            :value="targetColorIndex"
            @input="(e) => setTargetColorIndex(e)"
          >
        </div>
      </div>
    </div>

    <div class="c-menu__row">
      <div class="c-menu__label">Интенсивность (шт/сек):</div>
      <div class="c-menu__control">
        <input
          type="number"
          step="0.1"
          min="0.1"
          class="c-menu__input"
          :value="intensityLocal"
          @input="(e) => setIntensity(e)"
        >
      </div>
    </div>

    <div class="c-menu__row">
      <div class="c-menu__label">Очки за попадание:</div>
      <div class="c-menu__control">
        <input
          type="number"
          class="c-menu__input"
          :value="scoreHitLocal"
          @input="(e) => setScoreHit(e)"
        >
      </div>
    </div>

    <div class="c-menu__row">
      <div class="c-menu__label">Очки за ошибку:</div>
      <div class="c-menu__control">
        <input
          type="number"
          class="c-menu__input"
          :value="scoreMissLocal"
          @input="(e) => setScoreMiss(e)"
        >
      </div>
    </div>

    <button type="button" class="c-menu__btn c-menu__btn--start" @click="() => emitStart()">
      НАЧАТЬ ИГРУ
    </button>

    <div v-if="lastResultScore !== null" class="c-menu__result">
      Последний результат: {{ lastResultScore }} очков
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { GAME_COLORS, GAME_COLOR_HEX, GAME_DEFAULTS } from '@/constants/gameConfig.js'

export default {
  name: 'GamwMenu',

  props: {
    colorsCount: {
      type: Number,
      default: GAME_DEFAULTS.colorsCount
    },
    targetColor: {
      type: String,
      default: GAME_DEFAULTS.targetColor
    },
    intensity: {
      type: Number,
      default: GAME_DEFAULTS.intensity
    },
    scoreHit: {
      type: Number,
      default: GAME_DEFAULTS.scoreHit
    },
    scoreMiss: {
      type: Number,
      default: GAME_DEFAULTS.scoreMiss
    }
  },

  emits: ['start'],

  data() {
    return {
      baseColors: GAME_COLORS,
      colorsCountLocal: GAME_DEFAULTS.colorsCount,
      targetColorIndex: 0,
      intensityLocal: GAME_DEFAULTS.intensity,
      scoreHitLocal: GAME_DEFAULTS.scoreHit,
      scoreMissLocal: GAME_DEFAULTS.scoreMiss
    }
  },

  computed: {
    ...mapGetters([
      'getLastResultScore'
    ]),

    lastResultScore() {
      const score = this.getLastResultScore
      return typeof score === 'number' ? Math.round(score) : score
    },

    availableColors() {
      return this.baseColors.slice(0, this.colorsCountLocal)
    },

    targetColorLocal() {
      return this.availableColors[this.targetColorIndex] || this.availableColors[0]
    },

    targetColorView() {
      return GAME_COLOR_HEX[this.targetColorLocal] || GAME_COLOR_HEX.red
    }
  },

  mounted() {
    this.colorsCountLocal = Math.min(6, Math.max(2, Math.floor(this.colorsCount)))
    this.intensityLocal = this.intensity
    this.scoreHitLocal = this.scoreHit
    this.scoreMissLocal = this.scoreMiss

    const initialIndex = this.availableColors.indexOf(this.targetColor)
    this.targetColorIndex = initialIndex >= 0 ? initialIndex : 0
  },

  methods: {
    setColorsCount(e) {
      const value = Number(e.target.value)
      const safe = Number.isNaN(value) ? 2 : value
      this.colorsCountLocal = Math.min(6, Math.max(2, Math.floor(safe)))

      const maxIndex = this.availableColors.length - 1
      if (this.targetColorIndex > maxIndex) {
        this.targetColorIndex = maxIndex
      }
    },

    setTargetColorIndex(e) {
      const value = Number(e.target.value)
      const maxIndex = this.availableColors.length - 1
      const safe = Number.isNaN(value) ? 0 : value
      this.targetColorIndex = Math.min(maxIndex, Math.max(0, Math.floor(safe)))
    },

    setIntensity(e) {
      const value = Number(e.target.value)
      const safe = Number.isNaN(value) ? 0.1 : value
      this.intensityLocal = Math.max(0.1, safe)
    },

    setScoreHit(e) {
      const value = Number(e.target.value)
      this.scoreHitLocal = Number.isNaN(value) ? 0 : value
    },

    setScoreMiss(e) {
      const value = Number(e.target.value)
      this.scoreMissLocal = Number.isNaN(value) ? 0 : value
    },

    emitStart() {
      this.$emit('start', {
        colorsCount: this.colorsCountLocal,
        targetColor: this.targetColorLocal,
        intensity: this.intensityLocal,
        scoreHit: this.scoreHitLocal,
        scoreMiss: this.scoreMissLocal
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.c-menu {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 640px;
  max-width: 100%;
  padding: 24px;
  border: 1px solid #d9d9d9;
  border-radius: 18px;
  background: #f5f5f7;
  color: #111;

  &__title {
    margin: 0;
    font-size: 40px;
    line-height: 1.1;
    font-weight: 700;
    text-align: center;
  }

  &__row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    align-items: center;
  }

  &__label {
    font-weight: 600;
  }

  &__control {
    display: flex;
    align-items: center;
  }

  &__input {
    width: 100%;
    height: 42px;
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 12px;
    font-size: 18px;
    color: #111;
  }

  &__colorBox {
    position: relative;
    width: 100%;
    height: 42px;
    border: 1px solid #d9d9d9;
    border-radius: 12px;
  }

  &__colorSlider {
    position: absolute;
    left: 8px;
    right: 8px;
    top: 50%;
    width: calc(100% - 16px);
    transform: translateY(-50%);
  }

  &__btn {
    height: 54px;
    border: 0;
    border-radius: 14px;
    font-size: 28px;
    font-weight: 700;
    cursor: pointer;
  }

  &__btn--start {
    background: linear-gradient(90deg, #5fcb73, #2fa858);
    color: #fff;
  }

  &__result {
    font-size: 22px;
    font-weight: 700;
  }
}

@media (max-width: 768px) {
  .c-menu {
    width: 100%;
    padding: 16px;

    &__title {
      font-size: 30px;
    }

    &__btn {
      font-size: 24px;
    }

    &__row {
      grid-template-columns: 1fr;
    }
  }
}
</style>
