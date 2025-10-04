<template>
  <div
      class="door"
      :class="{ 'door__open': item?.isActive }">
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
const props = defineProps({
  item: Object,
});
</script>

<style scoped lang="less">
.door {
  width: 100px;
  height: 150px;
  background-image: url("@/assets/objects/door.png");
  &__open {
    margin-left: 70px;
    width: 30px;
  }
}
</style>
