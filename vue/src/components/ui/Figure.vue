<template>
  <div 
    class="figure"
    :style="figureStyle"
  >
    █
  </div>
</template>

<script>
export default {
  name: 'Figure',
  props: {
    row: Number, //текущий ряд
    col: Number //текущий столбец
  },
  computed: {
    //вычисление позиции фигуры
    figureStyle() {
      const cellSize = 50
      const gap = 2
      const padding = 2
      const offset = cellSize + gap

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
  width: 50px;
  height: 50px;
  background: red;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border-radius: 4px;
}
</style>
