<template>
  <ul class="game-stats game-stats__right">
    <li>Уровень</li>
    <li class="value">{{ gameStats.level }}</li>
    <li>Строк до следующего уровня</li>
    <li class="value">{{ linesToLevel }}</li>
    <li>Очки</li>
    <li class="value">{{ gameStats.points }}</li>
  </ul>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  gameStats: { type: Object, required: true }
})

const linesToLevel = computed(() => 
  props.gameStats.linesPerLevel - props.gameStats.linesCompleted
)
</script>

<style scoped>
.game-stats {
  list-style-type: none;
  color: rgba(255, 255, 255, 0.9);
  padding: 0;
  margin: 0;
}

.game-stats .value {
  font-size: min(2.8rem, 5vh);
  margin-bottom: 0.5em;
  color: rgba(255, 255, 255, 1);
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.game-stats li {
  margin-bottom: 0.8em;
  font-size: min(1.2rem, 2.2vh);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

@media (max-width: 768px) {
  .game-stats {
    text-align: center;
  }

  .game-stats .value {
    font-size: min(2.2rem, 4vh);
  }

  .game-stats li {
    font-size: min(1rem, 1.8vh);
    margin-bottom: 0.5em;
  }
}
</style>