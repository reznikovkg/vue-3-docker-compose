<template>
  <div
      class="tile"
      :class="{
      'tile--empty': isVoid,
      'tile--blocked': isBlocked,
      'tile--solved': isSolved,
      'tile--movable': isMovable && !isBlocked && !isSolved,
      'tile--bonus': isBonusTarget && !isVoid && !isBlocked && !isSolved,
    }"
      :style="tileSize"
      @click="$emit('click')"
      @touchstart.prevent="$emit('click')"
  >
    <span v-if="!isVoid" class="tile__num">{{ num }}</span>
    <div v-if="isBonusTarget && !isVoid && !isBlocked" class="tile__ring"></div>
  </div>
</template>

<script>
export default {
  name: 'Tile',
  emits: ['click'],
  props: {
    num: {
          type: Number,
          required: true
        },
    isVoid: {
          type: Boolean,
          default: false
        },
    isBlocked: {
          type: Boolean,
          default: false
        },
    isSolved: {
          type: Boolean,
          default: false
        },
    isMovable: {
          type: Boolean,
          default: false
        },
    isBonusTarget: {
          type: Boolean,
          default: false
        },
    tileSize: {
          type: Object
        },
  },
}
</script>

<style scoped lang="scss">
.tile {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 2px solid #c7cce0;
  background: #ffffff;
  aspect-ratio: 1;
  user-select: none;
  cursor: default;
  box-shadow: 0 2px 6px rgba(55, 48, 163, 0.08);
  transition: background 0.12s, border-color 0.12s, box-shadow 0.12s, transform 0.12s;
  box-sizing: border-box;

  &__num {
    font-family: 'Unbounded', sans-serif;
    font-weight: 900;
    font-size: inherit;
    line-height: 1;
    letter-spacing: -0.02em;
    color: #1e1b4b;
    transition: color 0.12s;
  }

  &__ring {
    position: absolute;
    inset: -5px;
    border-radius: 13px;
    border: 2px solid #d97706;
    pointer-events: none;
    animation: ring-pulse 1s ease-in-out infinite;
  }

  &--empty {
    background: transparent;
    border-color: transparent;
    box-shadow: none;
    pointer-events: none;
    outline: 2px dashed #d1d5e8;
    outline-offset: -6px;
  }

  &--blocked {
    background: #fee2e2;
    border-color: #dc2626;
    box-shadow: 0 0 0 2px #dc2626, 0 4px 10px rgba(220, 38, 38, 0.15);
    cursor: not-allowed;

    .tile__num {
      color: #991b1b;
      opacity: 0.7;
    }
  }

  &--solved {
    background: #d1fae5;
    border-color: #059669;
    box-shadow: 0 0 0 2px #059669, 0 4px 10px rgba(5, 150, 105, 0.15);

    .tile__num {
      color: #065f46;
    }
  }

  &--movable {
    background: #ede9fe;
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px #4f46e5, 0 4px 14px rgba(79, 70, 229, 0.18);
    cursor: pointer;

    .tile__num {
      color: #3730a3;
    }

    &:hover {
      background: #ddd6fe;
      transform: translateY(-3px);
      box-shadow: 0 0 0 2px #4f46e5, 0 8px 20px rgba(79, 70, 229, 0.22);
    }

    &:active {
      transform: scale(0.93);
    }
  }

  &--bonus {
    background: #fef3c7;
    border-color: #d97706;
    box-shadow: 0 0 0 2px #d97706, 0 4px 12px rgba(217, 119, 6, 0.18);
    cursor: pointer;

    .tile__num {
      color: #92400e;
    }

    &:hover {
      background: #fde68a;
      transform: translateY(-3px);
      box-shadow: 0 0 0 2px #d97706, 0 8px 20px rgba(217, 119, 6, 0.22);
    }
  }
}

@keyframes ring-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(1.06); }
}
</style>