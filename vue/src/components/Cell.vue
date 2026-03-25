<template>
  <div 
    class="puzzle__cell" 
    :class="cellClasses"
      @click="() => $emit('click', index)"
  >
    <span v-if="value !== size * size">{{ value }}</span>
  </div>
</template>
<script>
export default {
  name: 'Cell',
  props: {
    value: Number,
    index: Number,
    size: Number,
    isBlocked: Boolean,
    isFrozen: Boolean
  },
  computed: {
    cellClasses() {
      return {
        'puzzle__cell--empty': this.value === this.size * this.size,
        'puzzle__cell--blocked': this.isBlocked,
        'puzzle__cell--frozen': this.isFrozen
      }
    }
  }
}
</script>
<style scoped lang="scss">
.puzzle__cell {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(14px, 5vw, 36px);
  font-weight: bold;
  color: #333;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: all 0.2s;
  user-select: none;
  &:active:not(&--empty):not(&--blocked):not(&--frozen) {
    transform: scale(0.95);
    background: #f0f0f0;
  }
  &--empty {
    background: transparent;
    box-shadow: none;
    cursor: default;
    pointer-events: none;
  }
  &--blocked {
    background: #ffcdd2;
    cursor: not-allowed;
    opacity: 0.7;
  }
  &--frozen {
    background: #e0e0e0;
    color: #999;
    cursor: not-allowed;
    border: 2px solid #2196F3;
  }
}
</style>