<template>
  <div class="bubble-game">
    <header class="bubble-game__header header-panel">
      <div>
        <div class="header-panel__score">
          <span class="header-panel__label">Score: {{ score }}</span>
          <div class="header-panel__selection-group">
            <span class="header-panel__label">Select: </span>
            <div class="header-panel__color" :style="{ backgroundColor : this.colorMap[this.selectColor] || this.colorMap.default }"></div>
          </div>
        </div>
      </div>
      <div>
        <button class="c-button" @click="() => restartGame()">Restart</button>
      </div>
    </header>

    <main class="bubble-game__field" @click="(e) => handleFieldClick(e)">
      <Bubble
          v-for="(b, index) in activeBubbles"
          :key="b.id"
          :index="index"
          :color="colorMap[b.color] || colorMap.default"
          :size="b.size"
          :style="{ left: b.x + '%' }"
          @expired="() => removeBubble()"
      />

    </main>
  </div>
</template>

<script>
import Bubble from "@/components/ui/Bubble.vue";

export default {
  name: "BubbleGame",
  components: { Bubble },
  emits: ['finish'],
  props: {
    num: {
      default: 2,
      type: Number
    },
    selectColor: {
      default: 'default',
      type: String
    },
    intensity: {
      default: 1,
      type: Number
    },
    points: {
      default: 1,
      type: Number
    },
    fine: {
      default: 5,
      type: Number
    }
  },
  data() {
    return {
      score: 0,
      activeBubbles: [],
      spawnTimer: null,
      colorMap: {
        blue: '#0879ea',
        breeze: '#06b8a2',
        purple: '#7506dc',
        pink: '#ad39ba',
        default: '#7cafe3'
      }
    };
  },
  computed: {
    interval() {
      return 1000 / this.intensity
    }
  },
  methods: {
    initGame() {
      this.stopSpawning()
      this.score = 0
      this.activeBubbles = []
      this.addBubble()
      this.startSpawning()
    },
    startSpawning() {
      this.spawnTimer = setInterval(() => {
        this.addBubble()
      }, this.interval)
    },
    stopSpawning() {
      if (this.spawnTimer) {
        clearInterval(this.spawnTimer)
        this.spawnTimer = null
      }
    },
    addBubble() {
      const colors = Object.keys(this.colorMap);
      this.activeBubbles.push({
        id: Date.now() + Math.random(),
        color: colors[Math.floor(Math.random() * this.num)],
        size: 'medium',
        x: Math.random() * 90,
        y: 0,
        offset: Math.random() * 100,
        amplitude: 20 + Math.random() * 50
      });
    },
    check() {
      if (this.score >= 50 || this.score <= -50) {
        this.stopSpawning()
        this.$emit('finish', this.score)
      }
    },
    restartGame() {
      this.initGame()
    },
    processScore(bubbleColorName) {
      if (bubbleColorName === this.selectColor) {
        this.score += this.points
      }
      else {
        this.score -= this.fine
      }
    },
    handleFieldClick(event) {
      const elements = document.elementsFromPoint(event.clientX, event.clientY);

      const hitIndices = elements
          .filter(el => el.classList.contains('bubble'))
          .map(el => parseInt(el.getAttribute('data-index')))
          .filter(val => !isNaN(val))
          .sort((a, b) => b - a)

      hitIndices.forEach(index => {
        this.handleBubblePop(index)
      })
    },
    handleBubblePop(index) {
      const poppedBubble = this.activeBubbles[index]
      if (!poppedBubble) return
      this.processScore(poppedBubble.color)
      this.removeBubble(index)
      this.check()
    },
    removeBubble(index) {
      this.activeBubbles.splice(index, 1)
    }
  },
  beforeUnmount() {
    this.stopSpawning()
  },
  mounted() {
    this.initGame()
  }
}
</script>

<style lang="scss">
.bubble-game {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #f8f9fa;

  &__header {
    flex: 0 0 auto;
  }

  &__field {
    flex: 1 1 auto;
    position: relative;
    overflow: hidden;
    width: 100%;
  }
}

.header-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f8f9fa;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  &__score {
    display: flex;
    align-items: center;
    gap: 20px;
    font-size: 20px;
    color: #0879ea;
  }

  &__color {
    display: inline-block;
    vertical-align: middle;
    border-radius: 50%;
    width: 20px;
    height: 20px;
  }
}
</style>