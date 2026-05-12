<template>
  <div class = "editor-page">
    <div class = "editor-page__header">
      <h1 class = "editor-page__title">Редактор фигур</h1>
      <p class = "editor-page__subtitle">Перед началом игры выберите 3 вылетающие фигуры!</p>
    </div>

    <!-- Базовые фигуры -->
    <div class = "editor-page__base-figures">
      <h3 class = "editor-page__section-title">Базовые фигуры</h3>
      <div class = "editor-page__base-figures-list">
        <div
          v-for = "fig in baseFiguresAsMatrix"
          :key = "fig.id"
          class = "editor-page__base-figure-card"
          @click = "() => loadBaseFigureToEditorById(fig.id)"
        >
          <div class = "editor-page__base-figure-card__preview">
            <div
              v-for = "(row, i) in fig.cells"
              :key = "i"
              class = "editor-page__base-figure-card__row"
            >
              <div
                v-for = "(cell, j) in row"
                :key = "j"
                class = "editor-page__base-figure-card__cell"
                :class = "{ 'editor-page__base-figure-card__cell--active': cell }"
              />
            </div>
          </div>
          <p>{{ fig.name }}</p>
        </div>
      </div>
    </div>

    <!-- Редактор -->
    <div class = "editor-page__editor">
      <h3 class = "editor-page__section-title">Редактор</h3>
      <div class = "editor-page__grid-wrapper">
        <FigureGrid
          :cells = "currentFigureCells"
          @update = "updateCurrentFigureCells"
        />
      </div>

      <div class = "editor-page__tools">
        <span class = "editor-page__color-label">Изменить цвет:</span>
        <input
          class = "editor-page__color-input"
          type = "color"
          :value = "currentFigureColor"
          @input = "(event) => updateCurrentFigureColor(event.target.value)"
        >
        <div class = "editor-page__buttons">
          <button @click = "() => saveCurrentFigure()">Сохранить фигуру</button>
          <button @click = "() => resetCurrentFigure()">Очистить</button>
        </div>
      </div>
    </div>

    <!-- Мои фигуры -->
    <div class = "editor-page__my-figures">
      <h3 class = "editor-page__section-title">Мои фигуры</h3>
      <div class = "editor-page__my-figures-list">
        <div
          v-for = "fig in customFiguresForDisplay"
          :key = "fig.id"
          class = "editor-page__my-figure-card"
          :class = "{ 'editor-page__my-figure-card--selected': fig.selected }"
        >
          <div class = "editor-page__my-figure-card__preview">
            <div
              v-for = "(row, i) in fig.cells"
              :key = "i"
              class = "editor-page__my-figure-card__row"
            >
              <div
                v-for = "(cell, j) in row"
                :key = "j"
                class = "editor-page__my-figure-card__cell"
                :class = "{ 'editor-page__my-figure-card__cell--active': cell }"
                :style = "{ backgroundColor: cell ? fig.color : 'transparent' }"
              />
            </div>
          </div>
          <div class = "editor-page__my-figure-card__info">
            <button @click = "() => selectFigureForGame(fig)">Выбрать</button>
            <button @click = "() => deleteFigure(fig.id)">Удалить</button>
          </div>
        </div>
      </div>
    </div>

    <div class = "editor-page__footer">
      <button
        @click = "() => startGame()"
        :disabled = "selectedCount !== 3"
      >
        Начать игру ({{ selectedCount }}/3)
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import FigureGrid from '@/components/ui/FigureGrid.vue'

