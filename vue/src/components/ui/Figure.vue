<template>
  <div 
    class = "figure"
    :style = "figureStyle"
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
    },
    color: {        
      type: String,
      default: '#aa00ff'
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
        top: this.row*offset + padding + 'px',
        backgroundColor: this.color    
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
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border-radius: 4px;
}
</style>
