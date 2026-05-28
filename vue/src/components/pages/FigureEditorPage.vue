<template>
  <div class="editor">
    <div class="editor__sidebar">
      <div class="editor__header">
        <h1 class="editor__title">Редактор фигур</h1>
        <RouterLink class="editor__back" :to="{ name: $routes.INDEX }">← На главную</RouterLink>
        <RouterLink class="editor__back" :to="{ name: $routes.PROM }">К игре</RouterLink>
      </div>

      <div class="editor__list">
        <button
          v-for="figure in getFigures"
          :key="figure.id"
          class="editor__item"
          :class="{ 'editor__item--active': selectedId === figure.id }"
          type="button"
          @click="() => selectFigure(figure.id)"
        >
          <span class="editor__item-swatch" :style="{ background: figure.color }" />
          <span class="editor__item-name">{{ figure.name }}</span>
          <span v-if="figure.isDefault" class="editor__item-tag">base</span>
        </button>
      </div>

      <div class="editor__list-actions">
        <button class="editor__button" type="button" @click="() => createNew()">+ Новая</button>
        <button class="editor__button" type="button" @click="() => onReset()">Сбросить базовые</button>
      </div>
    </div>

    <div class="editor__workspace">
      <div class="editor__fields">
        <label class="editor__label">
          <span class="editor__label-text">Имя</span>
          <input
            v-model="draftName"
            class="editor__input"
            type="text"
            maxlength="32"
          >
        </label>

        <label class="editor__label">
          <span class="editor__label-text">Цвет</span>
          <input
            v-model="draftColor"
            class="editor__color"
            type="color"
          >
        </label>
      </div>

      <div class="editor__hint">
        Клик по клетке — добавить/убрать. Центр (0,0) выделен — обычно якорь фигуры.
      </div>

      <div class="editor__grid" :style="gridStyles">
        <template v-for="row in gridRange" :key="`row-${row}`">
          <div
            v-for="col in gridRange"
            :key="`${row}-${col}`"
            class="editor__cell"
            :class="getEditorCellClasses(col, row)"
            :style="getEditorCellStyle(col, row)"
            @click="() => toggleCell(col, row)"
          />
        </template>
      </div>

      <div class="editor__actions">
        <button
          class="editor__button editor__button--primary"
          type="button"
          :disabled="!canSave"
          @click="() => onSave()"
        >
          Сохранить
        </button>

        <button
          class="editor__button"
          type="button"
          :disabled="!canSave"
          @click="() => onSaveAsNew()"
        >
          Сохранить как новую
        </button>

        <button
          class="editor__button editor__button--danger"
          type="button"
          :disabled="!canDelete"
          @click="() => onDelete()"
        >
          Удалить
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapActions, mapGetters } from 'vuex'

type Cell = {
  x: number
  y: number
}

type Figure = {
  id: string
  name: string
  cells: Cell[]
  color: string
  isDefault?: boolean
}

const GRID_RADIUS = 3
const DEFAULT_NEW_COLOR = '#00d389'
const DEFAULT_NEW_NAME = 'Новая'

