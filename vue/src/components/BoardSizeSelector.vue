<template>
  <div class="size-selector">
    <div class="selector-content">
      <h2 class="selector-title">Размер поля</h2>
      
      <!-- Индикатор сложного режима -->
      <div v-if="hardMode" class="hard-mode-badge">
        <span class="badge-text">Сложный режим активен</span>
      </div>
      
      <div class="presets">
        <h3 class="presets-title">Быстрый выбор</h3>
        <div class="preset-grid">
          <button
            v-for="preset in presets"
            :key="preset.name"
            :class="['preset-btn', { active: isPresetActive(preset) }]"
           @click="() =>selectPreset(preset)" 
          >
            <div class="preset-icon">{{ preset.icon }}</div>
            <div class="preset-name">{{ preset.name }}</div>
            <div class="preset-size">{{ preset.columns }}×{{ preset.rows }}</div>
          </button>
        </div>
      </div>

      <div class="custom-settings">
        <h3 class="custom-title">Или настройте вручную</h3>
        
        <div class="slider-group">
          <label class="slider-label">
            <span class="label-text">Ширина (столбцы)</span>
            <span class="label-value">{{ columns }}</span>
          </label>
          <input
            type="range"
            v-model.number="columns"
            min="6"
            max="16"
            step="1"
            class="slider"
          />
          <div class="slider-marks">
            <span>6</span>
            <span>16</span>
          </div>
        </div>

        <div class="slider-group">
          <label class="slider-label">
            <span class="label-text">Высота (строки)</span>
            <span class="label-value">{{ rows }}</span>
          </label>
          <input
            type="range"
            v-model.number="rows"
            min="12"
            max="30"
            step="1"
            class="slider"
          />
          <div class="slider-marks">
            <span>12</span>
            <span>30</span>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="action-btn start-btn" @click="() => handleStart()">
          Начать игру
        </button>
        <button class="action-btn back-btn" @click="() => handleBack() ">
          Назад
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  hardMode: { type: Boolean, default: false }
})

const emit = defineEmits(['start', 'back'])

const columns = ref(10)
const rows = ref(20)

const presets = [
  { name: 'Маленькое', columns: 8, rows: 16},
  { name: 'Классика', columns: 10, rows: 20 },
  { name: 'Среднее', columns: 12, rows: 22 },
  { name: 'Большое', columns: 14, rows: 26 },
  { name: 'Огромное', columns: 16, rows: 30},
]

const previewStyle = computed(() => {
  const cellSize = Math.min(300 / Math.max(columns.value, rows.value / 2), 20)
  return {
    gridTemplateColumns: `repeat(${columns.value}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${rows.value}, ${cellSize}px)`,
  }
})

const isPresetActive = (preset) => {
  return preset.columns === columns.value && preset.rows === rows.value
}

const selectPreset = (preset) => {
  columns.value = preset.columns
  rows.value = preset.rows
}

const handleStart = () => {
  emit('start', { columns: columns.value, rows: rows.value })
}

const handleBack = () => {
  emit('back')
}
</script>

<style lang="scss" scoped>
.size-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 20px;
}

.selector-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  max-width: 700px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    padding: 25px;
    max-width: 95%;
  }
}

.selector-title {
  text-align: center;
  font-size: 2.2em;
  margin-bottom: 20px;
  color: #333;

  @media (max-width: 768px) {
    font-size: 1.8em;
    margin-bottom: 15px;
  }
}

.hard-mode-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(145deg, rgba(255, 100, 100, 0.3), rgba(200, 50, 50, 0.3));
  border: 2px solid rgba(255, 100, 100, 0.5);
  border-radius: 15px;
  padding: 12px 20px;
  margin-bottom: 25px;
  animation: pulse-badge 2s ease-in-out infinite;

  @media (max-width: 768px) {
    padding: 10px 15px;
    margin-bottom: 20px;
  }
}

@keyframes pulse-badge {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(255, 100, 100, 0.3);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 20px rgba(255, 100, 100, 0.5);
  }
}

.badge-text {
  font-size: 1.1em;
  font-weight: bold;
  color: #c62828;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);

  @media (max-width: 768px) {
    font-size: 1em;
  }
}

.presets {
  margin-bottom: 35px;
}

.presets-title,
.custom-title {
  font-size: 1.3em;
  margin-bottom: 15px;
  color: #555;

  @media (max-width: 768px) {
    font-size: 1.1em;
  }
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.preset-btn {
  background: white;
  border: 3px solid #ddd;
  border-radius: 15px;
  padding: 15px 10px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    border-color: #ee5a24;
  }

  &.active {
    border-color: #ee5a24;
    background: linear-gradient(145deg, #fff8f0, #ffffff);
    box-shadow: 0 5px 15px rgba(238, 90, 36, 0.3);
  }

  @media (max-width: 768px) {
    padding: 12px 8px;
    gap: 6px;
  }
}

.preset-icon {
  font-size: 2.5em;

  @media (max-width: 768px) {
    font-size: 2em;
  }
}

.preset-name {
  font-weight: bold;
  font-size: 0.95em;
  color: #333;

  @media (max-width: 768px) {
    font-size: 0.85em;
  }
}

.preset-size {
  font-size: 0.85em;
  color: #666;

  @media (max-width: 768px) {
    font-size: 0.75em;
  }
}

.custom-settings {
  margin-bottom: 35px;
}

.slider-group {
  margin-bottom: 25px;

  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
}

.slider-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 1em;
  color: #555;

  @media (max-width: 768px) {
    font-size: 0.9em;
  }
}

.label-text {
  font-weight: 500;
}

.label-value {
  font-weight: bold;
  color: #ee5a24;
  font-size: 1.2em;

  @media (max-width: 768px) {
    font-size: 1.1em;
  }
}

.slider {
  width: 100%;
  height: 8px;
  border-radius: 5px;
  outline: none;
  background: linear-gradient(to right, #ddd 0%, #ee5a24 100%);
  cursor: pointer;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #ee5a24;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    transition: all 0.2s;

    &:hover {
      transform: scale(1.2);
    }
  }

  &::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #ee5a24;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    transition: all 0.2s;

    &:hover {
      transform: scale(1.2);
    }
  }
}

.slider-marks {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 0.85em;
  color: #999;
}

.actions {
  display: flex;
  gap: 15px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.action-btn {
  flex: 1;
  padding: 18px;
  border: none;
  border-radius: 12px;
  font-size: 1.3em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    font-size: 1.1em;
    padding: 15px;
  }
}

.start-btn {
  background: linear-gradient(145deg, #ffff6b, #ee5a24);
  color: white;
  box-shadow: 0 4px 15px rgba(238, 90, 36, 0.4);
}

.back-btn {
  background: #6c757d;
  color: white;
}
</style>