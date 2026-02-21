<template>
  <div>
    <RouterLink :to="{ name: $routes.INDEX }" >To Index</RouterLink>

    <h1>Counter : {{ count }}</h1>

    <button @click="inc">Увеличить
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const count = computed(() => store.getters.getCount)

const inc = () => {
  store.dispatch('runIncrement', 1)
}

</script>

<style scoped>

</style>