<template>
  <div
      class="key"
  >
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
const store = useStore()
const count = computed(() => store.getters.getCount)
const list = computed(() => store.getters['list/getSceneObjects'])
const isOpened = ref(false)
</script>

<style scoped>
.key {
  width: 50px;
  height: 50px;
  background-image: url("@/assets/items/key.png");
}
</style>
