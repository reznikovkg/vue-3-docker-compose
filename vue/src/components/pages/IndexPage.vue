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
    <!--
    <ComponentName
      v-if="condition"
      :propA="state.propA"
      :propB="state.propB"
      :propC="state.propC"
      :propD="state.propD"
      @eventName="handleEvent"
    />
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

    <!--
    <div class="c-stats">
      <div class="c-stats__row">LIST POWER: {{ listPower }}</div>

      <div class="c-stats__row">
        <button type="button" class="c-stats__btn" @click="() => addEvent(1)">
          +1 event
        </button>

        <button type="button" class="c-stats__btn c-stats__btn--red" @click="() => addEvent(-5)">
          -5 event
        </button>
      </div>

      <div class="c-stats__list">
        <div v-for="(item, index) in list" :key="index" class="c-stats__row">
          {{ item.t }}
        </div>
      </div>
    </div>
    -->
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

  // Подумать что можно сделать!!!
  //Dashboard -> PreferencesModal (edit) -> Dashboard -> LiveWidget (run)
  // Мб вынести в отдельный дефол default.js
  data() {
    return {
      showMenu: true,
      lastResultScore: 0,
      gameSettings: {
        colorsCount: GAME_DEFAULTS.colorsCount,
        targetColor: GAME_DEFAULTS.targetColor,
        intensity: GAME_DEFAULTS.intensity,
        scoreHit: GAME_DEFAULTS.scoreHit,
        scoreMiss: GAME_DEFAULTS.scoreMiss
      }
    }
  },

  computed: {
    list() {
      return this.$store.getters['list/getList']
    },

    // listPower() {
    //   return this.$store.getters['list/getListPower']
    // }
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
      this.lastResultScore = roundedScore
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

.c-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;

  &__row {
    display: flex;
    gap: 8px;
    line-height: 1.4;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__btn {
    width: fit-content;
    padding: 6px 10px;
    border: 1px solid #ff4d4f;
    border-radius: 6px;
    cursor: pointer;
    color: #ff4d4f;
  }
}
</style>
