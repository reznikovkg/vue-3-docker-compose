<template>
  <div class = "enemy" :style = "enemyStyle" @click.stop="() => handleMove()">
    <div class = "enemy__body"></div>
    <div class = "enemy__health">
      <div class = "enemy__health-bar" :style = "healthBarStyle"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Enemy',
  props: {
    enemy: {
      type: Object,
      required: true,
    },
  },
  emits: ['move'],
  computed: {
    enemyStyle() {
      return {
        left: `${this.enemy.x - 15}px`,
        top: `${this.enemy.y - 15}px`,
      }
    },
    healthBarStyle() {
      const percentage = (this.enemy.health / this.enemy.maxHealth) * 100
      return {
        width: `${percentage}%`,
      }
    },
  },
  methods: {
    handleMove() {
      this.$emit('move')
    },
  },
}
</script>

<style scoped lang="scss">
.enemy {
  position: absolute;
  width: 30px;
  height: 30px;
  cursor: pointer;
  z-index: 5;
  transition: left 0.1s, top 0.1s;

  &__body {
    width: 100%;
    height: 100%;
    background: #e94560;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 0 10px rgba(233, 69, 96, 0.8);
  }

  &__health {
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 100%;
    height: 4px;
    background: #333;
    border-radius: 2px;
    overflow: hidden;
  }

  &__health-bar {
    height: 100%;
    background: #00ff00;
    transition: width 0.3s;
  }
}
</style>