<template>

  <Settings v-if="isStartGame === 0"></Settings>
  <Game v-if="isStartGame === 1 && isGameWon === 0"></Game>
  <EndGame v-if="isGameWon === 1"></EndGame>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'

import Settings from "@/components/ui/Settings.vue";
import Game from "@/components/ui/Game.vue";
import EndGame from "@/components/ui/EndGame.vue";

export default {
  components: {Game, Settings, EndGame},
  computed: {
    ...mapGetters({
      isStartGame: 'getIsStartedGame',
      isGameWon: 'getIsGameWon'
    })
  },
}
</script>

<style scoped lang="scss">
</style>
