<template>
  <section class="option-page">
    <RouterLink class="option-page__back" :to="{ name: 'MENU' }">
      ← Вернуться в меню
    </RouterLink>

    <div class="option-page__box">
      <h1 class="option-page__title">Настройки</h1>

      <div class="option-page__group">
        <label class="option-page__label">Количество оттенков</label>
        <select v-model.number="colorsCount" class="option-page__select">
          <option v-for="n in maxColors" :key="n" :value="n">{{ n }}</option>
        </select>
        <div class="option-page__hint">от 1 до {{ maxColors }}</div>
      </div>

      <div class="option-page__group">
        <label class="option-page__label">Целевой цвет</label>
        <select v-model="targetColor" class="option-page__select">
          <option v-for="c in colors" :key="c.value" :value="c.value">
            {{ c.label }}
          </option>
        </select>

        <div class="option-page__color-preview">
          <span class="option-page__dot" :style="{ backgroundColor: targetColor }"></span>
          <span class="option-page__hint">выбран: {{ targetColorLabel }}</span>
        </div>
      </div>

      <div class="option-page__group">
        <label class="option-page__label">Скорость появления (шт/сек)</label>
        <input v-model.number="spawnRate" class="option-page__input" type="number" min="0.5" step="0.5" />
        <div class="option-page__hint">{{ speedHint }}</div>
      </div>

      <div class="option-page__buttons">
        <button class="option-page__button" @click="() => applySettings()">Применить</button>
        <button class="option-page__button option-page__button--secondary" @click="() => resetSettings()">Сброс</button>
      </div>
    </div>
  </section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { COLOR_LIST, COLOR_NAMES } from '@/config/gameConfig'

export default {
  name: 'OptionPage',
  data() {
    return {
      maxColors: 7,
      colors: COLOR_LIST,
      colorsCount: 7,
      targetColor: 'red',
      spawnRate: 1
    }
  },
  computed: {
    ...mapGetters(['getColorsCount', 'getTargetColor', 'getSpawnRate']),
    targetColorLabel() {
      return COLOR_NAMES[this.targetColor] || this.targetColor
    },
    speedHint() {
      if (!this.spawnRate) return ''
      const sec = (1 / this.spawnRate).toFixed(2)
      return `${sec} сек на пузырь`
    }
  },
  mounted() {
    this.colorsCount = this.getColorsCount
    this.targetColor = this.getTargetColor
    this.spawnRate = this.getSpawnRate
  },
  methods: {
    ...mapActions(['setColorsCount', 'setTargetColor', 'setSpawnRate']),
    applySettings() {
      let cc = Number(this.colorsCount)
      let sr = Number(this.spawnRate)

      if (!cc || cc < 1) cc = 1
      if (cc > this.maxColors) cc = this.maxColors
      if (!sr || sr < 0.5) sr = 0.5

      this.colorsCount = cc
      this.spawnRate = sr

      this.setColorsCount(cc)
      this.setTargetColor(this.targetColor)
      this.setSpawnRate(sr)

      this.$router.push({ name: 'MENU' })
    },
    resetSettings() {
      this.colorsCount = 7
      this.targetColor = 'red'
      this.spawnRate = 1
    }
  }
}
</script>

<style scoped lang="scss">
.option-page {
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  background: #eef3f8;
  position: relative;

  &__back {
    display: inline-block;
    margin-bottom: 18px;
    padding: 10px 14px;
    border-radius: 10px;
    background: #ffffff;
    border: 1px solid #cfd8e3;
    color: #2c3e50;
    text-decoration: none;
    position: relative;
    z-index: 3;
  }

  &__box {
    max-width: 720px;
    margin: 0 auto;
    padding: 26px 28px;
    border-radius: 14px;
    background: #ffffff;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    position: relative;
    z-index: 3;
  }

  &__title {
    text-align: center;
    font-size: 34px;
    margin: 10px 0 24px;
    font-weight: 700;
  }

  &__group {
    margin-bottom: 18px;
  }

  &__label {
    display: block;
    margin-bottom: 8px;
    font-size: 17px;
  }

  &__select,
  &__input {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #cfd8e3;
    outline: none;
    border-radius: 10px;
    background: #ffffff;
    color: #2c3e50;
    font-size: 16px;
    position: relative;
    z-index: 4;
    pointer-events: auto;
  }

  &__hint {
    margin-top: 8px;
    font-size: 13px;
    color: #6c757d;
  }

  &__color-preview {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
  }

  &__dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.2);
  }

  &__buttons {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 22px;
    flex-wrap: wrap;
  }

  &__button {
    min-width: 160px;
    padding: 12px 18px;
    border: none;
    border-radius: 10px;
    background: #4d96ff;
    color: #ffffff;
    font-weight: 700;
    cursor: pointer;
    position: relative;
    z-index: 4;
    pointer-events: auto;
  }

  &__button--secondary {
    @extend .option-page__button;
    background: #6c757d;
  }

  &::before,
  &::after {
    pointer-events: none;
  }
}
</style>