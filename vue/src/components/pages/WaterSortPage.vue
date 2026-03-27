<template>
  <div class = "game">
    <h1 class = "game__title">Переливатор</h1>
    <div v-if = "isWin" class = "game__win-message">
      Молодец! Все цвета разделены!
    </div>

    <div class = "game__container">
      <Bottle
          v-for = "(bottle, index) in getBottles"
          :key = "index"
          :layers = "bottle"
          :is-selected = "getSelected === index"
          :max-layers = "4"
          @select = "handleBottleClick(index)"
      />
    </div>

    <div class = "game__controls">
      <Btn :pr = "1" @click = "initGame">
        Начать заново
      </Btn>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Bottle from './../ui/Bottle.vue'
import Btn from './../ui/Btn.vue'

export default {
  name: 'WaterSortPage',
  components: {
    Bottle,
    Btn
  },
  computed: {
    ...mapGetters('waterSort', {
      getBottles: 'getBottle',
      getSelected: 'getSelected',
      isWin: 'isWin'
    })
  },
  mounted() {
    this.initGame()
  },
  methods: {
    ...mapActions('waterSort', [
      'initGame',
      'handleBottleClick'
    ])
  }
}
</script>

<style scoped lang = "scss">
.game {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  &__container {
    display: flex;
    gap: 20px;
    margin-top: 50px;
  }
  &__win-message {
    color: #2ecc71;
    font-weight: bold;
    font-size: 24px;
    margin-bottom: 20px;
  }
  &__controls {
    margin-top: 30px;
  }
}
</style>