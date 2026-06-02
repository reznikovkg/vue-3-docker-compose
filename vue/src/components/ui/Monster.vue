<template>
  <div
    class = "monster"
    :class = "monsterClasses"
    :style = "styles"
  >
    <div class = "monster__hp">
      <div
        class = "monster__hp-fill"
        :style = "hpStyles"
      >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Monster',

  props: {
    x: {
      type: Number,
      default: 0
    },

    y: {
      type: Number,
      default: 0
    },

    type: {
      type: String,
      default: 'basic'
    },

    hp: {
      type: Number,
      default: 1
    },

    maxHp: {
      type: Number,
      default: 1
    }
  },

  computed: {
    styles() {
      return {
        transform: `translateX(${this.x}px) translateY(${this.y}px) translate(-50%, -50%)`
      }
    },

    hpStyles() {
      return {
        width: `${this.hpPercent}%`
      }
    },

    hpPercent() {
      return this.hp / this.maxHp * 100
    },

    monsterClasses() {
      return {
        'monster--fast': this.type === 'fast',
        'monster--tank': this.type === 'tank',
        'monster--ranged': this.type === 'ranged'
      }
    }
  }
}
</script>

<style scoped lang="scss">
.monster {
  position: absolute;

  width: 28px;
  height: 28px;

  background: #8844ff;

  &--fast {
    width: 22px;
    height: 22px;

    background: #ff66cc;
  }

  &--tank {
    width: 42px;
    height: 42px;

    background: #aa2222;
  }

  &--ranged {
    width: 30px;
    height: 30px;

    background: #3399ff;
  }

  &__hp {
    position: absolute;
    left: 0;
    top: -8px;

    width: 100%;
    height: 4px;

    background: #333333;
  }

  &__hp-fill {
    height: 100%;

    background: #00ff00;
  }
}
</style>