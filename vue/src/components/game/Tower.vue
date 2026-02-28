<template>
  <div
    class="tower"
    :class="[
      selected ? 'tower--selected' : '',
      !hasTower ? 'tower--empty' : ''
    ]"
    :style="{
      left: x + 'px',
      top: y + 'px'
    }"
    @click.stop="() => $emit('click')"
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

<script setup>
const props = defineProps({
  x: Number,
  y: Number,
  level: Number,
  radius: Number,
  selected: Boolean,
  hasTower: Boolean
})

const getColor = (level) => {
  const colors = ['#8B4513', '#CD853F', '#D2691E', '#A0522D', '#8B0000']
  return colors[Math.min(level - 1, colors.length - 1)] || '#8B4513'
}

defineEmits(['click'])
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