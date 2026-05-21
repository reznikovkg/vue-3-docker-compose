<template>
  <button class="openBtn" @click="() => isOpen = true">
    <img src="/icons/icons8-settings-80.png">
  </button>

  <div v-if="isOpen" class="overlay" @click="(e) => handleOverlayClick(e)"> 
    <div class="figureEditor">

      <div class="figureEditor__header">
        <h3 class="figureEditor__title">Редактор фигур</h3>
        <div class="figureEditor__header--btns">
          <button class="figureEditor__resetBtn" @click="() => handleReset()">Сбросить всё</button>
          <button class="figureEditor__closeBtn" @click="() => isOpen = false">✕</button>
        </div>
      </div>

      <div class="figureEditor__body">

        <div class="figureEditor__left">
          <div class="figureEditor__list">
            <div
              v-for="shape in getShapes"
              :key="shape.id"
              class="figureEditor__item"
              :class="{'figureEditor__item--active': shape.id === getActiveShapeId}"
              @click="() => handleSelectShape(shape.id)"
            >
              <div class="figureEditor__item--preview">
                <div
                  class="figureEditor__item--previewGrid"
                  :style="{
                    gridTemplateRows: 'repeat(' + previewRowCount(shape) + ', 10px)',
                    gridTemplateColumns: 'repeat(' + previewColCount(shape) + ', 10px)'
                  }"
                >
                  <div
                    v-for="(cell, idx) in previewCells(shape)"
                    :key="idx"
                    class="figureEditor__item--previewCell"
                    :class="{'filled': cell.filled}"
                    :style="{
                      gridRow: cell.gridRow,
                      gridColumn: cell.gridCol,
                      background: cell.filled ? shape.color : 'transparent',
                      border: cell.filled ? '1px solid rgba(0,0,0,0.15)' : 'none',
                    }"
                  ></div>
                </div>
              </div>
              <div class="figureEditor__item--info">
                <span class="figureEditor__item--name">{{ shape.name }}</span>
                <div class="figureEditor__item--colorDot" :style="{background: shape.color}"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="figureEditor__right">

          <div v-if="!getActiveShapeId && !editingShape" class="figureEditor__hint">
            ← Выбери фигуру слева
          </div>

          <div v-if="getActiveShapeId && !editingShape" class="figureEditor__actions">
            <div class="figureEditor__btn">
              <button class="figureEditor__btn--edit" @click="() => handleEdit()">Изменить</button>
              <button class="figureEditor__btn--saveAs" @click="() => handleSaveAsCurrent()">Сохранить как новую</button>
            </div>
          </div>

          <div v-if="editingShape" class="figureEditor__editor">
            <div class="figureEditor__editor--row">
              <label class="figureEditor__label">Название:</label>
              <input v-model="editingShape.name" type="text" maxlength="24" class="figureEditor__input">
            </div>
            <div class="figureEditor__editor--row">
              <label class="figureEditor__label">Цвет:</label>
              <input v-model="editingShape.color" type="color" class="figureEditor__colorInput">
              <span class="figureEditor__colorHex">{{ editingShape.color }}</span>
            </div>
            <div class="figureEditor__editor--row">
              <label class="figureEditor__label">Сетка (нажми на клетку):</label>
            </div>
            <div class="figureEditor__grid">
              <div
                v-for="(cell, idx) in editorGridCells"
                :key="idx"
                class="figureEditor__grid--cell"
                :class="{'figureEditor__grid--cell--filled': cell.filled}"
                :style="{
                  background: cell.filled ? editingShape.color : '#f0f0f0',
                  borderColor: cell.filled ? editingShape.color : '#ccc',
                }"
                @click="() => toggleCell(cell.row, cell.col)"
              ></div>
            </div>
            <div class="figureEditor__grid--actions">
              <div class="figureEditor__btn">
                <button class="figureEditor__btn--save" @click="() => handleSave()">Сохранить</button>
                <button class="figureEditor__btn--saveAs" @click="() => handleSaveAs()">Сохранить как новую</button>
                <button v-if="!isBaseShape(editingShape.id)" class="figureEditor__btn--delete" @click="() => handleDelete(editingShape.id)">Удалить</button>
                <button class="figureEditor__btn--cancel" @click="() => handleCancel()">Отмена</button>
              </div>
            </div>
          </div>

          <!-- встроенный диалог вместо prompt -->
          <div v-if="showNameInput" class="figureEditor__dialog">
            <div class="figureEditor__dialog--box">
              <p class="figureEditor__dialog--title">Название новой фигуры</p>
              <input
                v-model="newFigureName"
                class="figureEditor__input"
                placeholder="Введите название"
                @keyup="(e) => handleNameInputKey(e)" 
              >
              <div class="figureEditor__btn">
                <button class="figureEditor__btn--save" @click="() => confirmSaveAs()">OK</button>
                <button class="figureEditor__btn--cancel" @click="() => showNameInput = false">Отмена</button>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>

