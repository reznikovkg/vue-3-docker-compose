<template>
  <div class="previews">
    <Preview 
      v-for="(tetromino, index) in previewTetrominoes" 
      :key="index"
      :tetromino="tetromino" 
      :index="index" 
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import Preview from './Preview.vue'

const store = useStore()

const tetrominoes = computed(() => store.getters['player/tetrominoes'])

const previewTetrominoes = computed(() => 
  tetrominoes.value
    .slice(1 - tetrominoes.value.length)
    .reverse()
)
</script>

<style lang="scss" scoped>
.previews {
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: row;
    gap: 15px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
  }
}
</style>