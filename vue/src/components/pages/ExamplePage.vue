<template>
  <div class="c-example-page">
    <!--
    <div>Example STORE {{ count }}</div>
    <RouterLink :to="{ name: $routes.INDEX }">To Index</RouterLink>

    <div>
      <input v-model="value" type="number">
      <input v-model="timeout" type="number">
      <button @click="() => inc()">+</button>
      <button @click="() => setValue()">SET</button>
    </div>

    <div>
      <div v-for="i in list" :key="i">{{ i }}</div>
    </div>
    -->

    <RouterLink :to="{ name: $routes.INDEX }" class="c-example-page__link">
      <button type="button" class="c-example-page__button">Назад</button>
    </RouterLink>

    <BubbleGame>
      <template #start-label>Играть</template>
    </BubbleGame>
  </div>
</template>

<script setup lang="ts">
import BubbleGame from '@/components/BubbleGame.vue'

/*
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const count = computed(() => store.getters.getCount)
const list = computed(() => store.getters['list/getList'])

const value = ref(1)
const timeout = ref(0)

const inc = () => store.dispatch('runIncrement', value.value)
const setValue = () => store.dispatch('setCount', {
  value: value.value,
  timeout: timeout.value
})
*/
</script>

<style scoped>
.c-example-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
}

.c-example-page__button {
  padding: 8px 14px;
  cursor: pointer;
}

.c-example-page__link {
  width: fit-content;
  text-decoration: none;
}
</style>
