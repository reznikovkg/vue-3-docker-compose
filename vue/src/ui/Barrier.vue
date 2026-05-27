<template>
  <div class = "barrier" :style="style" @click.stop = "() => handleSelect()">
    <div class = "barrier__hp-bar">
      <div class = "barrier__hp-fill" :style = "{ width: hpPercent + '%' }"></div>
    </div>
    <button class = "barrier__remove" @click.stop = "() => handleRemove()">✕</button>
  </div>
</template>



<script>
export default {
  name: 'Barrier',
  props: { barrier: Object },
  computed: {
    style() {
      return { left: this.barrier.x - 20 + 'px', top: this.barrier.y - 20 + 'px' }
    },
    hpPercent() {
      return Math.max(0, (this.barrier.health / this.barrier.maxHealth) * 100)
    }
  },

    methods: {
      handleSelect() {
        this.$emit('select', this.barrier);
      },
      handleRemove() {
        this.$emit('remove', this.barrier.id);
      }
    }
}
</script>

<style lang="scss" scoped>
.barrier {
  position: absolute;
  width: 40px;
  height: 40px;
  background: #4a90e2;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  border: 2px solid #2c5aa0;

  &__hp-bar {
    position: absolute;
    bottom: -8px;
    width: 100%;
    height: 4px;
    background: #222;
    border-radius: 2px;
  }
  &__hp-fill {
    height: 100%;
    background: #4caf50;
    transition: width 0.2s;
  }
  &__remove {
    position: absolute;
    top: -10px;
    right: -10px;
    width: 20px;
    height: 20px;
    background: #e94560;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 12px;
  }
}
</style>