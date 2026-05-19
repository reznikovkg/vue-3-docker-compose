<template>
  <div class = "controls">
    <div class = "controls__row">
      <button class = "controls__btn" @click = "() => $emit('moveUp')">↑</button>
    </div>
    
    <div class = "controls__row">
      <button class = "controls__btn" @click = "() => $emit('moveLeft')">←</button>
      <button class = "controls__btn" @click = "() => $emit('moveDown')">↓</button>
      <button class = "controls__btn" @click = "() => $emit('moveRight')">→</button>
    </div>
    
    <div class = "controls__rotate">
      <button class = "controls__rotate-btn" @click = "() => $emit('rotateLeft')">↺</button>
      <button class = "controls__rotate-btn" @click = "() => $emit('rotateRight')">↻</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ControlButtons',
  emits: [
    'moveUp', 'moveDown', 'moveLeft', 'moveRight',
    'rotateLeft', 'rotateRight' 
  ]
}
</script>

<style scoped lang = "scss">
.controls {
  margin-left: 30px;
  &__row {
    margin: 5px 0;
    display: flex;
    gap: 5px;
    justify-content: center;
  }
  &__btn {
    width: 50px;
    height: 50px;
    font-size: 20px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    
    &:hover {
      background: #45a049;
    }
  }
  &__rotate {
    margin-top: 15px;
    border-top: 1px solid #ccc;
    padding-top: 10px;
    display: flex;
    gap: 10px;
    justify-content: center;
  }
  &__rotate-btn {
    width: 70px;
    height: 50px;
    font-size: 20px;
    background: #3ae39482;
    color: #0b0b0b;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    
    &:hover {
      background: #b8f6e6;
    }
  }
}
</style>
