<template>
  <div class="slider">
    <p class="slider__label">{{ label }}</p>

    <div class="slider__center">
      <div class="slider__control">
        <div class="slider__flask">
          <div class="slider__neck"></div>

          <div
            class="slider__fill"
            :style="fillStyle">
          </div>

          <div
            class="slider__segments"
            :style="segmentsStyle">
            <span
              v-for="segment in segmentsCount"
              :key="segment"
              class="slider__segment">
            </span>
          </div>
        </div>

        <input
          class="slider__input"
          type="range"
          :min="min"
          :max="max"
          :step="step"
          :value="value"
          @input="handleInput"
        >
      </div>

      <p class="slider__value">{{ value }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "FlaskSlider",
  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    step: {
      type: Number,
      default: 1
    },
    color: {
      type: String,
      default: 'linear-gradient(180deg, rgba(143, 214, 217, 0.9) 0%, rgba(103, 183, 209, 0.95) 100%)'
    }
  },
  emits: ['update:value'],
  computed: {
    progressPercent() {
      if (this.max === this.min) {
        return 0
      }

      return ((this.value - this.min) / (this.max - this.min)) * 100
    },
    segmentsCount() {
      return this.max - this.min + 1
    },
    fillStyle() {
      return {
        height: `${this.progressPercent}%`,
        background: this.color
      }
    },
    segmentsStyle() {
      return {
        gridTemplateRows: `repeat(${this.segmentsCount}, 1fr)`
      }
    }
  },
  methods: {
    handleInput(e) {
      this.$emit('update:value', Number(e.target.value))
    }
  }
}
</script>

<style scoped lang="scss">
.slider {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.slider__label {
  color: #243746;
  font-size: 26px;
  font-weight: 700;
  text-align: center;
  line-height: 1.2;
  min-height: 62px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slider__center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.slider__control {
  position: relative;
  width: 88px;
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slider__flask {
  position: relative;
  width: 74px;
  height: 220px;
  border-radius: 16px 16px 34px 34px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(245, 250, 253, 0.8) 0%, rgba(225, 236, 243, 0.92) 100%);
  border: 2px solid rgba(137, 163, 181, 0.5);
  box-shadow:
    0 10px 18px rgba(41, 65, 85, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.slider__neck {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  width: 26px;
  height: 24px;
  border-radius: 12px 12px 0 0;
  background: linear-gradient(180deg, rgba(245, 250, 253, 0.9) 0%, rgba(225, 236, 243, 0.96) 100%);
  border-top: 2px solid rgba(137, 163, 181, 0.5);
  border-left: 2px solid rgba(137, 163, 181, 0.5);
  border-right: 2px solid rgba(137, 163, 181, 0.5);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

.slider__fill {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  border-radius: 0 0 30px 30px;
  transition: height 0.18s ease;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    inset 0 -2px 8px rgba(255, 255, 255, 0.12);
  z-index: 1;
}

.slider__segments {
  position: absolute;
  inset: 0;
  display: grid;
  pointer-events: none;
  z-index: 2;
}

.slider__segment {
  border-top: 1px solid rgba(108, 132, 149, 0.2);
}

.slider__segment:first-child {
  border-top: none;
}

.slider__input {
  position: absolute;
  width: 220px;
  height: 36px;
  transform: rotate(-90deg);
  opacity: 0;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  z-index: 3;
}

.slider__input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 28px;
  height: 36px;
  cursor: pointer;
}

.slider__input::-moz-range-thumb {
  width: 28px;
  height: 36px;
  border: none;
  border-radius: 0;
  cursor: pointer;
}

.slider__value {
  color: #243746;
  font-size: 28px;
  font-weight: 800;
  min-width: 48px;
  text-align: center;
}
</style>