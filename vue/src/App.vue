<template>
  <RouterView />
<<<<<<< Updated upstream
=======

  <div class="app">
    <h1 class="app__title">Bubble game - Мультиразмер</h1>

    <div class="app__controls">
      <span>Target color:</span>
      <span class="app__color" :style="{ background: targetColor }"></span>

      <!-- Fonction fléchée dans le template -->
      <button class="app__btn" @click="() => toggleGame()">
        {{ running ? 'Stop' : 'Start' }}
      </button>
    </div>

    <div class="app__score">Score : {{ score }}</div>

    <!-- Légende des tailles -->
    <div class="app__legend">
      <div class="app__legend-item">
        <div class="app__legend-bubble large"></div>
        <span>Большая (-5 при ошибке, -10 при потере)</span>
      </div>
      <div class="app__legend-item">
        <div class="app__legend-bubble medium"></div>
        <span>Среднее (-3 при ошибке, -6 при потере)</span>
      </div>
      <div class="app__legend-item">
        <div class="app__legend-bubble small"></div>
        <span> Небольшая (-1 при ошибке, -3 при потере) </span>
      </div>
    </div>

    <!-- Jeu actif -->
    <BubbleGame 
      v-if="running"
      :colorsCount="colorsCount"
      :targetColor="targetColor"
      :spawnRate="spawnRate"
      :scoreGood="scoreGood"
      :scoreBad="scoreBad"
      @finish="() => endGame()"
    />
    

    <!-- Résultat -->
    <div class="app__result" v-else-if="score !== 0">
      <div class="app__result-box">
        <h2>🎉 Game over! 🎉</h2>
        <p>Final Score : <strong>{{ score }}</strong></p>

        <button class="app__btn" @click="() => restart()">Replay 🔄</button>
      </div>
    </div>
  </div>
>>>>>>> Stashed changes
</template>

<script setup>
</script>

<<<<<<< Updated upstream
<style scoped lang="scss">
</style>
=======
<style scoped lang="less">
.app {
  text-align: center;
  padding: 20px;

  &__title {
    font-size: 28px;
    margin-bottom: 10px;
  }

  &__controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }

  &__color {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    border: 2px solid black;
  }

  &__btn {
    padding: 6px 14px;
    cursor: pointer;
  }

  &__score {
    font-size: 22px;
    margin-bottom: 10px;
  }

  &__legend {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 15px;
    flex-wrap: wrap;
  }

  &__legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }

  &__legend-bubble {
    border-radius: 50%;
    border: 2px solid #333;
    
    &.large {
      width: 25px;
      height: 25px;
      background: linear-gradient(145deg, #ff6b6b, #ff5252);
    }
    
    &.medium {
      width: 20px;
      height: 20px;
      background: linear-gradient(145deg, #4ecdc4, #44a08d);
    }
    
    &.small {
      width: 15px;
      height: 15px;
      background: linear-gradient(145deg, #ffe66d, #ffd166);
    }
  }

  &__result {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  &__result-box {
    background: rgba(0, 0, 0, 0.75);
    color: white;
    padding: 20px 35px;
    border-radius: 12px;
    box-shadow: 0 0 10px #000;
    text-align: center;
    animation: fadeIn 0.4s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to   { opacity: 1; transform: scale(1); }
  }
}
</style>
>>>>>>> Stashed changes
