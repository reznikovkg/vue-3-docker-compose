<template>
  <div
      class="door"
      :class="{ 'door-open': item?.isActive }">
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
.door {
  width: 100px;
  height: 150px;
  background-image: url("@/assets/objects/door.png");
}
.door-open {
  margin-left: 70px;
  width: 30px;
}
</style>
