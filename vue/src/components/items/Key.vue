<template>
  <div
      class="key"
  >
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
const store = useStore()
const list = computed(() => store.getters['list/getSceneObjects'])
</script>

<style scoped>
.key {
  width: 50px;
  height: 50px;
  background-image: url("@/assets/items/key.png");
}
</style>
