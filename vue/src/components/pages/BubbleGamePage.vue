<template>
  <div class="wrapper">
    <!-- Настройки -->
    <div v-if="!playing" class="overlay">
      <div class="panel">
        <h1>Игра "Мыльные пузыри" 🫧</h1>
        
        <div class="field">
          <label>Количество цветов (2-6):</label>
          <input type="number" v-model.number="cfg.colorCount" min="2" max="6" />
        </div>
        
        <div class="field">
          <label>Целевой цвет:</label>
          <input type="color" v-model="cfg.targetColor" />
        </div>
        
        <div class="field">
          <label>Интенсивность (шт/сек):</label>
          <input type="number" v-model.number="cfg.intensity" min="0.1" max="3" step="0.1" />
        </div>
        
        <div class="field">
          <label>Очки за попадание:</label>
          <input type="number" v-model.number="cfg.correctScore" />
        </div>
        
        <div class="field">
          <label>Очки за ошибку:</label>
          <input type="number" v-model.number="cfg.wrongScore" />
        </div>
        
        <button @click="startGame" class="btn primary">🎮 Начать игру</button>
        <RouterLink :to="{ name: $routes.INDEX }" class="btn">← Назад</RouterLink>
      </div>
    </div>
    
    <!-- Кнопка стоп -->
    <button v-if="playing" @click="stopGame" class="stop-btn">⏸ Стоп</button>
    
    <!-- Результаты -->
    <div v-if="result !== null" class="overlay">
      <div class="panel result">
        <h2>🎉 Игра окончена!</h2>
        <div class="final-score">{{ result }}</div>
        <p class="label">Финальный счёт</p>
        <button @click="result = null" class="btn primary">🔄 Новая игра</button>
      </div>
    </div>
    
    <!-- Игра -->
    <BubbleGame
      v-if="playing"
      ref="gameRef"
      v-bind="cfg"
      @finish="handleFinish"
      @score="handleScore"
    />
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import BubbleGame from '../BubbleGame.vue'

const cfg = ref({
  colorCount: 5,
  targetColor: '#FF4757',
  intensity: 0.8,
  correctScore: 1,
  wrongScore: -5
})

const playing = ref(false)
const result = ref(null)
const gameRef = ref(null)
const currentScore = ref(0)

const startGame = async () => {
  playing.value = true
  result.value = null
  currentScore.value = 0
  await nextTick()
  gameRef.value?.start()
}

const stopGame = () => {
  playing.value = false
  result.value = currentScore.value
}

const handleFinish = (score) => {
  playing.value = false
  result.value = score
}

const handleScore = (data) => {
  currentScore.value = data.score
}
</script>

<style scoped>
.wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.overlay {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #FFE66D, #FF6B9D, #C44569, #A8E6CF, #FFD93D);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.panel {
  background: rgba(255, 255, 255, 0.95);
  padding: 40px 50px;
  border-radius: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  backdrop-filter: blur(20px);
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 35px;
  font-size: 32px;
  font-weight: 900;
}

.field {
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
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

.field input:focus {
  outline: none;
  border-color: #FF6B9D;
  box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.1);
}

.field input[type="color"] {
  height: 50px;
  cursor: pointer;
}

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
}

.btn.primary {
  background: linear-gradient(135deg, #FF6B9D, #C44569);
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(255, 107, 157, 0.4);
}

.stop-btn {
  position: fixed;
  top: 30px;
  right: 40px;
  z-index: 1001;
  background: rgba(255, 255, 255, 0.95);
  color: #FF4757;
  padding: 15px 30px;
  border-radius: 50px;
  font-size: 18px;
  font-weight: 900;
  border: 3px solid rgba(255, 255, 255, 0.5);
  cursor: pointer;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
}

.stop-btn:hover {
  transform: translateY(-2px);
}

.result {
  text-align: center;
  padding: 60px 80px;
}

.result h2 {
  color: #FF6B9D;
  margin-bottom: 30px;
  font-size: 42px;
  font-weight: 900;
}

.final-score {
  font-size: 96px;
  font-weight: 900;
  color: #FF4757;
  margin: 20px 0;
}

.label {
  font-size: 20px;
  color: #666;
  margin-bottom: 40px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 700;
}
</style>
