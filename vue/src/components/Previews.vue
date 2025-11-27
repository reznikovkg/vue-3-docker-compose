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
import Preview from './Preview.vue'

const props = defineProps({
  tetrominoes: { type: Array, required: true }
})

const previewTetrominoes = computed(() => 
  props.tetrominoes
    .slice(1 - props.tetrominoes.length)
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