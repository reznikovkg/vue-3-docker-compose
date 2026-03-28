<template>
  <div
    class = "tower"
    :class = "{ 'tower--selected': isSelected }"
    :style = "towerStyle"
    @click.stop = "() => handleSelect()"
  >
    <div class = "tower__body" :style = "bodyStyle"></div>
    <div class = "tower__range" :style = "rangeStyle"></div>
    <div class = "tower__level">{{ tower.level }}</div>
    <button class = "tower__remove-btn" @click.stop = "() => handleRemove()">×</button>
  </div>
</template>

<script>
export default {
  name: 'Tower',
  props: {
    tower: {
      type: Object,
      required: true,
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['select', 'remove', 'upgrade'],
  computed: {
    towerStyle() {
      return {
        left: `${this.tower.x - 25}px`,
        top: `${this.tower.y - 25}px`,
      }
    },
    bodyStyle() {
      return {
        width: `${20 + this.tower.level * 5}px`,
        height: `${20 + this.tower.level * 5}px`,
        background: this.getTowerColor(),
      }
    },
    rangeStyle() {
      return {
        width: `${this.tower.range * 2}px`,
        height: `${this.tower.range * 2}px`,
        left: `${25 - this.tower.range}px`,
        top: `${25 - this.tower.range}px`,
      }
    },
  },
  methods: {
    getTowerColor() {
      if (this.tower.level >= 5) return '#e94560'
      if (this.tower.level >= 3) return '#0f3460'
      return '#16213e'
    },
    handleSelect() {
      this.$emit('select')
    },
    handleRemove() {
      this.$emit('remove')
    },
  },
}
</script>

<style scoped lang="scss">
.tower {
  position: absolute;
  width: 50px;
  height: 50px;
  cursor: pointer;
  transition: transform 0.2s;

  &--selected {
    transform: scale(1.1);
    z-index: 10;
  }

  &__body {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 5px;
    border: 2px solid #e94560;
    box-shadow: 0 0 10px rgba(233, 69, 96, 0.5);
  }

  &__range {
    position: absolute;
    border: 1px dashed rgba(233, 69, 96, 0.3);
    border-radius: 50%;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover &__range {
    opacity: 1;
  }

  &__level {
    position: absolute;
    top: -10px;
    right: -10px;
    width: 20px;
    height: 20px;
    background: #e94560;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
  }

  &__remove-btn {
    position: absolute;
    top: -5px;
    left: -5px;
    width: 20px;
    height: 20px;
    background: #ff0000;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    opacity: 0;
    transition: opacity 0.3s;

    &:hover {
      background: #cc0000;
    }
  }

  &:hover &__remove-btn {
    opacity: 1;
  }
}
</style>