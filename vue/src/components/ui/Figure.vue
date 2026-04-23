<template>
  <div 
    class="figure"
    :style="figureStyle"
  >
   ◼
  </div>
</template>

<script>
export default {
  name: 'Figure',
  props: {
    row: Number,
    col: Number, 
    cellSize: {      
    type: Number,
    default: 35
  }
  },
  computed: {
    //вычисление позиции фигуры
    figureStyle() {
      const gap = 2
      const padding = 2
      const offset = this.cellSize + gap

      return {
        left: this.col*offset + padding + 'px',
        top: this.row*offset + padding + 'px'
      }
    }
  }
}
</script>

<style scoped lang="scss">  
.figure {
  position: absolute;
  width: v-bind('cellSize + "px"');    
  height: v-bind('cellSize + "px"');    
  background: rgb(174, 0, 255);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border-radius: 4px;
}
</style>
