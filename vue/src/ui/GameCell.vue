<template>
  <div
    class="game-cell"
    :class="cellClasses"
    :draggable="Boolean(cell)"
    @dragstart="handleDragStart"
    @dragover.prevent
    @drop="(event) => handleDrop(event)"
    @click="() => handleTouchClick()"
    @dblclick="() => handleFinalItem()"
    @contextmenu.prevent="() => handleSellItem()"
  >
    <div
      v-if="cell"
      class="game-cell__item"
    >
      <div class="game-cell__emoji">
        {{ cell.emoji }}
      </div>
      <div class="game-cell__level">
        {{ cell.level }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { ACTIONS } from './../store/game'

export default {
  name: 'GameCell',
  props: {
    cell: {
      type: Object,
      default: null,
    },
    row: {
      type: Number,
      required: true,
    },
    column: {
      type: Number,
      required: true,
    },
  },
  computed: {
    ...mapGetters({
      selectedCell: 'game/getSelectedCell',
    }),
    cellClasses () {
      return {
        'game-cell--filled': this.cell,
      }
    },
  },
  methods: {
    ...mapActions({
      mergeItems: `game/${ACTIONS.MERGE_ITEMS}`,
      setSelectedCell: `game/${ACTIONS.SET_SELECTED_CELL}`,
      useFinalItem: `game/${ACTIONS.USE_FINAL_ITEM}`,
      sellItem: `game/${ACTIONS.SELL_ITEM}`,
    }),
    handleDragStart (event) {
      if (!this.cell) {
        return
      }
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData(
        'application/json',
        JSON.stringify({
          row: this.row,
          column: this.column,
        })
      )
    },
    handleDrop (event) {
      const data = JSON.parse(
        event.dataTransfer.getData('application/json')
      )
      if (!data) {
        return
      }
      if (
        data.row === this.row
        && data.column === this.column
      ) {
        return
      }
      this.mergeItems({
        fromRow: data.row,
        fromColumn: data.column,
        toRow: this.row,
        toColumn: this.column,
      })
    },
    handleTouchClick () {
      if (!this.cell) {
        return
      }
      if (!this.selectedCell) {
        this.setSelectedCell({
          row: this.row,
          column: this.column,
        })
        return
      }
      this.mergeItems({
        fromRow: this.selectedCell.row,
        fromColumn: this.selectedCell.column,
        toRow: this.row,
        toColumn: this.column,
      })
      this.setSelectedCell(null)
    },
    handleFinalItem () {
      if (!this.cell?.final) {
        return
      }
      this.useFinalItem({
        row: this.row,
        column: this.column,
      })
    },
    handleSellItem () {
      if (!this.cell) {
        return
      }
      this.sellItem({
        row: this.row,
        column: this.column,
      })
    },
  },
}
</script>

<style scoped lang="scss">
.game-cell {
  width: 80px;
  height: 80px;
  border-radius: 14px;
  background: #dcdcdc;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
  &--filled {
    background: #bfdbfe;
    cursor: grab;
  }
  &__item {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    user-select: none;
    pointer-events: none;
  }
  &__emoji {
    font-size: 28px;
  }
  &__level {
    margin-top: 4px;
    font-size: 14px;
    font-weight: 700;
  }
}
</style>