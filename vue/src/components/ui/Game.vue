<template>
  <div class="game-shell">
    <div class="game-shell__top">
      <Stopwatch />
      <p class="game-shell__hint">Перетаскивай колбы, чтобы менять их порядок</p>
    </div>

    <div class="game" :style="gameStyle">
      <Flask
        v-for="i in qtyFlasks"
        :key="i"
        :style="flaskStyle"
        :index="i"
        @flask-click="() => handleClick(i)"
      ></Flask>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Flask from '@/components/ui/Flask.vue'
import Stopwatch from '@/components/ui/StopWatch.vue'

export default {
  name: 'Game',
  components: { Flask, Stopwatch },
  data() {
    return {
      columnCount: 1
    }
  },
  computed: {
    ...mapGetters({
      qtyFlasks: 'getQtyFlasks',
      clicks: 'getClicks',
      readyFlasks: 'getIsReadyFlasks',
      hardMode: 'getHardMode',
      blockedFlask: 'getNumberBlockedFlask'
    }),
    rowsCount() {
      return Math.ceil(this.qtyFlasks / this.columnCount)
    },
    gameStyle() {
      return {
        gap: `calc(3vw - ${this.rowsCount - 1}vw)`
      }
    },
    flaskStyle() {
      return {
        maxWidth: `min(100%, calc(((70vw - 6vh - 3vw - 20px) / ${this.columnCount}) * 0.95))`,
        height: `min(calc(((70vh - 6vh - 3vw - 20px) / ${this.rowsCount}) * 0.95), 100%)`,
        aspectRatio: '1/4'
      }
    }
  },
  mounted() {
    this.updateColumnCount()
    window.addEventListener('resize', this.updateColumnCount)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateColumnCount)
  },
  methods: {
    ...mapActions([
      'pickActiveFlask',
      'pickTargetFlask',
      'setNumberBlockedFlask'
    ]),
    updateColumnCount() {
      this.$nextTick(() => {
        const gameElement = this.$el.querySelector('.game')

        if (!gameElement) {
          return
        }

        const gridStyles = window.getComputedStyle(gameElement)
        const gridTemplateColumns = gridStyles.getPropertyValue('grid-template-columns')
        const columnCount = gridTemplateColumns.split(' ').filter((value) => parseFloat(value) > 0).length

        this.columnCount = columnCount || 1
      })
    },
    handleClick(index) {
      if (this.clicks === 0) {
        if (this.hardMode) {
          this.blockRandomFlask(index)
        }

        this.pickActiveFlask({ isActiveFlask: index })
        return
      }

      if (this.hardMode && index === this.blockedFlask) {
        return
      }

      this.pickTargetFlask({ isTargetFlask: index })
    },
    blockRandomFlask(activeIndex) {
      const candidates = []

      for (let i = 0; i < this.readyFlasks.length; i += 1) {
        const flaskIndex = i + 1
        const currentFlask = this.readyFlasks[i]

        if (flaskIndex !== activeIndex && currentFlask.length !== 0) {
          candidates.push(flaskIndex)
        }
      }

      if (candidates.length === 0) {
        this.setNumberBlockedFlask({ numberBlockedFlask: 0 })
        return
      }

      const randomIndex = Math.floor(Math.random() * candidates.length)
      this.setNumberBlockedFlask({ numberBlockedFlask: candidates[randomIndex] })
    }
  }
}
</script>

<style scoped lang="scss">
.game-shell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;

  &__top {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  &__hint {
    color: #516675;
    font-size: 16px;
    font-weight: 600;
    text-align: center;
  }
}

.game {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10vw, 1fr));
  justify-items: center;
  align-items: center;
  padding: 3vh;
  width: 70vw;
  height: 70vh;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(10px);
  border-radius: 34px;
  box-shadow:
    0 18px 40px rgba(41, 65, 85, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.45);
  position: relative;
}
</style>