<template>
  <div class="game" :style="gameStyle">
    <Flask
      v-for="i in qtyFlasks"
      :key="i"
      :style="flaskStyle"
      :index="i"
      @click="handleClick(i)">
    </Flask>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Flask from "@/components/ui/Flask.vue";

export default {
  name: "Game",
  components: { Flask },
  data() {
    return {
      columnCount: 0,
    }
  },
  computed: {
    ...mapGetters({
      qtyFlasks: 'getQtyFlasks',
      clicks: "getClicks"
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
      'pickTargetFlask'
    ]),
    updateColumnCount() {
      this.$nextTick(() => {
        const gameElement = this.$el
        const gridStyles = window.getComputedStyle(gameElement)
        const gridTemplateColumns = gridStyles.getPropertyValue('grid-template-columns')
        const columnCount = gridTemplateColumns.split(' ').filter(x => parseFloat(x) > 0).length
        this.columnCount = columnCount
      })
    },
    handleClick(index) {
      if (this.clicks === 0) {
        this.pickActiveFlask({ isActiveFlask: index })
        return
      }

      this.pickTargetFlask({ isTargetFlask: index })
    }
  }
}
</script>

<style scoped lang="scss">
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