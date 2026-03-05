<template>
  <div class="game" ref="game" @mousemove="(e) => comMouseMove(e)">
    <div class="game__hud">
      <div class="game__time">Время: {{ formattedTime }}</div>

      <div class="game__health-bar">
        <div class="game__health-label">
          {{ Math.ceil(player.health) }} / {{ player.maxHealth }} HP
        </div>
        <div class="game__health-fill" :style="{ width: healthPercent + '%' }"></div>
      </div>
    </div>

    <div 
      class="game__world"
      :style="{ transform: `translate(${-camera.x}px, ${-camera.y}px)` }"
    >
      <div
        class="game__player"
        :style="{
          left: player.x + 'px',
          top: player.y + 'px'
        }"
      ></div>

      <div
        v-for="b in bullets"
        :key="b.id"
        class="game__bullet"
        :style="{
          left: b.x + 'px',
          top: b.y + 'px'
        }"
      ></div>

      <div
        v-for="e in enemies"
        :key="e.id"
        class="game__enemy"
        :style="{
          left: e.x + 'px',
          top: e.y + 'px'
        }"
      ></div>
    </div>
    
    <div v-if="!gameActive" class="game__game-over">
      <h2 class="game__game-over-title">GAME OVER</h2>
      <p class="game__game-over-time">Время: {{ formattedTime }}</p>
      <button class="game__game-over-button" @click="() => restartGame()">НОВАЯ ИГРА</button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'GameVampires',
  data() {
    return {
      animationFrame: null,
      loop: null,
    }
  },
  computed: {
    ...mapState('game', [
      'player', 
      'gameActive', 
      'bullets', 
      'enemies',
      'camera'
    ]),
    ...mapGetters('game', [
      'getFormattedTime', 
      'getHealthPercent'
    ]),
    formattedTime() {
      return this.getFormattedTime
    },
    healthPercent() {
      return this.getHealthPercent
    },
  },
  mounted() {
    this.loop = (timestamp) => {
      if (this.gameActive) 
        this.gameLoop(timestamp)
      this.animationFrame = requestAnimationFrame(this.loop)
    }

    this.init()
    window.addEventListener('keydown', this.comKeyDown)
    window.addEventListener('keyup', this.comKeyUp)
    window.addEventListener('resize', this.comResize)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.comKeyDown)
    window.removeEventListener('keyup', this.comKeyUp)
    window.removeEventListener('resize', this.comResize)
    cancelAnimationFrame(this.animationFrame)
  },
  methods: {
    ...mapActions('game', [
      'gameLoop',
      'resetGame',
      'handleKeyDown',
      'handleKeyUp',
      'setMousePosition',
      'setWorldSize',
      'setPlayerPosition',
    ]),
    
    comMouseMove(e) {
      const rect = this.$refs.game.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      this.setMousePosition({ x, y })
    },

    comKeyDown(e) {
      if (e.key.startsWith('Arrow')) 
        e.preventDefault()
      this.handleKeyDown(e)
    },
    
    comKeyUp(e) {
      if (e.key.startsWith('Arrow')) 
        e.preventDefault()
      this.handleKeyUp(e)
    },

    comResize() {
      const width = window.innerWidth
      const height = window.innerHeight
      this.setWorldSize({ width, height })
    },

    init() {
      this.resetGame()
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = requestAnimationFrame(this.loop)
    },

    restartGame() {
      this.init()
    },
  },
}
</script>

<style scoped lang="scss">
.game {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #308815;

  &__hud {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    color: #fff;
    font-family: monospace;
    font-size: 18px;
    background: rgba(0, 0, 0, 0.7);
    padding: 10px 20px;
    border-radius: 5px;
    border: 1px solid #444;
  }

  &__world {
    position: absolute;
    left: 0;
    top: 0;
    will-change: transform;
  }

  &__time {
    margin-bottom: 5px;
    color: #aaa;
  }

  &__health-bar {
    width: 200px;
    height: 25px;
    background-color: #000000;
    border: 1px solid #7d7d7d;
    border-radius: 3px;
    overflow: hidden;
    position: relative;
  }

  &__health-label {
    position: absolute;
    width: 100%;
    text-align: center;
    line-height: 23px;
    z-index: 2;
    color: #fff;
    font-size: 14px;
  }

  &__health-fill {
    height: 100%;
    background-color: #4caf50;
    transition: width 0.1s;
  }

  &__player {
    position: absolute;
    width: 40px;
    height: 40px;
    background-color: #0080ff;
    border: 2px solid #ffffff;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    will-change: left, top;
  }

  &__bullet {
    position: absolute;
    width: 8px;
    height: 8px;
    background: #e5ff00;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    will-change: left, top;
  }

  &__enemy {
    position: absolute;
    width: 32px;
    height: 32px;
    background: #ff0000;
    border: 2px solid #ffffff;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    will-change: left, top;
  }

  &__game-over {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.9);
    padding: 30px 50px;
    border-radius: 5px;
    text-align: center;
    color: #fff;
    z-index: 20;
    border: 2px solid #ff0000;
  }

  &__game-over-title {
    font-size: 36px;
    margin-bottom: 15px;
    color: #ff0000;
  }

  &__game-over-time {
    font-size: 18px;
    margin-bottom: 20px;
    font-family: monospace;
  }

  &__game-over-button {
    padding: 10px 30px;
    font-size: 16px;
    background: #4caf50;
    color: #fff;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-weight: bold;

    &:hover {
      background: #45a049;
    }
  }
}
</style>