</template>

<script lang="ts">
import { mapGetters, mapActions } from 'vuex'

const EDITOR_GRID_SIZE = 7
const EDITOR_CENTER = Math.floor(EDITOR_GRID_SIZE / 2)
const BASE_IDS = ['I', 'O', 'T', 'S', 'Z', 'L', 'J']

export default{
  name: 'FigureEditor',
  data() {
    return {
      editingShape: null as any,
      isOpen: false,
      newFigureName: '',
      showNameInput: false,
      saveAsSource: '',
    }
  },
  computed: {
    ...mapGetters('figureShapes',[
      'getShapes',
      'getActiveShapeId',
      'getActiveShape',
      'getShapeById'
    ]),

    editorGridCells(){
      if (!this.editingShape) return []
      const cells = []
      for (let r = 0; r < EDITOR_GRID_SIZE; r++){
        for (let c = 0; c < EDITOR_GRID_SIZE; c++){
          const relRow = r - EDITOR_CENTER
          const relCol = c - EDITOR_CENTER
          const filled = this.editingShape.cells.some((cell: {row: number; col: number}) => cell.row === relRow && cell.col === relCol)
          cells.push({row: relRow, col: relCol, filled})
        }
      }
      return cells
    },
  },
  methods: {
    ...mapActions('figureShapes', [
      'addShape',
      'updateShape',
      'removeShape',
      'setActiveShapeId',
      'resetToDefaults',
      'saveShapeAs',
      'loadShapes',
    ]),

    handleReset(){
      if (!confirm('Сбросить все фигуры до базовых? Пользовательские фигуры будут удалены.')) return
      this.resetToDefaults()
      this.editingShape = null
    },

    handleSelectShape(id: string){
      this.setActiveShapeId(id)
      this.editingShape = null
      console.log(`Selected figure: ${id}`)
    },

    handleOverlayClick(e: MouseEvent){
      if (e.target === e.currentTarget){
        this.isOpen = false
      }
    },

    previewCells(shape: any){
      if (!shape.cells || shape.cells.length === 0) return []
      const rows = shape.cells.map((c: any) => c.row)
      const cols = shape.cells.map((c: any) => c.col)
      const minRow = Math.min(...rows)
      const maxRow = Math.max(...rows)
      const minCol = Math.min(...cols)
      const maxCol = Math.max(...cols)
      const result = []
      for (let r = minRow; r <= maxRow; r++){
        for (let c = minCol; c <= maxCol; c++){
          const filled = shape.cells.some((cell: any) => cell.row === r && cell.col === c)
          result.push({
            gridRow: r - minRow + 1,
            gridCol: c - minCol + 1,
            filled,
          })
        }
      }
      return result
    },

    previewRowCount(shape: any){
      if (!shape?.cells?.length) return 1
      const rows = shape.cells.map((c: any) => c.row)
      return Math.max(...rows) - Math.min(...rows) + 1
    },

    previewColCount(shape: any){
      if (!shape?.cells?.length) return 1
      const cols = shape.cells.map((c: any) => c.col)
      return Math.max(...cols) - Math.min(...cols) + 1
    },

    toggleCell(row: number, col: number){
      if (!this.editingShape) return
      const idx = this.editingShape.cells.findIndex((c: any) => c.row === row && c.col === col)
      if (idx !== -1){
        if (this.editingShape.cells.length <= 1) return
        this.editingShape.cells.splice(idx, 1)
      } else {
        this.editingShape.cells.push({row, col})
      }
    },

    handleEdit(){
      const shape = this.getActiveShape
      if (!shape) return
      this.editingShape = {
        ...shape,
        cells: shape.cells.map((c: any) => ({...c}))
      }
    },

    handleSave(){
      if (!this.editingShape) return
      this.updateShape({
        ...this.editingShape,
        cells: this.editingShape.cells.map((c: any) => ({...c}))
      })
      this.editingShape = null
    },

    handleSaveAs(){
      if (!this.editingShape) return
      this.newFigureName = this.editingShape.name + ' (copy)'
      this.saveAsSource = 'editing'
      this.showNameInput = true
    },

    handleSaveAsCurrent(){
      if (!this.getActiveShapeId) return
      this.newFigureName = (this.getActiveShape?.name ?? '') + ' (copy)'
      this.saveAsSource = 'current'
      this.showNameInput = true
    },

    confirmSaveAs(){
      if (!this.newFigureName) return
      if (this.saveAsSource === 'editing' && this.editingShape){
        this.addShape({
          ...this.editingShape,
          name: this.newFigureName,
          cells: this.editingShape.cells.map((c: any) => ({...c}))
        })
        this.editingShape = null
      } else if (this.saveAsSource === 'current'){
        this.saveShapeAs({sourceId: this.getActiveShapeId, name: this.newFigureName})
      }
      this.showNameInput = false
      this.newFigureName = ''
    },

    isBaseShape(id: string){
      return BASE_IDS.includes(id)
    },

    handleDelete(id: string){
      if (!confirm('Удалить фигуру?')) return
      this.removeShape(id)
      this.editingShape = null
      if (this.getActiveShapeId === id){
        this.setActiveShapeId(null)
      }
    },

    handleCancel(){
      this.editingShape = null
    },

    handleNameInputKey(e: KeyboardEvent){
      if (e.key === 'Enter'){
        this.confirmSaveAs()
      }
    },
  }
}
</script>

