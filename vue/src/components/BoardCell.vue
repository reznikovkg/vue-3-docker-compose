<template>
  <div :class="['board-cell', cell.className]">
    <div class="sparkle"></div>
  </div>
</template>

<script setup>
defineProps({
  cell: { type: Object, required: true }
})
</script>

<style lang="scss" scoped>
.board-cell {
  width: auto;
  border-radius: 6px;
  position: relative;
}

.tetromino {
  border-top: 3px solid rgba(255, 255, 255, 0.1);
  border-left: 3px solid rgba(255, 255, 255, 0.1);
  border-bottom: 3px solid rgba(0, 0, 0, 0.1);
  border-right: 3px solid rgba(0, 0, 0, 0.1);

  .sparkle {
    position: absolute;
    z-index: 10;
    width: 6px;
    height: 6px;
    left: -2px;
    top: -2px;
    background-color: rgba(255, 255, 255, 0.4);
    border-radius: 4px 4px;
  }

  &.ghost {
    background-color: transparent;
    border: 2px solid rgba(93, 52, 0, 0.2);

    .sparkle {
      opacity: 0;
    }
  }
}

// Цвета тетрамино через SCSS переменные
$tetromino-colors: (
  i: rgba(80, 227, 230, 1),
  j: rgba(36, 95, 223, 1),
  l: rgba(255, 174, 174, 1),
  o: rgba(223, 217, 36, 1),
  s: rgba(48, 211, 56, 1),
  t: rgba(132, 61, 198, 1),
  z: rgba(240, 80, 195, 1)
);

@each $name, $color in $tetromino-colors {
  .tetromino__#{$name} {
    background-color: $color;
  }
}
</style>