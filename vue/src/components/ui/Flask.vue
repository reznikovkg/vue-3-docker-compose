<template>
  <div class="flask" :style="[flaskStyle, pickedFlaskStyle, highlightBlockedFlask]" @click="() => wrapperClick()">
    <div v-if="emptySpace > 0" class="flask__layer"> </div>

    <div
      v-for="(layer, index) in displayLayers"
      :key="index"
      class="flask__layer"
      :style="{backgroundColor: this.getColorCode(layer.color).value}">
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { mapGetters, mapActions } from 'vuex'
import { FLASK_COLORS } from '@/constants/colors'

export default {
  name: 'Flask',
  props: {
    index: {
      type: Number,
      required: true
    }
  },
  emits: ['click', 'flaskUpdated'],
  data() {
    return {
      layers: []
    }
  },
  computed: {
    ...mapGetters([
      'getMaxQtyLayers',
      'getQtyColors',
      'getQtyFlasks',
      'getActiveFlask',
      'getTargetFlask',
      'getClicks',
      'getLayersActive',
      'getLimitsForRandom',
      'getIsReadyFlasks',
      'getHardMode',
      'getNumberBlockedFlask',
      'getUser',
      'getTime',
    ]),
    flaskStyle() {
      let currentLayers
      if (this.getActiveFlask === this.index) {
        currentLayers = this.getLayersActive
      } else {
        currentLayers = this.layers
      }
      let emptySpace
      if (currentLayers.length === 0) {
        emptySpace = this.getMaxQtyLayers
      } else {
        emptySpace = currentLayers.at(-1).fill_level_end
      }
      let rows = []
      if (emptySpace > 0) {
        rows.push(`${emptySpace}fr`)
      }
      rows.push(...currentLayers.slice().reverse().map(layer => `${layer.width}fr`))

      return {
        gridTemplateRows: rows.join(' ')
      }
    },
    pickedFlaskStyle() {
      console.log('counting...')
      if (this.getActiveFlask === this.index && this.getClicks === 1) {
        return {
          borderWidth: '5px',
          borderColor: '#5b9cc3',
          boxShadow: '0 10px 30px 0 #9ad2ef, inset 0 0px 30px 0 #66b3dc',
          transform: 'scale(1.1)'
        }
      } else if (this.getActiveFlask === this.index && this.getClicks === 0) {
        return {
          borderWidth: '4px',
        }
      }
      return {}
    },
    emptySpace() {
      let currentLayers
      if (this.getActiveFlask === this.index) {
        currentLayers = this.getLayersActive
      } else {
        currentLayers = this.layers
      }
      if (currentLayers.length === 0) {
        return this.getMaxQtyLayers
      } else {
        return currentLayers.at(-1).fill_level_end
      }
    },
    displayLayers() {
      let currentLayers
      if (this.getActiveFlask === this.index) {
        currentLayers = this.getLayersActive
      } else {
        currentLayers = this.layers
      }
      return currentLayers.slice().reverse()
    },
    highlightBlockedFlask() {
      if (this.getNumberBlockedFlask === this.index) {
        return {
          backgroundColor: 'rgba(251, 224, 224, 0.5)',
          borderColor: '#913c3c',
          borderWidth: '5px',
          boxShadow: '0 10px 30px 0 #612e2e, inset 0 0px 30px 0 #7e2b2b',
          transform: 'scale(1.1)'
        }
      }
    }
  },
  created() {
    if (this.index !== this.getQtyFlasks) {
      this.initLayers()
    }
  },
  methods: {
    ...mapActions([
      'updateActiveFlask',
      'resetFlasks',
      'updateLimitsRandom',
      'updateReadyFlasks',
      'updateIsGameWon'
    ]),
    initLayers() {
      let curResidualFillLevel = this.getMaxQtyLayers
      console.log(curResidualFillLevel)
      let localLimits = [...this.getLimitsForRandom]
      let localReadyFlasks = this.getIsReadyFlasks.map(l => [...l])
      while (curResidualFillLevel !== 0) {
        let lenCurLayer = Math.ceil(Math.random() * this.getMaxQtyLayers / 2)
        if (lenCurLayer > curResidualFillLevel) {
          continue
        }
        let curColor = Math.ceil(Math.random() * this.getQtyColors)
        console.log("limit: ", curColor, this.getMaxQtyLayers)
        let adjustedParams = this.adjustColorAndLenLayerOnInit(localLimits, curColor, lenCurLayer)
        lenCurLayer = adjustedParams.lenCurLayer
        curColor = adjustedParams.curColor
        let isEdgeCase = adjustedParams.isEdgeCase
        let updatedStateLayers = this.updateLayerOnInit(localLimits, localReadyFlasks, isEdgeCase, lenCurLayer, curColor, curResidualFillLevel)
        localLimits = updatedStateLayers.localLimits
        localReadyFlasks = updatedStateLayers.localReadyFlasks
        curResidualFillLevel = updatedStateLayers.curResidualFillLevel
      }
      this.updateLimitsRandom({limitsForRandom: localLimits})
      this.updateReadyFlasks({isReadyFlasks: localReadyFlasks})
      console.log(this.layers)
    },
    adjustColorAndLenLayerOnInit(localLimits, curColor, lenCurLayer) {
      let isEdgeCase = 0
      let prevColor
      if (this.layers.length > 0) {
        prevColor = this.layers.at(-1).color
      } else {
        prevColor = -1
      }
      let colorsAvailable = 0
      for (let i = 0; i < localLimits.length; i++) {
        if (localLimits[i] + 1 <= this.getMaxQtyLayers && (i + 1) !== prevColor) {
          colorsAvailable += 1
        }
      }
      if (colorsAvailable > 0) {
        while (curColor === prevColor || this.getMaxQtyLayers < localLimits[curColor - 1] + lenCurLayer) {
          curColor = Math.floor(Math.random() * this.getQtyColors) + 1
          lenCurLayer = Math.max(1, lenCurLayer - 1)
        }
      } else {
        isEdgeCase = 1
      }
      return {curColor: curColor, lenCurLayer: lenCurLayer, isEdgeCase: isEdgeCase}
    },
    updateLayerOnInit(localLimits, localReadyFlasks, isEdgeCase, lenCurLayer, curColor, curResidualFillLevel) {
      if (isEdgeCase === 0) {
        localLimits[curColor - 1] += lenCurLayer
        this.pushLayer(this.layers, curColor, curResidualFillLevel, curResidualFillLevel - lenCurLayer, lenCurLayer)
        localReadyFlasks[this.index - 1].push(lenCurLayer)
        curResidualFillLevel -= lenCurLayer
      } else {
        console.log("counter2 edge: ")
        if (this.layers.length > 0) {
          let lastLayer = this.layers.at(-1)
          localLimits[lastLayer.color - 1] += curResidualFillLevel
          lastLayer.fill_level_end = 0
          lastLayer.width += curResidualFillLevel
          localReadyFlasks[this.index - 1][localReadyFlasks[this.index - 1].length - 1] += curResidualFillLevel
        }
        curResidualFillLevel = 0
      }
      return {localLimits: localLimits, localReadyFlasks: localReadyFlasks, curResidualFillLevel: curResidualFillLevel}
    },
    getColorCode(color) {
      return FLASK_COLORS[color - 1]
    },
    wrapperClick() {
      this.$emit('click')
      console.log("flask click:", this.getClicks, "index: ", this.index)
      if (this.getClicks === 1) {
        if (this.getHardMode) {
          if (this.getNumberBlockedFlask !== this.index) {
            console.log("flask click 1 nonp hard  :", this.getClicks)
            this.updateActiveFlask({layersActive: this.layers})
          }
        } else {
          console.log("flask click 1 nonp  :", this.getClicks)
          this.updateActiveFlask({layersActive: this.layers})
        }
      }
      if (this.getClicks === 0) {
        console.log("flask click 0 p  :", this.getClicks)
        let activeIndex = this.getActiveFlask
        if (this.index === activeIndex) {
          this.resetFlasks()
          return
        }
        this.perelivator(activeIndex)
        this.resetFlasks()
        let localReadyFlasks = this.updateCurrentChangesLocalReadyFlasks(activeIndex)
        let counter = this.countReadyFlasks(localReadyFlasks)
        this.checkWin(counter)
      }
    },
    pushLayer(layers, color, fillLevelStart, fillLevelEnd, width) {
      layers.push({
        'color': color,
        'fill_level_start': fillLevelStart,
        'fill_level_end': fillLevelEnd,
        'width': width
      })
    },
    updateLayer(layers, fillLevelEnd, width) {
      layers.at(-1).fill_level_end += fillLevelEnd
      layers.at(-1).width += width
    },
    pourIntoEmpty(tempLayersActiveFlask) {
      let activeWidth = tempLayersActiveFlask.at(-1).width
      let activeColor = tempLayersActiveFlask.at(-1).color
      this.pushLayer(this.layers, activeColor, this.getMaxQtyLayers, this.getMaxQtyLayers - activeWidth, activeWidth)
      tempLayersActiveFlask.pop()
      return tempLayersActiveFlask
    },
    pourFullLayer(tempLayersActiveFlask, activeColor, targetColor, residual, activeWidth) {
      if (targetColor !== activeColor) {
        this.pushLayer(this.layers, activeColor, residual, residual - activeWidth, activeWidth)
        tempLayersActiveFlask.pop()
      } else {
        this.updateLayer(this.layers, -activeWidth, activeWidth)
        tempLayersActiveFlask.pop()
      }
      return tempLayersActiveFlask
    },
    pourPartOfLayer(tempLayersActiveFlask, activeColor, targetColor, residual) {
      if (targetColor !== activeColor) {
        this.pushLayer(this.layers, activeColor, residual, 0, residual)
        this.updateLayer(tempLayersActiveFlask, residual, -residual)
      } else {
        this.updateLayer(this.layers, -residual, residual)
        this.updateLayer(tempLayersActiveFlask, residual, -residual)
      }
      return tempLayersActiveFlask
    },
    perelivator(activeIndex) {
      let tempLayersActiveFlask = this.getLayersActive.map(l => ({...l}))
      if (this.layers.length > 0) {
        let targetColor = this.layers.at(-1).color
        let residual = this.layers.at(-1).fill_level_end
        if (residual !== 0) {
          let activeWidth = tempLayersActiveFlask.at(-1).width
          let activeColor = tempLayersActiveFlask.at(-1).color
          if (residual >= activeWidth) {
            tempLayersActiveFlask = this.pourFullLayer(tempLayersActiveFlask, activeColor, targetColor, residual, activeWidth)
          } else {
            tempLayersActiveFlask = this.pourPartOfLayer(tempLayersActiveFlask, activeColor, targetColor, residual)
          }
        }
      } else {
        tempLayersActiveFlask = this.pourIntoEmpty(tempLayersActiveFlask)
      }
      this.updateActiveFlask({layersActive: tempLayersActiveFlask})
      this.$emit('flaskUpdated', { activeIndex: activeIndex })
      console.log("target: ", this.layers, "active: ", tempLayersActiveFlask)
    },
    updateCurrentChangesLocalReadyFlasks(activeIndex) {
      console.log("updateCurrentChangesLocalReadyFlasks")
      let localReadyFlasks = this.getIsReadyFlasks.map(l => [...l])
      let tempLayersActiveFlask = this.getLayersActive.map(l => ({...l}))
      localReadyFlasks[this.index - 1] = []
      localReadyFlasks[activeIndex - 1] = []
      for (let i = 0; i < this.layers.length; i++) {
        localReadyFlasks[this.index - 1].push(this.layers[i].width)
      }
      for (let i = 0; i < tempLayersActiveFlask.length; i++) {
        localReadyFlasks[activeIndex - 1].push(tempLayersActiveFlask[i].width)
      }
      this.updateReadyFlasks({isReadyFlasks: localReadyFlasks})
      return localReadyFlasks
    },
    countReadyFlasks(localReadyFlasks) {
      let counter = 0
      for (let i = 0; i < localReadyFlasks.length; i++) {
        console.log("countReadyFlasks: ", localReadyFlasks[i][0], this.getMaxQtyLayers)
        if (localReadyFlasks[i][0] === this.getMaxQtyLayers) {
          counter += 1
        }
      }
      return counter
    },
    saveGame() {
      let uid = this.getUser
      if (!uid) return

      addDoc(collection(db, 'users', uid, 'games'), {
        qty_flasks: this.getQtyFlasks,
        qty_colors: this.getQtyColors,
        qty_layers: this.getMaxQtyLayers,
        is_hard_mode: this.getHardMode,
        time: this.getTime,
      }).catch(err => console.error(err))
    },
    checkWin(counter) {
      console.log("checkWin: ", counter)
      if (counter === this.getQtyColors) {
        console.log("game end")
        this.saveGame()
        setTimeout(() => {
          this.$router.push("/end")
        }, 1000)
      }
    }
  },
}
</script>

<style scoped lang="scss">
.flask {
  display: grid;
  background-color: rgba(224, 251, 251, 0.5);
  backdrop-filter: blur(2px);
  border-width: 4px;
  border-style: solid;
  border-color: #6bc1ed;
  border-radius: 0 0 50px 50px;
  overflow: hidden;
  box-shadow: 0 10px 18px 0 #9ad2ef,
              inset 0 0px 18px 0 #66b3dc;
  position: relative;
  z-index: 1;

  &__layer {
    overflow: hidden;
    backdrop-filter: blur(3px);
  }
}

</style>