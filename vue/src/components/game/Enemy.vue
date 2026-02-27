<template>
  <div
    class="enemy"
    :class="{ 'enemy--selected': selected }"
    :style="{ left: x + 'px', top: y + 'px' }"
    @click.stop="() => $emit('click')"
  >
    <div class="enemy__circle"></div>
    <div
      class="enemy__health-bar"
      :style="{ width: (health / maxHealth) * 100 + '%' }"
    ></div>
  </div>
</template>

<script setup>
defineProps({
  x: Number,
  y: Number,
  health: Number,
  maxHealth: Number,
  selected: Boolean,
  index: Number
})

defineEmits(['click'])
</script>

<style scoped>
.enemy {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 3;
  cursor: pointer;
}

.enemy__circle {
  width: 25px;
  height: 25px;
  background: #f44336;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  border: 2px solid #333;
  transition: all 0.1s;
}

.enemy--selected .enemy__circle {
  border: 4px solid yellow;
  transform: scale(1.2);
}

.enemy__health-bar {
  position: absolute;
  bottom: -5px;
  left: 0;
  height: 4px;
  background: #4CAF50;
  border-radius: 2px;
  max-width: 25px;
}

.enemy__label {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: white;
  text-shadow: 1px 1px 1px black;
  white-space: nowrap;
}
</style>