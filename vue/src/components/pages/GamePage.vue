<template>
  <div class = "play-zone">
    <div v-if = "isFinished" class = "play-zone__overlay">
      <div class = "play-zone__overlay__panel">
        <h2>Время закончилось!</h2>
        <p>Твой результат: {{ finalPoints.toFixed(1) }}</p>
        <button class = "play-zone__overlay__btn" @click = "() => restartMatch()">Ещё раз</button>
        <RouterLink
            :to = "{ name: $routes.MAINMENU }"
            class = "play-zone__overlay__btn play-zone__overlay__btn--quiet">
          На главную
        </RouterLink>
      </div>
    </div>
    <BubbleGame
        ref = "gameInstance"
        :totalColors = "storedColorsCount"
        :targetColor = "storedTargetColor"
        :spawnRate = "storedSpawnSpeed"
        :pointsForCorrect = "storedPointsSuccess"
        :pointsForWrong = "storedPointsFail"
        :onStart = "handleStart"
        :gameDuration = "60"
        @score = "(data) => updateScore(data)"
        @finish = "(result) => gameOver(result)"
    />
  </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex'
import BubbleGame from './../game/BubbleGame.vue'

export default {
  name: 'GamePage',
  components: {
    BubbleGame
  },
  data() {
    return {
      isFinished: false,
      finalPoints: 0,
      currentPoints: 0
    }
  },
  computed: {
    ...mapGetters({
      storedColorsCount: 'colorsCount',
      storedTargetColor: 'targetColor',
      storedSpawnSpeed: 'spawnRate',
      storedPointsSuccess: 'pointsCorrect',
      storedPointsFail: 'pointsWrong'
    })
  },
  methods: {
    handleStart() {
      this.isFinished = false
      this.finalPoints = 0
      this.currentPoints = 0
    },
    updateScore(scoreData: { points: number; count: number }) {
      this.currentPoints += scoreData.points
    },
    gameOver(result: { score: number; timeElapsed: number }) {
      this.finalPoints = result.score
      this.isFinished = true
    },
    restartMatch() {
      this.isFinished = false
      if (this.$refs.gameInstance) {
        (this.$refs.gameInstance as any).restartGame()
      }
    },
  }
}
</script>

<style scoped lang="scss">
$bgDark: #fff9f0;
$bgElement: #fce9e1;
$bgElementHover: #f5d9cd;
$textLight: #a58d7b;
$textMuted: #d39974;
$accentPastel: #f3b3a1;
$borderColor: #f0d9cf;
$overlayBg: rgba(250, 240, 235, 0.85);

@mixin action-btn {
  display: block;
  width: 100%;
  padding: 15px 30px;
  margin: 10px 0;
  font-size: 1.2rem;
  font-weight: 600;
  border: none;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-decoration: none;
  text-align: center;
  background: $accentPastel;
  color: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba($accentPastel, 0.4);
    background: darken($accentPastel, 8%);
  }

  &:active {
    transform: translateY(0);
  }
}

.play-zone {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;

  &__overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: $overlayBg;
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 150;
    user-select: none;

    &__panel {
      background: $bgDark;
      padding: 40px;
      border-radius: 30px;
      border: 2px solid $borderColor;
      text-align: center;
      color: $textLight;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);

      h2 {
        font-size: 2.5rem;
        margin-bottom: 20px;
        color: $accentPastel;
        font-weight: 400;
        text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.8);
      }

      p {
        font-size: 1.5rem;
        margin-bottom: 30px;
        color: $textMuted;
      }
    }

    &__btn {
      @include action-btn;
    }

    &__btn--quiet {
      background: $bgElement;
      color: $textLight;

      &:hover {
        background: $bgElementHover;
        box-shadow: 0 6px 15px rgba($accentPastel, 0.3);
      }
    }
  }
}
</style>