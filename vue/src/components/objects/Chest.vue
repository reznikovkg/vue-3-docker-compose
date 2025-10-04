<template>
  <div class="parent">
    <div
      class="chest"
      :class="{ 'chest__open': item?.isActive }">
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
const props = defineProps({
  item: Object,
});
</script>

<style scoped lang="less">
.parent {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chest {
  width: 100px;
  height: 50px;
  background-size: contain;
  background-repeat: no-repeat;
  background-image: url("@/assets/objects/chest/chest.jpg");
  &__open {
    height: 60px;
    background-image: url("@/assets/objects/chest/chest-open.webp");
  }
}
</style>
