<template>
  <div class="game" :style="gameStyle">
    <Flask
      v-for="i in flaskOrder"
      :key="i"
      :ref="flask => flaskRefs[i] = flask"
      :style="flaskStyle"
      :index="i"
      draggable="true"
      @dragstart="(event) => onDragStart(event, i)"
      @dragover="(event) => onDragOver(event)"
      @drop="() => onDrop(i)"
      @click="() => handleClick(i)"
      @flaskUpdated="(activeIndex) => handleFlaskUpdate(activeIndex)">
    </Flask>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Flask from '@/components/ui/Flask.vue'

export default {
  name: 'Game',
  components: {Flask},
  data() {
    return {
      columnCount: 0,
      flaskRefs: {},
      flaskOrder: [],
      draggedIndex: null
    }
  },
  computed: {
    ...mapGetters([
      'getQtyFlasks',
      'getClicks',
      'getIsReadyFlasks',
      'getHardMode',
      'getNumberBlockedFlask',
      'getLayersActive',
    ]),
    rowsCount() {
      return Math.ceil(this.getQtyFlasks / this.columnCount)
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
    for (let i = 1; i <= this.getQtyFlasks; i++) {
      this.flaskOrder.push(i)
    }
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
      'resetFlasks',
      'setNumberBlockedFlask'
    ]),
    updateColumnCount() {
      this.$nextTick(() => {
        let gameElement = this.$el
        let gridStyles = window.getComputedStyle(gameElement)
        let gridTemplateColumns = gridStyles.getPropertyValue('grid-template-columns')
        let columnCount = gridTemplateColumns.split(' ').filter(x => parseFloat(x) > 0).length
        console.log(`Количество столбцов: ${columnCount}, ${gridTemplateColumns}`)
        this.columnCount = columnCount
      })
    },
    handleClick(index) {
      if (this.getClicks === 0) {
        console.log(`active ${index}`, this.getClicks)
        if (this.getHardMode) {
          this.blockFlask(index)
        }
        this.pickActiveFlask({isActiveFlask: index})
      } else {
        console.log(`target ${index}`, this.getClicks)
        if (this.getHardMode) {
          if (index !== this.getNumberBlockedFlask) {
            this.pickTargetFlask({isTargetFlask: index})
            this.setNumberBlockedFlask({numberBlockedFlask: 0})
          }
        } else {
          this.pickTargetFlask({isTargetFlask: index})
        }
      }
    },
    handleFlaskUpdate(activeIndex) {
      console.log("handleFlaskUpdate: ", activeIndex.activeIndex)
      let activeFlask = this.flaskRefs[activeIndex.activeIndex]
      if (activeFlask) {
        activeFlask.layers = this.getLayersActive.map(l => ({...l}))
      }
    },
    blockFlask(activeIndex) {
      let isReadyFlasks = this.getIsReadyFlasks
      console.log("blockFlask: ", activeIndex, isReadyFlasks[0].length)
      let isCorrect = false
      while (!isCorrect) {
        let randomIndex = Math.ceil(Math.random() * this.getQtyFlasks)
        if (isReadyFlasks[randomIndex - 1].length !== 0 && randomIndex !== activeIndex) {
          this.setNumberBlockedFlask({numberBlockedFlask: randomIndex})
          isCorrect = true
        }
      }
    },
    onDragStart(event, i) {
      event.dataTransfer.effectAllowed = 'move'
      this.draggedIndex = i
      const original = event.currentTarget
      const rect = original.getBoundingClientRect()
      console.log("rect: ", rect)
      const crt = original.cloneNode(true)
      crt.style.minWidth = `${rect.width}px`
      crt.style.height = `${rect.height}px`
      crt.style.aspectRatio = 'auto'
      crt.style.boxShadow = 'none'
      crt.style.backdropFilter = 'none'
      crt.style.position = 'absolute'
      crt.style.top = '-10000px'
      crt.style.left = '-10000px'
      document.body.appendChild(crt)
      event.dataTransfer.setDragImage(crt, rect.width / 2, rect.height / 2)
    },
    onDragOver(event) {
      event.dataTransfer.effectAllowed = 'move'
      event.preventDefault()
    },
    onDrop(i) {
      if (this.draggedIndex === null || this.draggedIndex === i)
        return
      let from = this.flaskOrder.indexOf(this.draggedIndex)
      let to = this.flaskOrder.indexOf(i)
      this.flaskOrder[from] = i
      this.flaskOrder[to] = this.draggedIndex
      console.log("flaskOrder: ", this.flaskOrder)
      this.draggedIndex = null
    },
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
    z-index: 0;
    border-radius: 40px;
  }

  @media (min-width: 1600px) {
    width: 70vw;
    height: 70vh;
  }

  @media (min-width: 1300px) and (max-width: 1600px) {
    width: 60vw;
    height: 70vh;
  }

  @media (min-width: 1000px) and (max-width: 1300px) {
    width: 55vw;
    height: 70vh;
  }

  @media (min-width: 800px) and (max-width: 1000px) {
    width: 48vw;
    height: 70vh;
  }

  @media (max-width: 800px) {
    width: 90vw;
    height: 80vh;
  }
}
</style>