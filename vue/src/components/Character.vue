<template>
  <div
      class="character"
      :class="{ 'character-run': playerTransform.isRun, 'left': playerTransform.toLeft }"
  >
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
const store = useStore()
const playerTransform = computed(() => store.getters.getPlayerTransform)
</script>

<style scoped>
.character {
  pointer-events: none;
  width: 100px;
  height: 150px;
  background-repeat: no-repeat;
  background-image: url("@/assets/character/idle.png");
  background-size: contain;
}
.character-run {
  width: 100px;
  height: 150px;
  background-repeat: no-repeat;
  animation: run 1s steps(1) infinite;
  background-size: contain;
}
.left {
  transform: scaleX(-1);
}

@keyframes run {
  0%   { background-image: url("@/assets/character/1.png"); }
  25%  { background-image: url("@/assets/character/2.png"); }
  50%  { background-image: url("@/assets/character/3.png"); }
  75% { background-image: url("@/assets/character/4.png"); }
}
</style>