export default {
  name: 'EditorPage',
  components: { FigureGrid },
  computed: {
    ...mapGetters('game', [
      'allFigures',
      'currentFigureCells',
      'currentFigureColor',
      'customFigures',
      'currentEditingFigureId'
    ]),
    baseFigures() {
      return this.allFigures.filter(f => f.isBase)
    },
    selectedCount() {
      return this.customFigures.filter(f => f.selected).length
    },
    baseFiguresAsMatrix() {
      return this.baseFigures.map(fig => ({
        ...fig,
        cells: this.coordsToMatrix(fig.cells)
      }))
    },
    customFiguresForDisplay() {
      return this.customFigures.map(fig => ({
        ...fig,
        cells: this.coordsToMatrix(fig.cells)
      }))
    }
  },
  methods: {
    ...mapActions('game', [
      'toggleCellInCurrentFigure',
      'saveCurrentFigure',
      'loadBaseFigureToEditor',
      'resetCurrentFigure'
    ]),
    coordsToMatrix(coords) {
      const matrix = Array(4).fill().map(() => Array(4).fill(false))
      for (const [row, col] of coords) {
        if (row >= 0 && row < 4 && col >= 0 && col < 4) {
          matrix[row][col] = true
        }
      }
      return matrix
    },
    updateCurrentFigureCells(newCells) {
      for (let i = 0; i < newCells.length; i++) {
        for (let j = 0; j < newCells[i].length; j++) {
          if (newCells[i][j] !== this.currentFigureCells[i]?.[j]) {
            this.toggleCellInCurrentFigure({ row: i, col: j })
          }
        }
      }
    },
    updateCurrentFigureColor(color) {
      this.$store.commit('game/SET_CURRENT_FIGURE_COLOR', color)
    },
    loadBaseFigureToEditorById(id) {
      const figure = this.baseFigures.find(f => f.id === id)   
      this.$store.dispatch('game/loadBaseFigureToEditor', figure)
    },
    selectFigureForGame(figure) {
      const updatedFigures = this.customFigures.map(f => {
      if (f.id === figure.id) {
        return { ...f, selected: !f.selected }
      }
      return f
      })
  
      this.$store.commit('game/SET_CUSTOM_FIGURES', updatedFigures)
    },
    deleteFigure(id) {
      this.$store.commit('game/REMOVE_CUSTOM_FIGURE', id)
    },
    startGame() {
      const selected = this.customFigures.filter(f => f.selected === true)
      if (selected.length !== 3) {
        alert('Выберите ровно 3 фигуры')
        return
      }
      this.$store.commit('game/SET_SELECTED_FIGURES', selected)
      this.$router.push({ name: 'GAME' })
    }
  }
}
</script>

<style scoped lang = "scss">
.editor-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  &__base-figures,
  &__editor,
  &__my-figures {
    margin-bottom: 40px;
    border: 1px solid #ccc;
    padding: 20px;
    border-radius: 16px;
  }
  &__footer {
    text-align: center;
    button {
      padding: 12px 24px;
      font-size: 18px;
    }
  }
  &__color-label {
    font-weight: bold;
    font-size: 16px;
  }
  &__header {
    text-align: center;
    margin-bottom: 30px;
  }
  &__title {
    font-size: 32px;
    margin-bottom: 10px;
    color: #333;
  }
  &__subtitle {
    font-size: 16px;
    color: #666;
  }
  &__section-title {
    text-align: center;
    margin-bottom: 20px;
    font-size: 22px;
    color: #444;
  }
  &__grid-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }
  &__tools {
    margin-top: 20px;
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  }
  &__color-input {
    width: 50px;
    height: 40px;
    cursor: pointer;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
  &__buttons {
    margin-left: 20px;   
    display: flex;
    gap: 10px;
  }
  &__base-figures-list,
  &__my-figures-list {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  }
  &__base-figure-card {
    width: 120px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 12px;
    text-align: center;
    cursor: pointer;
    transition: 0.2s;

    &:hover {
      background: #f0f0f0;
      transform: scale(1.02);
    }
    &__preview {
      display: inline-block;
      margin-bottom: 8px;
    }
    &__row {
      display: flex;
    }
    &__cell {
      width: 20px;
      height: 20px;
      background: #ddd;
      margin: 1px;

      &--active {
        background: #333;
      }
    }
  }

  &__my-figure-card {
    width: 140px;
    background: #f9f9f9;
    border-radius: 12px;
    padding: 10px;
    text-align: center;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);

    &--selected {
      background: #c8e6c9;
      border: 2px solid #2e7d32;
    }
    &__preview {
      display: inline-block;
      margin-bottom: 8px;
    }
    &__row {
      display: flex;
    }
    &__cell {
      width: 20px;
      height: 20px;
      background: #ddd;
      margin: 1px;

      &--active {
        background: #333;
      }
    }
    &__info {
      button {
        margin: 2px;
        font-size: 11px;
      }
    }
  }
}
</style>