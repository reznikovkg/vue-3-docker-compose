<template>
  <div class = "mode-overlay" v-if = "show">
    <div class = "mode-modal">
      <h2 class = "mode-modal__title">Выберите режим игры</h2>
      
      <div class = "mode-modal__buttons">
        <button 
          class = "mode-modal__btn mode-modal__btn--normal" 
          @click = "() => selectMode('normal')"
        >
          Обычный
        </button>
        
        <button 
          class = "mode-modal__btn mode-modal__btn--speed" 
          @click = "() => selectMode('speed')"
        >
          Ускорение
        </button>

        <button 
          class = "mode-modal__btn mode-modal__btn--bomb" 
          @click = "() => selectMode('bomb')"
        >
          С бомбами
        </button>
        
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModeSelector',
  props: {
    show: {
      type: Boolean,
      default: true
    }
  },
  emits: ['selectMode'],
  methods: {
    selectMode(mode) {
      this.$emit('selectMode', mode)
    }
  }
}
</script>

<style scoped lang = "scss">
.mode-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.mode-modal {
  background: white;
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  
  &__title {
    margin-bottom: 20px;
    font-size: 24px;
    color: #333;
  }
  &__buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
  }
  &__btn {
    padding: 12px 24px;
    font-size: 18px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: bold;
    &--normal {
      background: #dfa0d3;
      color: white;
    }
    &--speed {
      background: #4d78e6;
      color: white;
    }
    &--bomb {
      background: #f44336;  
      color: white;
    }
  }
}
</style>