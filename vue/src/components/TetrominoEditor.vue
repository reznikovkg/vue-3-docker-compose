<template>
  <div class="editor-wrapper">
    <div class="editor-container">
      <h2 class="editor-title">Редактор фигур тетриса</h2>

      <div class="editor-content">
        <!-- Список фигур -->
        <div class="figures-list">
          <h3>Все фигуры</h3>
          <div class="figures-grid">
            <div
              v-for="(tetromino, key) in allTetrominoes"
              :key="key"
              :class="['figure-item', { active: selectedId === key }]"
              @click="selectTetromino(key)"
            >
              <div class="mini-preview">
                <div
                  v-for="(row, y) in tetromino.shape"
                  :key="y"
                  class="mini-row"
                >
                  <div
                    v-for="(cell, x) in row"
                    :key="x"
                    :class="['mini-cell', cell ? `color-${tetromino.color}` : '']"
                  ></div>
                </div>
              </div>
              <div class="figure-name">{{ tetromino.name }}</div>
              <div class="figure-type">{{ tetromino.isBase ? 'Базовая' : 'Своя' }}</div>
            </div>
          </div>

          <button class="btn btn-primary" @click="createNew">
            ➕ Создать новую фигуру
          </button>
        </div>

        <!-- Редактор выбранной фигуры -->
        <div class="editor-panel" v-if="editingTetromino">
          <h3>Редактирование: {{ editingTetromino.name }}</h3>

          <div class="form-group">
            <label>Название фигуры:</label>
            <input
              type="text"
              v-model="editingTetromino.name"
              class="input"
              placeholder="Название"
            />
          </div>

          <div class="form-group">
            <label>Размер сетки:</label>
            <div class="size-controls">
              <select v-model.number="gridSize" class="select">
                <option :value="2">2×2</option>
                <option :value="3">3×3</option>
                <option :value="4">4×4</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Цвет фигуры:</label>
            <div class="color-picker">
              <div
                v-for="color in availableColors"
                :key="color.key"
                :class="['color-option', { active: editingTetromino.color === color.key }]"
                @click="editingTetromino.color = color.key"
              >
                <div :class="['color-preview', `color-${color.key}`]"></div>
                <div class="color-name">{{ color.name }}</div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Форма фигуры (кликайте по клеткам):</label>
            <div class="shape-editor">
              <div
                v-for="(row, y) in editingTetromino.shape"
                :key="y"
                class="shape-row"
              >
                <div
                  v-for="(cell, x) in row"
                  :key="x"
                  :class="['shape-cell', cell ? `color-${editingTetromino.color}` : '']"
                  @click="toggleCell(y, x)"
                ></div>
              </div>
            </div>
          </div>

          <div class="button-group">
            <button class="btn btn-success" @click="saveTetromino">
              💾 Сохранить
            </button>
            <button
              class="btn btn-secondary"
              @click="saveAsNew"
              v-if="editingTetromino.isBase"
            >
              📋 Сохранить как новую
            </button>
            <button
              class="btn btn-danger"
              @click="deleteTetromino"
              v-if="editingTetromino.isCustom"
            >
              🗑️ Удалить
            </button>
            <button class="btn btn-secondary" @click="cancel">
              ❌ Отмена
            </button>
          </div>
        </div>
      </div>

      <button class="btn btn-back" @click="$emit('close')">
        ← Вернуться к игре
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const emit = defineEmits(['close'])

const selectedId = ref(null)
const editingTetromino = ref(null)
const gridSize = ref(4)

const allTetrominoes = computed(() => store.getters['tetrominoes/allTetrominoes'])

const availableColors = [
  { key: 'i', name: 'Голубой' },
  { key: 'j', name: 'Синий' },
  { key: 'l', name: 'Розовый' },
  { key: 'o', name: 'Желтый' },
  { key: 's', name: 'Зеленый' },
  { key: 't', name: 'Фиолетовый' },
  { key: 'z', name: 'Пурпурный' },
]

