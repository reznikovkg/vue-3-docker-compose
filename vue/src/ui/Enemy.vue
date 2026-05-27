<template>
  <div  ref = "enemyRef" class = "enemy" :style = "enemyStyle" @click.stop= "() => handleSelect()" @mousedown="() => handleDragStart($event)">
    <div class = "enemy__body"
      :class="{ 'enemy__body--shooter': isShooter }"
      :style="{ background: enemyColor, boxShadow: `0 0 10px ${enemyColor}`}">
    </div>
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
  emits: ['move', 'select', 'drag'],
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
    enemyColor() {
      const colors = {
        'basic': '#1e90ff',
        'tank': '#ff4757',
        'fast': '#2ed573',
        'archer': '#00b4d8',
        'elite_archer': '#9d4edd', 
      }
      return colors[this.enemy.type] || colors['basic']
    },
    isShooter() {
      return this.enemy.shootRange && this.enemy.shootRange > 0
    }
  },
  methods: {
    handleMove() {
      this.$emit('move')
    },
    handleDragStart(event) {
      this.$emit('select')
      this.$emit('drag', {
        enemy: this.enemy,
        event
      })
    },
  },
}
</script>

<style scoped lang="scss">
.enemy {
  position: absolute;
  width: 30px;
  height: 30px;
  cursor: grab;
  z-index: 5;
  transition: left 0.1s, top 0.1s;

  &:active {
    cursor: grabbing;
  }

  &__body {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid #fff;
  }
  
  &__body--shooter {
    border-radius: 0;
    border: none;
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    width: 34px;
    height: 34px;
    margin-left: -2px;
    margin-top: -2px;
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