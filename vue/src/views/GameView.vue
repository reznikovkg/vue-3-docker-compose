<template>
  <div class="game">
    <GameTimer />

    <GameBoard />

    <FinishModal v-if="gameFinished" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import GameBoard from '../components/GameBoard.vue'
import GameTimer from '../components/GameTimer.vue'
import FinishModal from '../components/FinishModal.vue'

export default {
  name: 'GameView',

  components: {
    GameBoard,
    GameTimer,
    FinishModal
  },

  computed: {
    ...mapGetters([
      'gameFinished'
    ])
  }
}
</script>

<style scoped lang="scss">
.game {
  min-height: 100vh;

  background: #f3f3f3;

  padding: 20px;
}
</style>