const selectTetromino = (id) => {
  selectedId.value = id
  const original = allTetrominoes.value[id]
  
  // Создаем копию для редактирования
  editingTetromino.value = {
    ...original,
    shape: original.shape.map(row => [...row])
  }
  
  gridSize.value = original.shape.length
}

const createNew = () => {
  const newId = `CUSTOM_${Date.now()}`
  const size = 4
  
  editingTetromino.value = {
    id: newId,
    name: 'Новая фигура',
    shape: Array(size).fill(0).map(() => Array(size).fill(0)),
    color: 'i',
    isCustom: true,
    isBase: false
  }
  
  selectedId.value = null
  gridSize.value = size
}

const toggleCell = (y, x) => {
  editingTetromino.value.shape[y][x] = editingTetromino.value.shape[y][x] ? 0 : 1
}

// Следим за изменением размера сетки
watch(gridSize, (newSize) => {
  if (!editingTetromino.value) return
  
  const oldShape = editingTetromino.value.shape
  const newShape = Array(newSize).fill(0).map(() => Array(newSize).fill(0))
  
  // Копируем старые данные в новую сетку
  for (let y = 0; y < Math.min(oldShape.length, newSize); y++) {
    for (let x = 0; x < Math.min(oldShape[y].length, newSize); x++) {
      newShape[y][x] = oldShape[y][x]
    }
  }
  
  editingTetromino.value.shape = newShape
})

const saveTetromino = () => {
  if (!editingTetromino.value) return
  
  // Проверяем, что есть хотя бы одна заполненная клетка
  const hasFilledCell = editingTetromino.value.shape.some(row => 
    row.some(cell => cell === 1)
  )
  
  if (!hasFilledCell) {
    alert('Фигура должна содержать хотя бы одну заполненную клетку!')
    return
  }
  
  if (editingTetromino.value.isCustom || !editingTetromino.value.isBase) {
    // Сохраняем новую или изменяем существующую custom фигуру
    store.dispatch('tetrominoes/addCustomTetromino', editingTetromino.value)
  } else {
    // Обновляем базовую фигуру
    store.dispatch('tetrominoes/updateTetromino', {
      id: selectedId.value,
      updates: {
        shape: editingTetromino.value.shape,
        color: editingTetromino.value.color,
        name: editingTetromino.value.name
      }
    })
  }
  
  alert('✅ Фигура сохранена!')
  selectedId.value = null
  editingTetromino.value = null
}

const saveAsNew = () => {
  if (!editingTetromino.value) return
  
  const newTetromino = {
    ...editingTetromino.value,
    id: `CUSTOM_${Date.now()}`,
    name: `${editingTetromino.value.name} (копия)`,
    isCustom: true,
    isBase: false
  }
  
  store.dispatch('tetrominoes/addCustomTetromino', newTetromino)
  alert('✅ Создана новая фигура!')
  
  selectedId.value = null
  editingTetromino.value = null
}

const deleteTetromino = () => {
  if (!editingTetromino.value || !editingTetromino.value.isCustom) return
  
  if (confirm('Вы уверены, что хотите удалить эту фигуру?')) {
    store.dispatch('tetrominoes/deleteTetromino', selectedId.value)
    selectedId.value = null
    editingTetromino.value = null
    alert('🗑️ Фигура удалена!')
  }
}

const cancel = () => {
  selectedId.value = null
  editingTetromino.value = null
}
</script>

<style lang="scss" scoped>
.editor-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(145deg, #ee5a24, #ffff6b);
  overflow-y: auto;
  padding: 20px;
  z-index: 1000;
}

