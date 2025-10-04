<template>
  <div class="logs">
    <div v-if="item.isActive" class="sprite"></div>
  </div>
</template>

<script setup lang="ts">
import {computed, defineProps, ref} from 'vue'
import { useStore } from 'vuex'
const props = defineProps({
  item: Object,
});
</script>

<style scoped>
.sprite {
  width: 100%;
  height: 100%;
  background-size: contain;
  background-repeat: no-repeat;
  animation: play 1s steps(1) infinite; /* 12 кадров */
 }
.logs {
  width: 100px;
  height: 240px;
  background-image: url("@/assets/objects/bonfire/logs.png");
  background-size: contain;
}

@keyframes play {
  0%   { background-image: url("@/assets/objects/bonfire/1.png"); }
  25%  { background-image: url("@/assets/objects/bonfire/2.png"); }
  50%  { background-image: url("@/assets/objects/bonfire/3.png"); }
  75% { background-image: url("@/assets/objects/bonfire/4.png"); }
}
</style>
