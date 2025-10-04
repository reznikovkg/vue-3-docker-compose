<template>
  Example STORE {{ count }}
  <RouterLink :to="{ name: $routes.INDEX }" >To Index</RouterLink>
  <input v-model="value" type="number">
  <input v-model="timeout" type="number">
  <button @click="() => inc()">+</button>
  <button @click="() => setValue()">SET</button>

  <div>
    <div v-for="i in list" :key="i">{{ i }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
const store = useStore()
const count = computed(() => store.getters.getCount)
const list = computed(() => store.getters['list/getSceneObjects'])

const value = ref(1)
const timeout = ref(0)

const inc = () => store.dispatch('runIncrement', value.value)
const setValue = () => store.dispatch('setCount', {
  value: value.value,
  timeout: timeout.value
})
</script>

<style scoped>

</style>
