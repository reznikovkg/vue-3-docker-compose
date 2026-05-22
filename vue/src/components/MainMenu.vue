<template>
  <div class="menu">
    <h1 class="menu__title">Найди пару</h1>

    <div class="menu__block">
      <div class="menu__label">Сложность</div>

      <select v-model="level">
        <option value="easy">Легко</option>
        <option value="medium">Средне</option>
        <option value="hard">Сложно</option>
      </select>
    </div>

    <div class="menu__block">
      <div class="menu__label">Слои</div>

      <select v-model="layers">
        <option :value="1">1</option>
        <option :value="3">3</option>
        <option :value="5">5</option>
      </select>
    </div>

    <div class="menu__record">
      Рекорд: {{ record || 'нет' }} сек
    </div>

    <button class="menu__button" @click="start">
      Начать игру
    </button>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  data() {
    return {
      level: 'easy',
      layers: 1
    }
  },

  computed: {
    ...mapGetters(['record'])
  },

  methods: {
    ...mapActions([
      'setLevel',
      'setLayers',
      'startGame'
    ]),

    start() {
      this.setLevel(this.level)
      this.setLayers(this.layers)
      this.startGame()

      this.$router.push('/game')
    }
  }
}
</script>

<style scoped lang="scss">
.menu {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  background: #f5f5f5;

  &__title {
    font-size: 48px;
  }

  &__block {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  &__button {
    padding: 15px 30px;
    border: none;
    background: purple;
    color: white;
    cursor: pointer;
    border-radius: 10px;
    font-size: 18px;
  }

  select {
    padding: 10px;
    width: 200px;
  }
}
</style>