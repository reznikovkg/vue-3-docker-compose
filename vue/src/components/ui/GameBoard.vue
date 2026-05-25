<template>
  <div class="game-board">
    <div class="game-board--score">Счет: {{score}}</div>
    <div class="game-board--grid">
      <div v-for="(row, y) in grid" :key="y" class="game-board--row">
        <Cell
          v-for="(cell, x) in row"
          :key="x"
          :item="cell"
          :x="x"
          :y="y"
          @drop="(e) => onDrop(e)"
          @drag-start="(e) => onDragStart(e)"
          @cell-click="(e) => onCellClick(e)"
          @cell-right-click="(e) => onCellRightClick(e)"
          />
      </div>
    </div>
    <button
      class="game-board--btn btn-expand"
      @click="(e) => expandGrid(e)"
      :disabled="!expandInfo.canExpand"
    >
      Расширить поле ({{expandInfo.cost}} очков)
      <div v-if="!expandInfo.canExpand" class="btn-expand--hint">
        Требуется баланс: {{expandInfo.condition}}
      </div>
    </button>
    <button class="game-board--btn" @click="spawn">Добавить</button>
    <button class="game-board--btn" @click="restart">Перезапустить</button>

    <div class="game-board--hints">
      <i>ЛКМ по 4 уровню — спавн нового предмета за 5 очков <br>
        ПКМ по клетке — продать</i>
    </div>
  </div>
</template>
<script>
import {mapGetters, mapActions} from 'vuex';
import Cell from "@/components/ui/Cell.vue";
export default {
  name: "GameBoard",
  components: {Cell},
  data() {
    return {
      dragged: null
    }
  },
  computed: {
    ...mapGetters('game', {
      grid: 'getGrid',
      score: 'getScore',
      size: 'getSize',
      expandInfo: 'getExpandInfo'
    })
  },
  mounted() {
    this.initGame();
  },
  methods: {
    ...mapActions('game', ['initGame', 'restart', 'spawn', 'handleDrop','spawnFromMax','sellItem', 'expandGrid']),
    onDragStart(position) {
      this.dragged = position;
    },
    onDrop(positionTo) {
      if (!this.dragged) return;
      this.handleDrop({positionFrom: this.dragged, positionTo});
      this.dragged = null;
    },

    onCellClick({item}) {
      if(item && item.level === 4) this.spawnFromMax(item.branch);
    },
    onCellRightClick(position) {
      this.sellItem(position);
    }
  }
}
</script>
<style scoped lang="scss">
.game-board {
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: white;

  &--score {
    font-size: 20px;
  }

  &--grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: #0f172a;
    padding: 12px;
    border-radius: 12px;
    width: fit-content;
    margin: 0 auto;
  }

  &--row {
    display: flex;
    gap: 10px;
    justify-content: center;
  }

  &--btn {
    padding: 8px;
    border-radius: 6px;
    background: limegreen;
    color: white;
    border: none;
    cursor: pointer;

    &:hover:not(:disabled) {
      opacity: 0.9;
    }

    &:disabled {
      background: grey;
      cursor: not-allowed;
      opacity: 0.8;
    }
  }
  .btn-expand {
    background: dodgerblue;
    display: flex;
    flex-direction: column;
    align-items: center;

    &--hint {
      font-size: 11px;
      color: snow;
      margin-top: 4px;
    }
  }

  .btn-restart {
    background: red;
  }

  &--hints {
    font-size: 14px;
    margin-top: 10px;
    color: white;
    line-height: 1.4;
  }
}
</style>