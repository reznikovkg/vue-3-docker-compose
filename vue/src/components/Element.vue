<template>
  <span class="c-element">
    <slot>{{ emojiToShow }}</slot>
  </span>
</template>

<script>
export default {
  name: 'Element',
  props: {
    type: {
      type: String,
      default: 'default'
    },
    emoji: {
      type: String,
      default: null
    }
  },
  computed: {
    emojiToShow() {
      if (this.emoji) {
        return this.emoji
      }
      const emojiMap = {
        player: '🔥',
        tree: '🌲',
        wall: '⛰️',
        cloud: '☁️',
        spark: '💥'
      }
      return emojiMap[this.type] || '?'
    }
  }
}
</script>

<style lang="scss" scoped>
  .c-element {
    font-size: 40px;
    line-height: 1;
    display: inline-block;
    user-select: none;
    pointer-events: none;
  }
</style>