<style scoped lang="scss">
.openBtn {
    width: 50px;
    height: 50px;
    border: none;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 28px;
    background: white;
    position: relative;

    &:hover {
        transform: scale(1.08);
    }
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
}
.figureEditor {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 28px;
  border-radius: 16px;
  background: white;
  width: 780px;
  max-height: 88vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &--btns {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  &__title {
    font-size: 18px;
    font-weight: bold;
    color: #222;
    margin: 0;
  }

  &__resetBtn {
    font-size: 12px;
    padding: 5px 12px;
    border: 1px solid #ccc;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    color: #888;
    transition: background 0.2s;

    &:hover {
      background: #f0f0f0;
      color: #333;
    }
  }

  &__closeBtn {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: none;
    background: #eee;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover { background: #ddd; }
  }

  &__body {
    display: flex;
    gap: 0;
    align-items: flex-start;
    min-height: 420px;
  }

  &__left {
    width: 300px;
    flex-shrink: 0;
    border-right: 2px solid #f0f0f0;
    padding-right: 20px;
  }

  &__right {
    flex: 1;
    padding-left: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: relative;
  }

  &__hint {
    color: #bbb;
    font-size: 15px;
    text-align: center;
    padding-top: 100px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 500px;
    overflow-y: auto;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 10px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    background: white;
    transition: border-color 0.2s, background 0.2s;

    &:hover {
      border-color: #90caf9;
      background: #f0f7ff;
    }

    &--active {
      border-color: #1976d2;
      background: #e3f2fd;
    }

    &--preview {
      width: 50px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &--previewGrid {
      display: grid;
      gap: 1px;
    }

    &--previewCell {
      width: 10px;
      height: 10px;
      border-radius: 2px;
      background: transparent;
    }

    &--info {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    &--name {
      font-size: 13px;
      color: #333;
      flex: 1;
    }

    &--colorDot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.15);
      flex-shrink: 0;
    }
  }

  &__editor {
    display: flex;
    flex-direction: column;
    gap: 12px;

    &--row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }

  &__label {
    font-size: 13px;
    color: #555;
    white-space: nowrap;
  }

  &__input {
    flex: 1;
    padding: 6px 10px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 6px;

    &:focus {
      outline: none;
      border-color: #90caf9;
    }
  }

  &__colorInput {
    width: 40px;
    height: 32px;
    border: 1px solid #ccc;
    border-radius: 6px;
    cursor: pointer;
    padding: 2px;
  }

  &__colorHex {
    font-size: 13px;
    color: #888;
    font-family: monospace;
  }

  &__grid {
    display: grid;
    grid-template-rows: repeat(7, 28px);
    grid-template-columns: repeat(7, 28px);
    gap: 2px;

    &--cell {
      width: 28px;
      height: 28px;
      border: 1px solid #ccc;
      border-radius: 3px;
      cursor: pointer;
      transition: background 0.1s, border-color 0.1s;

      &:hover {
        opacity: 0.75;
        transform: scale(1.08);
      }

      &--filled {
        border-width: 2px;
      }
    }

    &--actions {
      margin-top: 4px;
    }
  }

  &__btn {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    &--save, &--saveAs, &--cancel, &--edit, &--delete{
      padding: 7px 14px;
      font-size: 13px;
      border: none;
      border-radius: 7px;
      cursor: pointer;
      font-weight: bold;
      transition: opacity 0.2s, transform 0.1s;

      &:hover {
        opacity: 0.85;
        transform: scale(1.03);
      }

      &:active {
        transform: scale(0.97);
      }

    }
    &--save{
      background: #4caf50; 
      color: white;
    }
    &--saveAs{
      background: #1976d2; 
      color: white; 
    }
    &--delete{
      background: #f44336; 
      color: white;
    }
    &--cancel{
      background: #e0e0e0; 
      color: #333;
    }
    &--edit{
      background: #ff9800; 
      color: white;
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 8px;
  }

  &__dialog {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.45);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;

    &--box {
      background: white;
      border-radius: 12px;
      padding: 24px;
      width: 260px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }

    &--title {
      font-size: 15px;
      font-weight: bold;
      color: #333;
      margin: 0;
    }
  }
}
</style>
