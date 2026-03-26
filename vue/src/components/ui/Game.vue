<template>
  <div class="game" :style="gameStyle">
    <Flask
        v-for="i in qtyFlasks"
        :ref="flask => flaskRefs[i] = flask"
        :style="flaskStyle" :index="i"
        @click="() => handleClick(i)"
        @flaskUpdated="(activeIndex) => handleFlaskUpdate(activeIndex)">
    </Flask>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Flask from "@/components/ui/Flask.vue";

export default {
  name: "Game",
  components: {Flask},
  data() {
    return {
      columnCount: 0,
      flaskRefs: {}
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
      'pickTargetFlask',
      'resetFlasks'
    ]),
    updateColumnCount() {
      this.$nextTick(() => {
        const gameElement = this.$el
        const gridStyles = window.getComputedStyle(gameElement)
        const gridTemplateColumns = gridStyles.getPropertyValue('grid-template-columns')
        const columnCount = gridTemplateColumns.split(' ').filter(x => parseFloat(x) > 0).length
        console.log(`Количество столбцов: ${columnCount}, ${gridTemplateColumns}`)
        this.columnCount = columnCount
      })
    },
    handleClick(index) {
      if (this.clicks === 0) {
        console.log(`active ${index}`, this.clicks)
        this.pickActiveFlask({isActiveFlask: index})
      } else {
        console.log(`target ${index}`, this.clicks)
        this.pickTargetFlask({isTargetFlask: index})
      }
    },
    handleFlaskUpdate(activeIndex) {
      console.log("handleFlaskUpdate: ", activeIndex.activeIndex)
      const activeFlask = this.flaskRefs[activeIndex.activeIndex]
      if (activeFlask) {
        activeFlask.layers = activeFlask.layersActiveFlask.map(l => ({...l}))
      }
    }
  }
}
</script>

<style scoped lang="scss">
  @use '@/assets/rk4.scss' as *;

  .game {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(10vw, 1fr));
    justify-items: center;
    align-items: center;
    //gap: 3vw;
    padding: 3vh;
    width: 70vw;
    height: 70vh;
    background-color: #fffaee;
    border-radius: 30px;
    border: 3px solid #194d6c;
    box-shadow: 0 9px 18px 0 #194d6c;
    position: relative;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-repeat: no-repeat;
      background-size: 100% 100%;
      pointer-events: none;
      //mix-blend-mode: overlay;
      background-image: RK4(1000, 0, 10, 10, 200, 10, 2, "game");
      z-index: 0;
      border-radius: 40px;
    }
  }

</style>