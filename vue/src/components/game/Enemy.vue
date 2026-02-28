<template>
  <div
    class="enemy"
    :class="{ 'enemy--selected': selected }"
    :style="{
      left: x + 'px',
      top: y + 'px'
    }"
    @click.stop="() => onClick()"
  >
    <div class="enemy__circle"></div>
    <div
      class="enemy__health-bar"
      :style="{
        width: (health / maxHealth) * 100 + '%'
      }"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'Enemy',
  emits: ['click'],
  props: {
    x: Number,
    y: Number,
    health: Number,
    maxHealth: Number,
    selected: Boolean,
    index: Number
  },
  methods: {
    onClick () {
      this.$emit('click')
    }
  }
}
</script>

<style scoped lang="scss">
.enemy {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 3;
  cursor: pointer;

  &__circle {
    width: 25px;
    height: 25px;
    background: #f44336;
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
    border: 2px solid #333;
    transition: all 0.1s;
  }

  &--selected &__circle {
    border: 4px solid yellow;
    transform: scale(1.2);
  }

  &__health-bar {
    position: absolute;
    bottom: -5px;
    left: 0;
    height: 4px;
    background: #4CAF50;
    border-radius: 2px;
    max-width: 25px;
  }
}
</style>