<template>
  <div>
    <h2>Счетчик: {{ count }}</h2>
    <button @click="() => increment(5)">
      Увеличить на 5
    </button>

    <br>
    <button @click="() => increment(10)">
      Увеличить на 10
    </button>

    <br>
    <button @click="() => decrement(5)">
      Уменьшить на 5
    </button>
    
    <br>
    <button @click="() => decrement(10)">
      Уменьшить на 10
    </button>

    <div>
      <RouterLink :to="{ name: $routes.INDEX }">На главную</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const count = computed(() => store.getters.getCount)

const increment = (i) => {
  store.dispatch('runIncrement', i)
}

const decrement = (i) => {
  store.dispatch('runIncrement', -i)
}

</script>

<style scoped>

</style>