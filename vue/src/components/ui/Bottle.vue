<template>
  <div
    :class = "bottleClasses"
    :style = "moveStyle"
    @mousedown = "(e) => onMouseDown(e)"
    @click = "() => onClick()"
  >
    <div v-if = "isBlocked" class = "bottle__lock">Block</div>
    <div class = "bottle__inner">
      <div
        v-for = "(color, index) in displayLayers" :key = "index"
        class = "bottle__layer"
        :style = "{
          backgroundColor: color,
          height: layerHeight + '%'
        }"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Bottle",
  props: {
    layers: {
      type: Array,
      default: () => []
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    maxLayers: {
      type: Number,
      default: 4
    },
    isBlocked: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select', 'move-start', 'move-swap', 'move-end'],
  data() {
    return {
      isMoving: false,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0
    }
  },
  computed: {
    bottleClasses() {
      return ['bottle', {
        'bottle--selected': this.isSelected,
        'bottle--blocked': this.isBlocked,
        'bottle--moving': this.isMoving
      }]
    },
    layerHeight() {
      return 100 / this.maxLayers
    },
    displayLayers() {
      return this.layers.slice().reverse()
    },
    moveStyle() {
      if (!this.isMoving) return {}
      return {
        transform: `translate(${this.offsetX}px, ${this.offsetY}px)`,
        zIndex: 1000,
        transition: 'none', // Отключаем анимацию во время перетаскивания
      }
    }
  },
  methods: {
    onClick() {
      if (!this.isMoving || (Math.abs(this.offsetX) < 3 && Math.abs(this.offsetY) < 3)) {
        this.$emit('select')
      }
    },
    onMouseDown(event) {
      if (this.isBlocked) return
      const rect = this.$el.getBoundingClientRect()
      const initialMouseX = event.clientX
      const initialMouseY = event.clientY
      const shiftX = initialMouseX - rect.left
      const shiftY = initialMouseY - rect.top
      this.isMoving = false
      const onMouseMove = (e) => {
        if (!this.isMoving && (Math.abs(e.clientX - initialMouseX) > 3 || Math.abs(e.clientY - initialMouseY) > 3)) {
          this.isMoving = true
          this.$emit('move-start')
        }
        if (this.isMoving) {
          const parentRect = this.$el.parentElement.getBoundingClientRect()
          this.offsetX = e.clientX - shiftX - (this.$el.offsetLeft + parentRect.left)
          this.offsetY = e.clientY - shiftY - (this.$el.offsetTop + parentRect.top)
          const target = document.elementFromPoint(e.clientX, e.clientY)
          const targetBottle = target?.closest('.bottle')
          if (targetBottle && targetBottle !== this.$el) {
            this.$emit('move-swap', targetBottle)
          }
        }
      }
      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        if (this.isMoving) {
          this.isMoving = false
          this.offsetX = 0
          this.offsetY = 0
          this.$emit('move-end')
        }
      }
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }
  }
}
</script>

<style scoped lang = "scss">
.bottle {
  position: relative;
  width: 60px;
  height: 180px;
  border: 4px solid gray;
  border-top: none;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  cursor: grab;
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.2s;
  overflow: hidden; // Чтобы слои не выходили за скругления дна
  user-select: none;

  &--selected {
    transform: translateY(-20px);
    border-color: #F4A900;
  }

  &__inner {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    height: 100%;
    pointer-events: none;
  }

  &__layer {
    width: 100%;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  &__lock {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 28px;
    z-index: 10;
    user-select: none;
  }

  &--blocked {
    opacity: 0.2;
    cursor: not-allowed;
    filter: grayscale(1);
  }

  &--moving {
    cursor: grabbing;
    pointer-events: none;
    opacity: 0.8;
    transition: none;
  }
}
</style>