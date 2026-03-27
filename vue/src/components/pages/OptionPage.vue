<template>
  <section class="option-page">
    <div class="option-page__box">
      <h1 class="option-page__title">Параметры игры</h1>

      <div class="option-page__group">
        <label class="option-page__label">Количество цветов</label>
        <select v-model="colorsCount" class="option-page__select">
          <option :value="1">1</option>
          <option :value="2">2</option>
          <option :value="3">3</option>
          <option :value="4">4</option>
          <option :value="5">5</option>
          <option :value="6">6</option>
          <option :value="7">7</option>
        </select>
      </div>

      <div class="option-page__group">
        <label class="option-page__label">Целевой цвет</label>
        <select v-model="targetColor" class="option-page__select">
          <option value="blue">Синий</option>
          <option value="green">Зеленый</option>
          <option value="orange">Оранжевый</option>
          <option value="pink">Розовый</option>
          <option value="purple">Фиолетовый</option>
          <option value="red">Красный</option>
          <option value="yellow">Желтый</option>
        </select>
      </div>

      <div class="option-page__group">
        <label class="option-page__label">Шариков в секунду</label>
        <input
          v-model.number="spawnRate"
          class="option-page__input"
          type="number"
          min="0.5"
          step="0.5"
        />
      </div>

      <div class="option-page__buttons">
        <button class="option-page__button" @click="saveSettings">
          Сохранить
        </button>

        <RouterLink class="option-page__button option-page__button--secondary" :to="{ name: 'MENU' }">
          Назад в меню
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'OptionPage',
  data() {
    return {
      colorsCount: 7,
      targetColor: 'red',
      spawnRate: 1
    }
  },
  mounted() {
    this.colorsCount = this.$store.getters.getColorsCount
    this.targetColor = this.$store.getters.getTargetColor
    this.spawnRate = this.$store.getters.getSpawnRate
  },
  methods: {
    saveSettings() {
      this.$store.dispatch('setColorsCount', Number(this.colorsCount))
      this.$store.dispatch('setTargetColor', this.targetColor)
      this.$store.dispatch('setSpawnRate', Number(this.spawnRate))

      this.$router.push({ name: 'MENU' })
    }
  }
}
</script>

<style scoped lang="scss">
.option-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef3f8;

  &__box {
    width: 420px;
    padding: 30px;
    border-radius: 14px;
    background: #ffffff;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  &__title {
    margin-bottom: 24px;
    text-align: center;
    font-size: 30px;
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
    padding: 10px 12px;
    border: 1px solid #cfd8e3;
    border-radius: 8px;
    font-size: 16px;
  }

  &__buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 25px;
  }

  &__button {
    display: block;
    padding: 12px 16px;
    border: none;
    border-radius: 8px;
    background: #4d96ff;
    color: #ffffff;
    text-decoration: none;
    text-align: center;
    font-size: 18px;
    cursor: pointer;
  }

  &__button--secondary {
    background: #6c757d;
  }
}
</style>