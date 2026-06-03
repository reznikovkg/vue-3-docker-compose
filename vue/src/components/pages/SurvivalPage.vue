<template>
  <div
    class = "survival-page"
    @mousemove = "(event) => handleMouseMove(event)"
  >
    <StatusBar :stats = "getStatus" />

    <Survivor
      :x = "getSurvivorScreen.x"
      :y = "getSurvivorScreen.y"
    />

    <Projectile
      v-for = "projectile in getScreenProjectiles"
      :key = "projectile.id"
      :projectile = "projectile"
    />

    <Projectile
      v-for = "projectile in getScreenEnemyProjectiles"
      :key = "projectile.id"
      :projectile = "projectile"
    />

    <Monster
      v-for = "monster in getScreenMonsters"
      :key = "monster.id"
      :monster = "monster"
    />

    <div
      v-for = "effect in getScreenEffects"
      :key = "effect.id"
      class = "survival-page__effect"
      :style = "effect.style"
    >
    </div>

    <PauseOverlay
      v-if = "getPaused || getGameOver"
      :game-over = "getGameOver"
      @resume = "() => handlePause()"
      @restart = "() => restartGame()"
    />

    <UpgradeOverlay
      v-if = "getPaused && !getGameOver"
      :stats = "getStatus"
      :prices = "getPrices"
      @heal = "() => buyHeal()"
      @damage = "() => buyDamage()"
      @mana = "() => buyMana()"
      @max-hp = "() => buyMaxHp()"
      @max-mana = "() => buyMaxMana()"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import Survivor from './../ui/Survivor.vue'
import Projectile from './../ui/Projectile.vue'
import Monster from './../ui/Monster.vue'
import StatusBar from './../ui/StatusBar.vue'
import PauseOverlay from './../ui/PauseOverlay.vue'
import UpgradeOverlay from './../ui/UpgradeOverlay.vue'

export default {
  name: 'SurvivalPage',

  components: {
    Survivor,
    Projectile,
    Monster,
    StatusBar,
    PauseOverlay,
    UpgradeOverlay
  },

  data() {
    return {
      lastFrameTime: 0,
      animationFrame: null
    }
  },

  computed: {
    ...mapGetters('survival', [
      'getSurvivorScreen',
      'getStatus',
      'getPrices',
      'getPaused',
      'getGameOver',
      'getScreenProjectiles',
      'getScreenEnemyProjectiles',
      'getScreenMonsters',
      'getScreenEffects'
    ])
  },

  mounted() {
    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)
    window.addEventListener('resize', this.handleResize)

    this.handleResize()
    this.lastFrameTime = performance.now()
    this.startGame()
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('keyup', this.handleKeyUp)
    window.removeEventListener('resize', this.handleResize)

    cancelAnimationFrame(this.animationFrame)
  },

  methods: {
    ...mapActions('survival', [
      'setKey',
      'setMouse',
      'setViewport',
      'togglePause',
      'restartGame',
      'runFrame',
      'buyHeal',
      'buyDamage',
      'buyMana',
      'buyMaxHp',
      'buyMaxMana',
      'useAreaDamage',
      'useDeathShot'
    ]),

    handleResize() {
      this.setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      })
    },

    handleMouseMove(event) {
      this.setMouse({
        x: event.clientX,
        y: event.clientY
      })
    },

    handleKeyDown(event) {
      this.setKey({
        key: event.key,
        value: true
      })

      if (event.key === 'Escape') {
        this.handlePause()
      }

      if (event.key === 'q' || event.key === 'Q') {
        this.useAreaDamage()
      }

      if (event.key === 'e' || event.key === 'E') {
        this.useDeathShot()
      }
    },

    handleKeyUp(event) {
      this.setKey({
        key: event.key,
        value: false
      })
    },

    handlePause() {
      this.togglePause()
    },

    startGame() {
      const currentTime = performance.now()
      const deltaTime = (currentTime - this.lastFrameTime) / 1000

      this.lastFrameTime = currentTime

      this.runFrame({
        currentTime,
        deltaTime
      })
        .then(() => {
          this.animationFrame = requestAnimationFrame(this.startGame)
        })
    }
  }
}
</script>

<style scoped lang="scss">
.survival-page {
  position: relative;

  width: 100vw;
  height: 100vh;

  overflow: hidden;
  background: #202020;

  &__effect {
    position: absolute;

    border: 2px solid #00ffff;
    border-radius: 50%;
    pointer-events: none;
  }
}
</style>