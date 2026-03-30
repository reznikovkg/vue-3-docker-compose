<template>
  <div class="body_flask" :style="[flaskStyle, pickedFlaskStyle]" @click="() => wrapperClick()">
    <div v-if="emptySpace > 0" class="body_flask__layer"> </div>

    <div
        v-for="(layer, index) in displayLayers"
        :key="index"
        class="body_flask__layer"
        :style="{ backgroundColor: this.getColorCode(layer.color).value }">
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { FLASK_COLORS } from '@/constants/colors'

export default {
  name: "Flask",
  props: {
    index: {
      type: Number,
      required: true
    }
  },
  emits: ['click'],
  computed: {
    ...mapGetters({
      maxQtyLayers: 'getMaxQtyLayers',
      qtyColors: 'getQtyColors',
      qtyFlasks: 'getQtyFlasks',
      activeFlask: 'getActiveFlask',
      clicks: 'getClicks',
      layersActiveFlask: 'getLayersActive',
      limitsForRandom: 'getLimitsForRandom',
      readyFlasks: 'getIsReadyFlasks',
      flasks: 'getFlasks'
    }),
    layers() {
      return this.flasks[this.index - 1] || []
    },
    currentLayers() {
      if (this.activeFlask === this.index) {
        return this.layersActiveFlask
      }
      return this.layers
    },
    emptySpace() {
      if (this.currentLayers.length === 0) {
        return this.maxQtyLayers
      }
      return this.currentLayers.at(-1).fill_level_end
    },
    displayLayers() {
      return this.currentLayers.slice().reverse()
    },
    flaskStyle() {
      const rows = []

      if (this.emptySpace > 0) {
        rows.push(`${this.emptySpace}fr`)
      }

      rows.push(...this.displayLayers.map(layer => `${layer.width}fr`))

      return {
        gridTemplateRows: rows.join(' ')
      }
    },
    pickedFlaskStyle() {
      if (this.activeFlask === this.index && this.clicks === 1) {
        return {
          borderWidth: '4px',
          borderColor: '#89a9bf',
          boxShadow: '0 12px 24px rgba(70, 102, 125, 0.2)',
          transform: 'translateY(-6px) scale(1.03)'
        }
      }

      if (this.activeFlask === this.index && this.clicks === 0) {
        return {
          borderWidth: '3px',
        }
      }

      return {}
    }
  },
  created() {
    if (this.index !== this.qtyFlasks && this.layers.length === 0) {
      this.initLayers()
    }
  },
  methods: {
    ...mapActions([
      'updateActiveFlask',
      'resetFlasks',
      'updateLimitsRandom',
      'updateReadyFlasks',
      'updateFlaskLayers'
    ]),
    initLayers() {
      let curResidualFillLevel = this.maxQtyLayers
      let localLimits = [...this.limitsForRandom]
      let localReadyFlasks = this.readyFlasks.map(l => [...l])
      let localLayers = []

      while (curResidualFillLevel !== 0) {
        let lenCurLayer = Math.ceil(Math.random() * this.maxQtyLayers / 2)
        if (lenCurLayer > curResidualFillLevel) {
          continue
        }

        let curColor = Math.ceil(Math.random() * this.qtyColors)
        const adjustedParams = this.adjustColorAndLenLayerOnInit(localLayers, localLimits, curColor, lenCurLayer)

        lenCurLayer = adjustedParams.lenCurLayer
        curColor = adjustedParams.curColor

        const updatedStateLayers = this.updateLayerOnInit(
          localLayers,
          localLimits,
          localReadyFlasks,
          adjustedParams.isEdgeCase,
          lenCurLayer,
          curColor,
          curResidualFillLevel
        )

        localLimits = updatedStateLayers.localLimits
        localReadyFlasks = updatedStateLayers.localReadyFlasks
        curResidualFillLevel = updatedStateLayers.curResidualFillLevel
        localLayers = updatedStateLayers.localLayers
      }

      this.updateFlaskLayers({ index: this.index, layers: localLayers })
      this.updateLimitsRandom({ limitsForRandom: localLimits })
      this.updateReadyFlasks({ isReadyFlasks: localReadyFlasks })
    },
    adjustColorAndLenLayerOnInit(localLayers, localLimits, curColor, lenCurLayer) {
      let isEdgeCase = 0
      let prevColor = -1

      if (localLayers.length > 0) {
        prevColor = localLayers.at(-1).color
      }

      let colorsAvailable = 0
      for (let i = 0; i < localLimits.length; i++) {
        if (localLimits[i] + 1 <= this.maxQtyLayers && i + 1 !== prevColor) {
          colorsAvailable += 1
        }
      }

      if (colorsAvailable > 0) {
        while (curColor === prevColor || this.maxQtyLayers < localLimits[curColor - 1] + lenCurLayer) {
          curColor = Math.floor(Math.random() * this.qtyColors) + 1
          lenCurLayer = Math.max(1, lenCurLayer - 1)
        }
      } else {
        isEdgeCase = 1
      }

      return {
        curColor: curColor,
        lenCurLayer: lenCurLayer,
        isEdgeCase: isEdgeCase
      }
    },
    updateLayerOnInit(localLayers, localLimits, localReadyFlasks, isEdgeCase, lenCurLayer, curColor, curResidualFillLevel) {
      if (isEdgeCase === 0) {
        localLimits[curColor - 1] += lenCurLayer
        this.pushLayer(localLayers, curColor, curResidualFillLevel, curResidualFillLevel - lenCurLayer, lenCurLayer)
        localReadyFlasks[this.index - 1].push(lenCurLayer)
        curResidualFillLevel -= lenCurLayer
      } else {
        if (localLayers.length > 0) {
          const lastLayer = localLayers.at(-1)
          localLimits[lastLayer.color - 1] += curResidualFillLevel
          lastLayer.fill_level_end = 0
          lastLayer.width += curResidualFillLevel
          localReadyFlasks[this.index - 1][localReadyFlasks[this.index - 1].length - 1] += curResidualFillLevel
        }
        curResidualFillLevel = 0
      }

      return {
        localLimits: localLimits,
        localReadyFlasks: localReadyFlasks,
        curResidualFillLevel: curResidualFillLevel,
        localLayers: localLayers
      }
    },
    getColorCode(color) {
      return FLASK_COLORS[color - 1]
    },
    wrapperClick() {
      this.$emit('click')

      if (this.clicks === 1) {
        this.updateActiveFlask({ layersActive: this.layers.map(layer => ({ ...layer })) })
        return
      }

      if (this.clicks === 0) {
        const activeIndex = this.activeFlask

        if (this.index === activeIndex) {
          this.resetFlasks()
          return
        }

        this.perelivator(activeIndex)
        this.resetFlasks()

        const localReadyFlasks = this.updateCurrentChangesLocalReadyFlasks(activeIndex)
        const counter = this.countReadyFlasks(localReadyFlasks)
        this.checkWin(counter)
      }
    },
    pushLayer(layers, color, fillLevelStart, fillLevelEnd, width) {
      layers.push({
        color: color,
        fill_level_start: fillLevelStart,
        fill_level_end: fillLevelEnd,
        width: width
      })
    },
    updateLayer(layers, fillLevelEnd, width) {
      layers.at(-1).fill_level_end += fillLevelEnd
      layers.at(-1).width += width
    },
    getLocalLayers() {
      return this.layers.map(layer => ({ ...layer }))
    },
    pourIntoEmpty(tempLayersActiveFlask) {
      const activeWidth = tempLayersActiveFlask.at(-1).width
      const activeColor = tempLayersActiveFlask.at(-1).color
      const localLayers = this.getLocalLayers()

      this.pushLayer(localLayers, activeColor, this.maxQtyLayers, this.maxQtyLayers - activeWidth, activeWidth)
      tempLayersActiveFlask.pop()

      this.updateFlaskLayers({ index: this.index, layers: localLayers })
      return tempLayersActiveFlask
    },
    pourFullLayer(tempLayersActiveFlask, activeColor, targetColor, residual, activeWidth) {
      const localLayers = this.getLocalLayers()

      if (targetColor !== activeColor) {
        this.pushLayer(localLayers, activeColor, residual, residual - activeWidth, activeWidth)
      } else {
        this.updateLayer(localLayers, -activeWidth, activeWidth)
      }

      tempLayersActiveFlask.pop()
      this.updateFlaskLayers({ index: this.index, layers: localLayers })

      return tempLayersActiveFlask
    },
    pourPartOfLayer(tempLayersActiveFlask, activeColor, targetColor, residual) {
      const localLayers = this.getLocalLayers()

      if (targetColor !== activeColor) {
        this.pushLayer(localLayers, activeColor, residual, 0, residual)
      } else {
        this.updateLayer(localLayers, -residual, residual)
      }

      this.updateLayer(tempLayersActiveFlask, residual, -residual)
      this.updateFlaskLayers({ index: this.index, layers: localLayers })

      return tempLayersActiveFlask
    },
    perelivator(activeIndex) {
      let tempLayersActiveFlask = this.layersActiveFlask.map(layer => ({ ...layer }))

      if (this.layers.length > 0) {
        const residual = this.layers.at(-1).fill_level_end

        if (residual !== 0) {
          const activeWidth = tempLayersActiveFlask.at(-1).width
          const activeColor = tempLayersActiveFlask.at(-1).color
          const targetColor = this.layers.at(-1).color

          if (residual >= activeWidth) {
            tempLayersActiveFlask = this.pourFullLayer(tempLayersActiveFlask, activeColor, targetColor, residual, activeWidth)
          } else {
            tempLayersActiveFlask = this.pourPartOfLayer(tempLayersActiveFlask, activeColor, targetColor, residual)
          }
        }
      } else {
        tempLayersActiveFlask = this.pourIntoEmpty(tempLayersActiveFlask)
      }

      this.updateActiveFlask({ layersActive: tempLayersActiveFlask })
      this.updateFlaskLayers({ index: activeIndex, layers: tempLayersActiveFlask })
    },
    updateCurrentChangesLocalReadyFlasks(activeIndex) {
      let localReadyFlasks = this.readyFlasks.map(l => [...l])
      const tempLayersActiveFlask = this.layersActiveFlask.map(layer => ({ ...layer }))

      localReadyFlasks[this.index - 1] = []
      localReadyFlasks[activeIndex - 1] = []

      for (let i = 0; i < this.layers.length; i++) {
        localReadyFlasks[this.index - 1].push(this.layers[i].width)
      }

      for (let i = 0; i < tempLayersActiveFlask.length; i++) {
        localReadyFlasks[activeIndex - 1].push(tempLayersActiveFlask[i].width)
      }

      this.updateReadyFlasks({ isReadyFlasks: localReadyFlasks })
      return localReadyFlasks
    },
    countReadyFlasks(localReadyFlasks) {
      let counter = 0

      for (let i = 0; i < localReadyFlasks.length; i++) {
        if (localReadyFlasks[i][0] === this.maxQtyLayers) {
          counter += 1
        }
      }

      return counter
    },
    checkWin(counter) {
      if (counter === this.qtyColors) {
        setTimeout(() => {
          this.$router.push("/end")
        }, 1000)
      }
    }
  },
}
</script>

<style scoped lang="scss">
.body_flask {
  display: grid;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.62) 0%, rgba(235, 242, 247, 0.74) 100%);
  backdrop-filter: blur(8px);
  border-width: 2px;
  border-style: solid;
  border-color: rgba(146, 171, 189, 0.5);
  border-radius: 0 0 44px 44px;
  overflow: hidden;
  box-shadow:
    0 10px 20px rgba(41, 65, 85, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.45);
  position: relative;
  z-index: 1;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;

  &__layer {
    overflow: hidden;
  }
}
</style>