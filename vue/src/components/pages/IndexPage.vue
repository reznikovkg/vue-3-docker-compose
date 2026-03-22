<template>
  <div class="c-index-page">
    <!--
    Index

    <div>
      <RouterLink :to="{ name: $routes.EXAMPLE }">
       To Example
      </RouterLink>
    </div>
    -->
    <GamwMenu
      v-if="showMenu"
      :colorsCount="gameSettings.colorsCount"
      :targetColor="gameSettings.targetColor"
      :intensity="gameSettings.intensity"
      :scoreHit="gameSettings.scoreHit"
      :scoreMiss="gameSettings.scoreMiss"
      @start="(settings) => startFromMenu(settings)"
    />

    <BubbleGame
      v-else
      :colorsCount="gameSettings.colorsCount"
      :targetColor="gameSettings.targetColor"
      :intensity="gameSettings.intensity"
      :scoreHit="gameSettings.scoreHit"
      :scoreMiss="gameSettings.scoreMiss"
      @finish="(res) => onFinish(res)"
    >
      <template #start-label>Играть</template>
    </BubbleGame>
  </div>
</template>

<script>
import BubbleGame from '@/components/BubbleGame.vue'
import GamwMenu from '@/components/ui/GamwMenu.vue'
import { GAME_DEFAULTS } from '@/constants/gameConfig.js'
import { mapActions } from 'vuex'

export default {
  name: 'IndexPage',

  components: {
    BubbleGame,
    GamwMenu
  },

  //Dashboard -> PreferencesModal (edit) -> Dashboard -> LiveWidget (run)
  data() {
    return {
      showMenu: true,
      gameSettings: {
        colorsCount: GAME_DEFAULTS.colorsCount,
        targetColor: GAME_DEFAULTS.targetColor,
        intensity: GAME_DEFAULTS.intensity,
        scoreHit: GAME_DEFAULTS.scoreHit,
        scoreMiss: GAME_DEFAULTS.scoreMiss
      }
    }
  },

  methods: {
    ...mapActions([
      'setLastResult'
    ]),

    startFromMenu(settings) {
      this.gameSettings = {
        ...settings
      }
      this.showMenu = false
    },

    onFinish(res) {
      const score = res && typeof res.score === 'number' ? res.score : 0
      const roundedScore = Math.round(score)
      this.setLastResult(roundedScore).then(() => {
        this.showMenu = true
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.c-index-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 24px;
  min-height: 100vh;
}
</style>