export default {
  name: 'FigureEditorPage',
  data () {
    return {
      selectedId: null as string | null,
      draftName: '',
      draftColor: DEFAULT_NEW_COLOR,
      draftCells: [] as Cell[]
    }
  },
  computed: {
    ...mapGetters('figures', ['getFigures']),

    gridRange (): number[] {
      const result: number[] = []

      for (let i = -GRID_RADIUS; i <= GRID_RADIUS; i += 1) {
        result.push(i)
      }

      return result
    },

    gridStyles (): Record<string, string> {
      const count = GRID_RADIUS * 2 + 1

      return {
        gridTemplateColumns: `repeat(${count}, var(--editor-cell-size))`,
        gridTemplateRows: `repeat(${count}, var(--editor-cell-size))`
      }
    },

    draftCellKeys (): Set<string> {
      return new Set(this.draftCells.map((cell: Cell) => `${cell.x}:${cell.y}`))
    },

    canSave (): boolean {
      return this.draftCells.length > 0 && this.draftName.trim() !== ''
    },

    canDelete (): boolean {
      if (this.selectedId === null) {
        return false
      }

      const figure = (this.getFigures as Figure[]).find((item: Figure) => item.id === this.selectedId)

      return Boolean(figure && !figure.isDefault)
    }
  },

  mounted () {
    const figures = this.getFigures as Figure[]

    if (figures.length > 0) {
      this.selectFigure(figures[0].id)
    } else {
      this.createNew()
    }
  },

  methods: {
    ...mapActions('figures', [
      'saveFigure',
      'saveAsNewFigure',
      'deleteFigure',
      'resetFigures'
    ]),

    selectFigure (id: string) {
      const figure = (this.getFigures as Figure[]).find((item: Figure) => item.id === id)

      if (!figure) {
        return
      }

      this.selectedId = id
      this.draftName = figure.name
      this.draftColor = figure.color
      this.draftCells = figure.cells.map((cell: Cell) => ({ x: cell.x, y: cell.y }))
    },

    createNew () {
      this.selectedId = null
      this.draftName = DEFAULT_NEW_NAME
      this.draftColor = DEFAULT_NEW_COLOR
      this.draftCells = [{ x: 0, y: 0 }]
    },

    toggleCell (x: number, y: number) {
      const key = `${x}:${y}`

      if (this.draftCellKeys.has(key)) {
        this.draftCells = this.draftCells.filter((cell: Cell) => `${cell.x}:${cell.y}` !== key)
        return
      }

      this.draftCells = [...this.draftCells, { x, y }]
    },

    isDraftCell (x: number, y: number) {
      return this.draftCellKeys.has(`${x}:${y}`)
    },

    isOriginCell (x: number, y: number) {
      return x === 0 && y === 0
    },

    getEditorCellClasses (x: number, y: number) {
      return {
        'editor__cell--active': this.isDraftCell(x, y),
        'editor__cell--origin': this.isOriginCell(x, y)
      }
    },

    getEditorCellStyle (x: number, y: number): Record<string, string> {
      if (this.isDraftCell(x, y)) {
        return {
          background: this.draftColor,
          borderColor: this.draftColor
        }
      }

      return {}
    },

    onSave () {
      if (!this.canSave) {
        return
      }

      this.saveFigure({
        id: this.selectedId,
        name: this.draftName.trim(),
        cells: this.draftCells,
        color: this.draftColor
      }).then((nextId: unknown) => {
        if (typeof nextId === 'string') {
          this.selectedId = nextId
        }
      })
    },

    onSaveAsNew () {
      if (!this.canSave) {
        return
      }

      this.saveAsNewFigure({
        name: this.draftName.trim(),
        cells: this.draftCells,
        color: this.draftColor
      }).then((nextId: unknown) => {
        if (typeof nextId === 'string') {
          this.selectedId = nextId
        }
      })
    },

    onDelete () {
      if (!this.canDelete || this.selectedId === null) {
        return
      }

      this.deleteFigure(this.selectedId).then(() => {
        const figures = this.getFigures as Figure[]

        if (figures.length > 0) {
          this.selectFigure(figures[0].id)
        } else {
          this.createNew()
        }
      })
    },

    onReset () {
      this.resetFigures().then(() => {
        const figures = this.getFigures as Figure[]

        if (figures.length > 0) {
          this.selectFigure(figures[0].id)
        } else {
          this.createNew()
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.editor {
  --editor-cell-size: 36px;

  display: grid;
  grid-template-columns: minmax(260px, 320px) 1fr;
  gap: 24px;
  align-items: start;
  padding: 16px;

  &__sidebar {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__title {
    font-size: 24px;
    line-height: 1;
  }

  &__back {
    color: rgba(235, 235, 235, 0.72);
    text-decoration: none;
    font-size: 14px;

    &:hover {
      color: inherit;
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 60vh;
    overflow-y: auto;
    padding: 4px;
    border: 1px solid var(--color-border);
    background: rgba(255, 255, 255, 0.02);
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border: 1px solid transparent;
    background: transparent;
    color: inherit;
    cursor: pointer;
    text-align: left;
    font-size: 14px;

    &:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    &--active {
      border-color: var(--color-border);
      background: rgba(255, 255, 255, 0.1);
    }
  }

  &__item-swatch {
    width: 18px;
    height: 18px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    flex-shrink: 0;
  }

  &__item-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__item-tag {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(235, 235, 235, 0.5);
  }

  &__list-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__workspace {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__fields {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  &__label {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__label-text {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(235, 235, 235, 0.64);
  }

  &__input {
    padding: 10px 12px;
    border: 1px solid var(--color-border);
    background: rgba(255, 255, 255, 0.06);
    color: inherit;
    min-width: 200px;
  }

  &__color {
    width: 64px;
    height: 40px;
    border: 1px solid var(--color-border);
    background: transparent;
    cursor: pointer;
    padding: 2px;
  }

  &__hint {
    color: rgba(235, 235, 235, 0.6);
    font-size: 13px;
  }

  &__grid {
    display: grid;
    gap: 2px;
    padding: 12px;
    width: max-content;
    border: 1px solid var(--color-border);
    background: #0e1620;
  }

  &__cell {
    width: var(--editor-cell-size);
    height: var(--editor-cell-size);
    border: 1px solid rgba(207, 214, 221, 0.16);
    background: rgba(255, 255, 255, 0.04);
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    &--origin {
      border-color: rgba(0, 157, 255, 0.6);
      background: rgba(0, 157, 255, 0.1);
    }

    &--active {
      &:hover {
        opacity: 0.85;
      }
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__button {
    padding: 10px 16px;
    border: 1px solid #d7dde3;
    background: transparent;
    color: inherit;
    cursor: pointer;
    transition: background-color 0.2s ease;
    font-size: 14px;

    &:hover:enabled {
      background: rgba(255, 255, 255, 0.08);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }

    &--primary {
      border-color: #00b877;
      background: #00d389;
      color: #072014;

      &:hover:enabled {
        background: #0be59a;
      }
    }

    &--danger {
      border-color: #c20000;
      color: #ff8a8a;

      &:hover:enabled {
        background: rgba(194, 0, 0, 0.15);
      }
    }
  }
}

@media (max-width: 880px) {
  .editor {
    grid-template-columns: 1fr;
  }
}
</style>
