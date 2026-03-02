<template>
  <div class="start-page" >
    <div v-if="!isGameStarted">
      <button class="c-button" @click="() => startGame()">Start Game</button>
    </div>

    <BubbleGame
        v-else
        :num="5"
        :intensity="0.5"
        :points="5"
        :selectColor="'blue'"
        @finish="(p) => handleGameFinish(p)"
    />
  </div>

</template>

<script>
import BubbleGame from "@/components/BubbleGame.vue";

export default {
  name: 'IndexPage',
  data() {
    return {
      isGameStarted: false
    }
  },
  components: {
    BubbleGame
  },
  methods: {
    startGame() {
      this.isGameStarted = true;
    },
    handleGameFinish(finalScore) {
      alert(`Game Over! Your score: ${finalScore}`);
      this.isGameStarted = false;
    },
  }
}
</script>

<style lang="scss">
.start-page {
  display: flex;
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #f8f9fa;
  align-items: center;
  justify-content: space-around;
}

.c-button {
  background-color: transparent;
  border: 1px solid #0879ea;
  border-radius: 8px;
  color: #0879ea;
  font-size: 20px;
  padding: 10px;
}
</style>