.editor-container {
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.editor-title {
  text-align: center;
  font-size: 2.5em;
  margin-bottom: 30px;
  color: #333;
}

.editor-content {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 30px;
  margin-bottom: 20px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
}

.figures-list {
  h3 {
    margin-bottom: 15px;
    color: #333;
  }
}

.figures-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
  max-height: 500px;
  overflow-y: auto;
  padding: 10px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.figure-item {
  background: white;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &.active {
    border-color: #ee5a24;
    background: #fff8f0;
  }
}

.mini-preview {
  display: inline-block;
  margin-bottom: 5px;
}

.mini-row {
  display: flex;
  gap: 2px;
}

.mini-cell {
  width: 15px;
  height: 15px;
  background: #eee;
  border-radius: 2px;

  &.color-i { background: rgba(80, 227, 230, 1); }
  &.color-j { background: rgba(36, 95, 223, 1); }
  &.color-l { background: rgba(255, 174, 174, 1); }
  &.color-o { background: rgba(223, 217, 36, 1); }
  &.color-s { background: rgba(48, 211, 56, 1); }
  &.color-t { background: rgba(132, 61, 198, 1); }
  &.color-z { background: rgba(240, 80, 195, 1); }
}

.figure-name {
  font-weight: bold;
  font-size: 0.9em;
  margin-bottom: 3px;
}

.figure-type {
  font-size: 0.75em;
  color: #666;
}

.editor-panel {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h3 {
    margin-bottom: 20px;
    color: #333;
  }
}

.form-group {
  margin-bottom: 20px;

  label {
    display: block;
    font-weight: bold;
    margin-bottom: 8px;
    color: #555;
  }
}

.input, .select {
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #ee5a24;
  }
}

.color-picker {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
}

.color-option {
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
  }

  &.active {
    border-color: #ee5a24;
    background: #fff8f0;
  }
}

.color-preview {
  width: 100%;
  height: 40px;
  border-radius: 5px;
  margin-bottom: 5px;

  &.color-i { background: rgba(80, 227, 230, 1); }
  &.color-j { background: rgba(36, 95, 223, 1); }
  &.color-l { background: rgba(255, 174, 174, 1); }
  &.color-o { background: rgba(223, 217, 36, 1); }
  &.color-s { background: rgba(48, 211, 56, 1); }
  &.color-t { background: rgba(132, 61, 198, 1); }
  &.color-z { background: rgba(240, 80, 195, 1); }
}

.color-name {
  font-size: 0.85em;
  color: #555;
}

.shape-editor {
  display: inline-block;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 8px;
  border: 2px solid #ddd;
}

.shape-row {
  display: flex;
  gap: 3px;
}

.shape-cell {
  width: 40px;
  height: 40px;
  background: white;
  border: 2px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #ee5a24;
  }

  &.color-i { background: rgba(80, 227, 230, 1); border-color: rgba(80, 227, 230, 0.5); }
  &.color-j { background: rgba(36, 95, 223, 1); border-color: rgba(36, 95, 223, 0.5); }
  &.color-l { background: rgba(255, 174, 174, 1); border-color: rgba(255, 174, 174, 0.5); }
  &.color-o { background: rgba(223, 217, 36, 1); border-color: rgba(223, 217, 36, 0.5); }
  &.color-s { background: rgba(48, 211, 56, 1); border-color: rgba(48, 211, 56, 0.5); }
  &.color-t { background: rgba(132, 61, 198, 1); border-color: rgba(132, 61, 198, 0.5); }
  &.color-z { background: rgba(240, 80, 195, 1); border-color: rgba(240, 80, 195, 0.5); }
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
}

.btn-primary {
  background: linear-gradient(145deg, #ee5a24, #ffff6b);
  color: white;
  width: 100%;
}

.btn-success {
  background: #48c774;
  color: white;
}

.btn-secondary {
  background: #3273dc;
  color: white;
}

.btn-danger {
  background: #f14668;
  color: white;
}

.btn-back {
  background: #363636;
  color: white;
  width: 100%;
  margin-top: 20px;
}

.size-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>