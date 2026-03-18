<template>
  <div class="menu">
    <div class="menu-start">
      <RouterLink :to="{ name: $routes.GAME, query: { difficulty: selectedDifficulty } }">
        <PairButton>Start Game</PairButton>
      </RouterLink>
    </div>
    <div class="menu-difficulty">
      <PairSelect :modelValue="selectedDifficulty" :onChange="(event) => handleDifficultyChange(event)">
        <option value="4">Easy (4 pairs)</option>
        <option value="6">Medium (6 pairs)</option>
        <option value="8">Hard (8 pairs)</option>
        <option value="12">Very Hard (12 pairs)</option>
      </PairSelect>
    </div>
    <div class="menu-time">
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
const selectedDifficulty = ref(6)

const handleDifficultyChange = (event) => {
  selectedDifficulty.value = event.target.value
}
</script>

<style lang="scss" scoped>
.menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;

  &-start, &-difficulty, &-time {
    margin: 10px;
  }

  &-difficulty {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &-time {
    font-size: 27px;
  }
}
</style>
