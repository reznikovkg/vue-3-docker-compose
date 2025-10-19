<template>
  <div class="sprite-debug">
    <div
      v-for="(pos, char) in config.spriteMap"
      :key="char"
      class="sprite-debug__cell"
    >
      <div
        class="sprite-debug__char"
        :style="getCharStyle(pos)"
      ></div>
      <span class="sprite-debug__label">{{ char }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  config: { type: Object, required: true }
})

// Fonction fléchée
const getCharStyle = (pos) => {
  const [col, row] = pos
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

<style scoped lang="less">
.sprite-debug {
  display: grid;
  grid-template-columns: repeat(6, auto);
  gap: 8px;
  justify-content: center;
  align-items: center;
  padding: 20px;

  &__cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  &__char {
    border: 1px solid #ddd;
  }

  &__label {
    font-size: 12px;
    margin-top: 4px;
    color: #444;
  }
}
</style>
