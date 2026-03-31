<template>
  <div class="playing_field">

    <div 
      v-for="(cell, index) in cells" 
      :key="index" 
      class="playing_field__cell"
      :class="{
        'has-figure': hasFigureAt(cell),
        'has-island': isIslandAt(cell)
      }">
      
      <div v-if="hasFigureAt(cell)" class="playing_field__figure"></div>
      
      <div 
      v-if="isIslandAt(cell)"
      class="playing_field__island"
      :class="{
        'core': isCoreCell(cell)
      }">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default{
    name: 'Playing_field',
    props:{
        fieldSize:{
            type: Number,
            default: 11
        },
        islandPosition: {
            type: Array as () => {row: number; col: number}[],
            required: true,
        },
        corePosition: {
          type: Object,
          default: () => ({row: -1, col: -1})
        },
        figures:{
          type: Array as () => any[],
          default: () => []
        }
    },
    computed: {
      cells() {
        const cells = []
        const totalCells = this.fieldSize * this.fieldSize
        
        for (let i = 0; i < totalCells; i++) {
          const row = Math.floor(i / this.fieldSize)
          const col = i % this.fieldSize
          cells.push({
            id: i,
            row,
            col,
            value: ''
          })
        }
        return cells
      }
    },
    methods: {
      hasFigureAt(position: {row: number; col: number}) {
        return this.figures.some(figure => figure.row === position.row && figure.col === position.col)
      },
      isIslandAt(position: {row: number; col: number}) {
        return this.islandPosition.some(cell => cell.row === position.row && cell.col === position.col)
      },
      isCoreCell(position: {row: number; col: number}){
        const base = this.islandPosition[0];
        return base && position.row === base.row && position.col === base.col;
      }
  }
}
</script>

<style scoped lang="scss">
$cGray: #7c3939;
.playing_field{
  display: grid;
  grid-template-rows: repeat(v-bind(fieldSize), 50px);
  grid-template-columns: repeat(v-bind(fieldSize), 50px);
  grid-gap: 1px;
  position: relative;
  
  &__cell{
    width: 50px;
    height: 50px;
    border: 1px solid #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    z-index: 1;
  }

  &__figure{
    width: 100%;
    height: 100%;
    border: 1px solid #ccc;
    display: block;
    align-items: center;
    justify-content: center;
    background: #ff4444;
    z-index: 2;
    font-weight: bold;
    font-size: 24px;
  }

  &__island{
    width: 100%;
    height: 100%;
    background: #2207ef;
  }

  &__island.core{
    background: #ffd700;
    box-shadow: 0 0 12px 4px #ffeb3b;
    z-index: 3;
  }
}
</style>
