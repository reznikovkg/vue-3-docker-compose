<template>
  <div class="camp-fire">
    <div v-if="item.isActive" class="fire"></div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue"
const props = defineProps({
  item: Object,
});
</script>

<style scoped lang="scss">
.fire {
  width: 70%;
  height: 70%;
  background-size: contain;
  background-repeat: no-repeat;
  animation: play 1s steps(1) infinite;
}
.camp-fire {
  width: 100px;
  height: 150px;
  display: flex;
  justify-content: center;
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
