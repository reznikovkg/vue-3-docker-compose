<template>
  <div class="menu">
    <div class="menu__start">
      <RouterLink :to="{ name: $routes.GAME, query: { difficulty: selectedDifficulty, layers: selectedLayers } }">
        <PairButton label="Start Game" />
      </RouterLink>
    </div>
    <div class="menu__difficulty">
      <PairSelect :modelValue="selectedDifficulty" :values="difficultyValues" :onChange="(event) => handleDifficultyChange(event)" />
    </div>
    <div class="menu__layers">
      <PairSelect :modelValue="selectedLayers" :values="layersValues" :onChange="(event) => handleLayersChange(event)" />
    </div>
    <div class="menu__time">
      <p v-if="highScore">High Score: {{ highScore }}sec.</p>
      <p v-else>No high score yet.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import PairButton from '@/components/ui/PairButton.vue'
import PairSelect from "@/components/ui/PairSelect.vue"

const store = useStore()
const highScore = computed(() => store.getters['game/getHighScore'])
const difficultyValues = {
  4: 'Easy (4 pairs)',
  6: 'Medium (6 pairs)',
  8: 'Hard (8 pairs)',
  12: 'Very Hard (12 pairs)',
}
const layersValues = {
  1: '1 Layer',
  3: '3 Layers',
  5: '5 Layers',
}
const selectedDifficulty = ref(6)
const selectedLayers = ref(1)

const handleDifficultyChange = (event) => {
  selectedDifficulty.value = event.target.value
}

const handleLayersChange = (event) => {
  selectedLayers.value = event.target.value
}
</script>

<style lang="scss" scoped>
.menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;

  &__start, &__difficulty, &__time, &__layers {
    margin: 10px;
  }

  &__difficulty, &__layers {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__time {
    font-size: 27px;
  }
}
</style>
