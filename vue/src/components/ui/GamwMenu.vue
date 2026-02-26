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
export default {
  name: 'GamwMenu',

  props: {
    colorsCount: {
      type: Number,
      default: 6
    },
    targetColor: {
      type: String,
      default: 'red'
    },
    intensity: {
      type: Number,
      default: 1
    },
    scoreHit: {
      type: Number,
      default: 1
    },
    scoreMiss: {
      type: Number,
      default: -5
    }
  },

  emits: ['start'],

  data() {
    return {
      baseColors: ['red', 'blue', 'green', 'yellow', 'orange', 'purple'],
      colorsCountLocal: 6,
      targetColorIndex: 0,
      intensityLocal: 1,
      scoreHitLocal: 1,
      scoreMissLocal: -5
    }
  },

  computed: {
    lastResultScore() {
      return this.$store.getters.getLastResultScore
    },

    availableColors() {
      return this.baseColors.slice(0, this.colorsCountLocal)
    },

    targetColorLocal() {
      return this.availableColors[this.targetColorIndex] || this.availableColors[0]
    },

    targetColorView() {
      const palette = {
        red: '#ff4d4f',
        blue: '#4096ff',
        green: '#73d13d',
        yellow: '#fadb14',
        orange: '#fa8c16',
        purple: '#722ed1'
      }
      return palette[this.targetColorLocal] || '#ff4d4f'
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
  --menu-width: 640px; // Пока будет так
  --menu-height: auto; // Сделать авто по экрану(см.стаковерфлоу)
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: var(--menu-width);
  min-height: var(--menu-height);
  max-width: 100%;
  padding: 24px;
  border: 1px solid #d9d9d9;
  border-radius: 18px;
  background: #f5f5f7;
  color: #111;
}

.c-menu__title {
  margin: 0;
  font-size: 40px;
  line-height: 1.1;
  font-weight: 700;
  text-align: center;
}

.c-menu__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: center;
}

.c-menu__label {
  font-weight: 600;
}

.c-menu__control {
  display: flex;
  align-items: center;
}

.c-menu__input {
  width: 100%;
  height: 42px;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 12px;
  font-size: 18px;
  color: #111;
}

.c-menu__colorBox {
  position: relative;
  width: 100%;
  height: 42px;
  border: 1px solid #d9d9d9;
  border-radius: 12px;
  overflow: hidden;
}

.c-menu__colorSlider {
  position: absolute;
  left: 8px;
  right: 8px;
  top: 50%;
  width: calc(100% - 16px);
  transform: translateY(-50%);
}

.c-menu__btn {
  height: 54px;
  border: 0;
  border-radius: 14px;
  font-size: 28px;
  font-weight: 700;
  cursor: pointer;
}

.c-menu__btn--start {
  background: linear-gradient(90deg, #5fcb73, #2fa858);
  color: #fff;
}

.c-menu__result {
  font-size: 22px;
  font-weight: 700;
}

@media (max-width: 768px) {
  .c-menu {
    width: 100%;
    padding: 16px;
  }

  .c-menu__title {
    font-size: 30px;
  }

  .c-menu__btn {
    font-size: 24px;
  }

  .c-menu__row {
    grid-template-columns: 1fr;
  }
}
</style>
