<template>
  <div>
    <div v-if="!isPlaying" class="overlay">
      <div class="panel">
        <h1>Игра "Мыльные пузыри" 🫧</h1>

        <div class="field">
          <label>Количество цветов (2-6):</label>
          <input
            type="number"
            :value="config.colorCount"
            @input="e => updateConfigField('colorCount', e.target.value)"
            min="2"
            max="6"
          />
        </div>

        <div class="field">
          <label>Целевой цвет:</label>
          <input
            type="color"
            :value="config.targetColor"
             @input="e => updateConfigField('targetColor', e.target.value)"
          />
        </div>

        <div class="field">
          <label>Интенсивность (шт/сек):</label>
          <input
            type="number"
            :value="config.intensity"
            @input="e => updateConfigField('intensity', e.target.value)"
            min="0.1"
            max="3"
            step="0.1"
          />
        </div>

        <div class="field">
          <label>Очки за попадание:</label>
          <input
            type="number"
            :value="config.correctScore"
            @input="e => updateConfigField('correctScore', e.target.value)"
          />
        </div>

        <div class="field">
          <label>Очки за ошибку:</label>
          <input
            type="number"
            :value="config.wrongScore"
            @input="e => updateConfigField('wrongScore', e.target.value)"
          />
        </div>

        <button @click="() => handleStart()" class="btn primary">🎮 Начать игру</button>
        <RouterLink :to="{ name: $routes.INDEX }" class="btn"
          >← Назад</RouterLink
        >
      </div>
    </div>

    <button v-if="isPlaying" @click="() => handleStop()" class="btn stop">
      ⏸ Стоп
    </button>

    <div v-if="hasResult" class="overlay">
      <div class="panel">
        <h2>🎉 Игра окончена!</h2>
        <div class="final-score">{{ finalScore }}</div>
        <p class="label">Финальный счёт</p>
        <button @click="() => handleReset()" class="btn primary">🔄 Новая игра</button>
      </div>
    </div>

    <BubbleGame
      v-if="isPlaying"
      ref="gameRef"
      v-bind="config"
      @finish="score => handleFinish(score)"
      @score="data => handleScore(data)"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";
import { useStore } from "vuex";
import BubbleGame from "../BubbleGame.vue";

const store = useStore();
const gameRef = ref(null);

const config = computed(() => store.getters["bubbleGame/getConfig"]);
const isPlaying = computed(() => store.getters["bubbleGame/getIsPlaying"]);
const finalScore = computed(() => store.getters["bubbleGame/getFinalScore"]);
const hasResult = computed(() => store.getters["bubbleGame/hasResult"]);

const updateConfigField = (field, value) => {
  const numValue = [
    "colorCount",
    "intensity",
    "correctScore",
    "wrongScore",
  ].includes(field)
    ? Number(value)
    : value;
  store.dispatch("bubbleGame/updateConfig", { [field]: numValue });
};

const handleStart = () => {
  store.dispatch("bubbleGame/startGame");
  nextTick(() => {
    gameRef.value?.start();
  });
};

const handleStop = () => {
  store.dispatch("bubbleGame/stopGame");
};

const handleFinish = (score) => {
  store.dispatch("bubbleGame/finishGame", score);
};

const handleScore = (data) => {
  store.dispatch("bubbleGame/updateScore", data.score);
};

const handleReset = () => {
  store.dispatch("bubbleGame/resetResult");
};
</script>

<style scoped lang="scss">
.wrapper {
    width: 100%;
    height: 100vh;
}

.overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 20px;
    background: linear-gradient(135deg, #FFE66D, #FF6B9D, #C44569, #A8E6CF, #FFD93D);
}

.result {
    text-align: center;
    padding: 60px 80px;
}

/* Панель */
.panel {
    background: rgba(255, 255, 255, 0.95);
    padding: 40px 50px;
    border-radius: 30px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 600px;
    width: 100%;
    backdrop-filter: blur(20px);
}

/* Кнопки */
.btn {
    width: 100%;
    padding: 18px;
    font-size: 20px;
    font-weight: 900;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s;
    margin-top: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    background: linear-gradient(135deg, #A8E6CF, #6BCF7F);
    color: white;
    text-decoration: none;
    display: block;
    text-align: center;
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(255, 107, 157, 0.4);
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 30px rgba(255, 107, 157, 0.4);
    }
}

.btn.primary {
    background: linear-gradient(135deg, #FF6B9D, #C44569);
}

.btn.stop {
    width: auto;
    margin-top: 0;
    text-transform: none;
    border-radius: 50px;
    padding: 15px 30px;
    font-size: 18px;
    position: fixed;
    top: 30px;
    right: 40px;
    z-index: 1001;
    background: rgba(255, 255, 255, 0.95);
    color: #FF4757;
}

/* Поля ввода */
.field {
    margin-bottom: 25px;
    display: flex;
    align-items: center;
    gap: 20px;
    & focus {
      outline: none;
      border-color: #FF6B9D;
      box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.1);
    }
}

.field label {
    flex: 0 0 220px;
    font-weight: 700;
    color: #555;
    font-size: 16px;
}

.field input {
    flex: 1;
    padding: 14px 18px;
    border: 3px solid #e0e0e0;
    border-radius: 15px;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s;
}

.field input[type="color"] {
    height: 50px;
    cursor: pointer;
}

/* Выбранный цвет */
.color-dot {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 4px solid white;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}
</style>
