<template>
  <div
    class="tower"
    :class="[
      selected ? 'tower--selected' : '',
      !hasTower ? 'tower--empty' : '',
      isHit ? 'tower--hit' : ''
    ]"
    :style="{
      left: x + 'px',
      top: y + 'px'
    }"
    @click.stop="() => onClick()"
  >
    <div
      class="tower__circle"
      :style="{
        background: hasTower ? getColor(level) : 'transparent'
      }"
    >
      <span v-if="hasTower">{{ level }}</span>
      <span v-else class="tower__plus">+</span>
    </div>
    <div
      v-if="hasTower"
      class="tower__health-bar-container"
    >
      <div
        class="tower__health-bar"
        :style="{
          width: (health / maxHealth) * 100 + '%'
        }"
      ></div>
    </div>
    <div
      v-if="hasTower"
      class="tower__range"
      :style="{
        width: radius * 2 + 'px',
        height: radius * 2 + 'px',
        left: -radius + 15 + 'px',
        top: -radius + 15 + 'px'
      }"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'Tower',
  emits: ['click'],
  props: {
    x: Number,
    y: Number,
    radius: Number,
    level: {
      type: Number,
      default: 1
    },
    selected: {
      type: Boolean,
      default: false
    },
    hasTower: {
      type: Boolean,
      default: false
    },
    health: {
      type: Number,
      default: 100
    },
    maxHealth: {
      type: Number,
      default: 100
    },
    isHit: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onClick () {
      this.$emit('click')
    },
    getColor (level) {
      const colors = ['#8b4513', '#cd853f', '#d2691e', '#a0522d', '#8b0000']
      return colors[Math.min(level - 1, colors.length - 1)] || '#8b4513'
    }
  }
}
</script>

<style scoped lang="scss">
.tower {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 4;

  &--selected &__circle {
    border: 3px solid yellow;
    transform: scale(1.2);
  }

  &--empty &__circle {
    background: rgba(255, 255, 255, 0.3);
    border: 2px dashed #4caf50;

    &:hover {
      background: rgba(76, 175, 80, 0.3);
      transform: scale(1.1);
    }
  }

  &--hit &__circle {
    border-color: #ff4444;
    transform: scale(1.1);
  }

  &__circle {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 14px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    cursor: pointer;
    transition: transform 0.2s, border 0.2s, background 0.2s;
  }

  &__plus {
    font-size: 20px;
    font-weight: bold;
    color: #4caf50;
  }

  &__health-bar-container {
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 30px;
    height: 4px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 2px;
    overflow: hidden;
  }

  &__health-bar {
    height: 100%;
    background: #4caf50;
    transition: width 0.2s;
  }

  &__range {
    position: absolute;
    border: 1px dashed rgba(255,0,0,0.35);
    border-radius: 50%;
    pointer-events: none;
    display: block;
    background: rgba(255, 0, 0, 0.05);
  }
}
</style>