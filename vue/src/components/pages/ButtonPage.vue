<template>
  <RouterLink :to="{ name: $routes.INDEX }" >To Index</RouterLink>
  
  Value: {{ count }}

  <button @click="() => inc()">+</button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
const store = useStore()
const count = computed(() => store.getters.getCount)

const inc = () => {
  store.dispatch('runIncrement', 1)
}

</script>

<style scoped>

</style>
