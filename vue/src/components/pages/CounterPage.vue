<template>
  <div class="counter">
    Счетчик: {{ count }}

    <div class="counter__back-link">
      <RouterLink :to="{ name: $routes.INDEX }">
        To Index
      </RouterLink>
    </div>

    <div class="counter__controls">
      <input v-model="value" type="number" class="counter__input">
      <button @click="() => inc()" class="counter__button">+</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
const store = useStore()
const count = computed(() => store.getters.getCount)

const value = ref(1)
const inc = () => store.dispatch('runIncrement', value.value)
</script>

<style scoped>
.counter {
  padding: 12px;
}

.counter__back-link {
  margin: 8px 0;
}

.counter__controls {
  margin-top: 8px;
}
</style>