<template>
  <div class="puzzle">
    <div class="puzzle__content">
      <h2>Пятнашки</h2>
      <div class="puzzle__status">Ходы: {{ moves }}</div>
      <div class="puzzle__board">
        <div v-for="(tile, index) in tiles" :key="index" class="puzzle__tile">
          <span v-if="tile !== 0">{{ tile }}</span>
        </div>
      </div>
      <button class="puzzle__restart" @click="() => initGame()">Перемешать</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PuzzleGame',
  data() {
    return {
      gridSize: 4,
      tiles: [],
      moves: 0,
    }
  },
  methods: {
    initGame() {
      this.moves = 0
      const total = this.gridSize * this.gridSize
      this.tiles = Array.from({ length: total }, (_, i) => (i + 1) % total)
    }
  },
  mounted() {
    this.initGame()
  }
}
</script>

<style scoped lang="scss">
.puzzle {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;

  &__content {
    text-align: center;
    width: 100%;
    max-width: 400px;
  }

  h2 {
    color: #fff;
    font-size: 36px;
    margin: 0 0 20px 0;
    font-family: sans-serif;
  }

  &__status {
    color: #888;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 20px;
    font-family: sans-serif;
  }

  &__board {
    display: grid;
    grid-template-columns: repeat(4, 80px);
    grid-template-rows: repeat(4, 80px);
    gap: 5px;
    margin: 0 auto 30px;
  }

  &__tile {
    width: 80px;
    height: 80px;
    background-color: #333;
    color: #fff;
    font-size: 28px;
    font-weight: bold;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: sans-serif;
  }

  &__restart {
    padding: 15px 50px;
    font-size: 18px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    font-family: sans-serif;
  }
}
</style>
