<template>
  <div class="game-page">
    <div v-if="gameFinished" class="game-page__overlay">
      <div class="game-page__overlay__content">
        <h2>Время вышло!</h2>
        <p>Ваш счёт: {{ finalScore.toFixed(1) }}</p>
        <button class="game-page__overlay__button" @click="() => restartGame()">Играть снова</button>
        <RouterLink 
            :to="{ name: $routes.MAINMENU }" 
            class="game-page__overlay__button game-page__overlay__button--menu" 
            @click="() => playClickSound()">
          В меню
        </RouterLink>
      </div>
    </div>

    <BubbleGame
      v-if="gameActive"
      ref="bubbleGame"
      :totalColors="getTotalColors"
      :targetColor="getTargetColor"
      :spawnRate="getSpawnRate"
      :pointsForCorrect="getPointsForCorrect"
      :pointsForWrong="getPointsForWrong"
      :onStart="handleGameStart"
      :gameDuration="40"
      @score="(data) => handleScore(data)"
      @finish="(result)  => handleFinish(result)"
    />
  </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex'
import BubbleGame from './../game/BubbleGame.vue'
import soundManager from './../../utils/soundManager';

export default {
  name: 'GamePage',
  components: {
    BubbleGame
  },
  data() {
    return {
      gameFinished: false,
      finalScore: 0,
      currentScore: 0,

      gameActive: true
    }
  },
  computed: {
    ...mapGetters([
      'getTotalColors',
      'getTargetColor',
      'getSpawnRate',
      'getPointsForCorrect',
      'getPointsForWrong'
    ])
  },
  beforeRouteLeave(to, from, next) {
    
    if (this.$refs.bubbleGame) {
      this.$refs.bubbleGame.cleanupGame()
    }
    
    this.gameActive = false
    this.gameFinished = false
    
    next()
  },
  methods: {
    handleGameStart() {
      this.gameFinished = false
      this.finalScore = 0
      this.currentScore = 0
    },
    handleScore(scoreData: { points: number; count: number }) {
      this.currentScore += scoreData.points
    },
    handleFinish(result: { score: number; timeElapsed: number }) {
      this.finalScore = result.score
      this.gameFinished = true
    },
    restartGame() {
      this.playClickSound()
      this.gameFinished = false
      if (this.$refs.bubbleGame) {
        (this.$refs.bubbleGame as any).restartgame()
      }
    },
    playClickSound() {
      soundManager.play('click')
    }
  }
}
</script>

<style scoped lang="scss">
.game-page {
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
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 150;
    backdrop-filter: blur(5px);
    user-select: none;

    &__content {
      background: #565b61;
      padding: 40px;
      border-radius: 20px;
      text-align: center;
      color: white;
      max-width: 400px;
      width: 90%;

      h2 {
        font-size: 2.5rem;
        margin-bottom: 20px;
        color: #ff6b6b;
      }

      p {
        font-size: 1.5rem;
        margin-bottom: 30px;
      }
    }

    &__button {
      display: block;
      width: 100%;
      padding: 15px 30px;
      margin: 10px 0;
      font-size: 1.2rem;
      font-weight: 600;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-decoration: none;
      text-align: center;
      background: #00d389;
      color: white;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        background: darken(#00d389, 10%);
      }

      &--menu {
        background: #3a3f44;

        &:hover {
          background: #4a4f54;
        }
      }
    }
  }
}
</style>