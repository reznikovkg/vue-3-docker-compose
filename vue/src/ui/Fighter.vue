<template>
  <div class = "fighter" :style="style" @click.stop = "() => handleSelect()">
    <div class = "fighter__hp-bar">
      <div class = "fighter__hp-fill" :style = "{ width: hpPercent + '%' }"></div>
    </div>
    <button class = "fighter__remove" @click.stop = "() => handleRemove()">✕</button>
  </div>
</template>

<script>
export default {
  name: 'Fighter',
  props: { fighter: Object },
  computed: {
    style() {
      return { 
        left: (this.fighter.x - 20) + 'px', 
        top: (this.fighter.y - 20) + 'px' 
      }
    },
    hpPercent() {
      return Math.max(0, (this.fighter.health / this.fighter.maxHealth) * 100)
    }
  },

  methods: {
    handleSelect() {
      this.$emit('select', this.fighter);
    },
    handleRemove() {
      this.$emit('remove', this.fighter.id);
    }
  }
}
</script>

<style lang="scss" scoped>
.fighter {
  position: absolute;
  width: 40px;
  height: 40px;
  background: #4caf50;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 6;
  border: 2px solid #2e7d32;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);

  &::before {
    font-size: 20px;
  }
  &__hp-bar {
    position: absolute;
    top: -8px;
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
    bottom: -10px;
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