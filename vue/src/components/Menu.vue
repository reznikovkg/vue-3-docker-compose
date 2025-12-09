<template>
  <div class="menu">
    <h1 class="menu-title">ТЕТРИС</h1>
    
    <div class="menu-buttons">
      <button class="button button--primary" @click="() => handleStart()">
        <span class="button-text">Начать игру</span>
      </button>
      
      <div class="difficulty-selector">
        <label class="difficulty-label">
          <input 
            type="checkbox" 
            v-model="hardMode" 
            class="difficulty-checkbox"
          />
          <span class="difficulty-text">
            Сложный режим
          </span>
        </label>
      </div>

      <button class="button button--secondary" @click="() => handleOpenEditor()">
        <span class="button-text">Редактор фигур</span>
      </button>
    </div>

    <div class="menu-controls">
      <div class="controls-title">Управление</div>
      <div class="controls-grid">
        <div class="control-item ">
          <div class="control-key">← →</div>
          <div class="control-desc">Движение</div>
        </div>
        <div class="control-item ">
          <div class="control-key">↑</div>
          <div class="control-desc">Поворот</div>
        </div>
        <div class="control-item">
          <div class="control-key">↓</div>
          <div class="control-desc">Ускорить</div>
        </div>
        <div class="control-item comp-only">
          <div class="control-key">SPACE</div>
          <div class="control-desc">Сброс</div>
        </div>
        <div class="control-item mobile-only">
          <div class="control-key">Сброс</div>
          <div class="control-desc">Зажать</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'

const emit = defineEmits(['start', 'openEditor'])
const store = useStore()

const hardMode = ref(false)

onMounted(() => {
  // Загружаем сохраненное значение
  const saved = localStorage.getItem('tetris_hard_mode')
  if (saved !== null) {
    hardMode.value = saved === 'true'
  }
})

const handleStart = () => {
  // Сохраняем выбор режима
  localStorage.setItem('tetris_hard_mode', hardMode.value.toString())
  store.dispatch('game/setHardMode', hardMode.value)
  emit('start', { hardMode: hardMode.value })
}

const handleOpenEditor = () => {
  emit('openEditor')
}
</script>

<style lang="scss" scoped>
$button-gradient: linear-gradient(145deg, #ffff6b, #ee5a24);
$button-secondary-gradient: linear-gradient(145deg, #3273dc, #5e72e4);

.menu {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  z-index: 100;
  padding: 30px 20px;
  box-sizing: border-box;
}

.menu-title {
  font-size: 4.5em;
  margin-bottom: 0.2em;
  text-align: center;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.1em;
  animation: pulse 2s ease-in-out infinite;

  @media (max-width: 768px) {
    font-size: 3.5em;
  }

  @media (max-width: 480px) {
    font-size: 2.8em;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 400px;
  margin-bottom: 3em;

  @media (max-width: 768px) {
    max-width: 350px;
    gap: 15px;
  }

  @media (max-width: 480px) {
    max-width: 300px;
  }
}

.button {
  padding: 1.5em 3em;
  font-size: 1.5em;
  border-radius: 20px;
  border: none;
  box-shadow: rgba(0, 0, 0, 0.5) 0px 0px 60px;
  cursor: pointer;
  background: $button-gradient;
  color: white;
  font-weight: bold;
  transition: all 0.3s ease;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: rgba(0, 0, 0, 0.6) 0px 5px 80px;
  }

  &:active {
    transform: translateY(0);
  }

  &--primary {
    background: $button-gradient;
    font-size: 1.8em;
  }

  &--secondary {
    background: $button-secondary-gradient;
    font-size: 1.4em;
  }

  @media (max-width: 768px) {
    padding: 1.2em 2.4em;
    font-size: 1.3em;

    &--primary {
      font-size: 1.5em;
    }

    &--secondary {
      font-size: 1.2em;
    }
  }

  @media (max-width: 480px) {
    padding: 1em 2em;
    font-size: 1.1em;

    &--primary {
      font-size: 1.3em;
    }

    &--secondary {
      font-size: 1em;
    }
  }
}

.button-text {
  flex: 1;
  text-align: center;
}

.difficulty-selector {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s;

  &:has(.difficulty-checkbox:checked) {
    background: rgba(255, 100, 100, 0.2);
    border-color: rgba(255, 100, 100, 0.5);
  }
}

.difficulty-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.difficulty-checkbox {
  width: 24px;
  height: 24px;
  cursor: pointer;
  accent-color: #ee5a24;
}

.difficulty-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.3em;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 1.1em;
  }
}


.menu-controls {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 25px;
  max-width: 600px;
  width: 100%;
  border: 2px solid rgba(255, 255, 255, 0.3);

  @media (max-width: 768px) {
    padding: 20px;
    max-width: 90%;
  }
}

.controls-title {
  text-align: center;
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 20px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 1.3em;
    margin-bottom: 15px;
  }
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 15px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}

.control-item {
  text-align: center;
  padding: 15px 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  &.comp-only {
    display: block;
  }

  &.mobile-only {
    display: none;
  }

  @media (max-width: 768px) {
    padding: 12px 8px;

    &.mobile-only {
      display: block;
    }

    &.comp-only {
      display: none;
    }
  }
}

.control-key {
  font-size: 1.4em;
  font-weight: bold;
  margin-bottom: 8px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 1.2em;
    margin-bottom: 6px;
  }
}

.control-desc {
  font-size: 0.9em;
  opacity: 0.95;

  @media (max-width: 768px) {
    font-size: 0.85em;
  }
}
</style>