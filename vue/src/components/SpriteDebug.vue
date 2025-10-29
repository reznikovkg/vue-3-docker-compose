<template>
  <div class="sprite-debug">
    <div
      v-for="(coords, char) in config.spriteMap"
      :key="char"
      class="sprite-debug__cell"
      :style="getCharStyle(coords)"
    >
      <span class="sprite-debug__label">{{ char }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ config: Object })

const getCharStyle = (coords) => {
  const [col, row] = coords
  const x = -col * props.config.charWidth
  const y = -row * props.config.charHeight

  return {
    width: `${props.config.charWidth}px`,
    height: `${props.config.charHeight}px`,
    backgroundImage: `url(${props.config.spritePath})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `${x}px ${y}px`,
    backgroundSize: `${props.config.totalWidth}px ${props.config.totalHeight}px`
  }
}
</script>
