<template>
  <div class="game-canvas">
    <svg
        ref="svgRef"
        class="game-canvas__svg"
        :style="{ width: `${level.size.w}px`, maxWidth: '100%' }"
        :viewBox="`0 0 ${level.size.w} ${level.size.h}`"
        @pointermove="(event) => onCanvasPointerMove(event)"
        @pointerup="() => onCanvasPointerUp()"
        @pointercancel="() => onCanvasPointerUp()"
        @mouseleave="() => onCanvasPointerUp()"
    >
      <rect
          class="game-canvas__background"
          x="0"
          y="0"
          :width="level.size.w"
          :height="level.size.h"
          fill="#0b1220"
      />

      <polyline
          v-if="pathPoints"
          class="game-canvas__path-back"
          :points="pathPoints"
          fill="none"
          stroke="#334155"
          stroke-width="10"
          stroke-linecap="round"
          stroke-linejoin="round"
          opacity="0.9"
      />

      <polyline
          v-if="pathPoints"
          class="game-canvas__path-front"
          :points="pathPoints"
          fill="none"
          stroke="#111827"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
          opacity="0.6"
      />

      <circle
          v-if="level.enemySpawn"
          class="game-canvas__spawn-point"
          :cx="level.enemySpawn.x"
          :cy="level.enemySpawn.y"
          r="8"
          fill="#22c55e"
      />

      <g
          v-for="slot in slots"
          :key="slot.id"
          class="game-canvas__slot-group"
      >
        <circle
            class="game-canvas__slot-circle game-canvas__slot-circle--clickable"
            :cx="slot.pos.x"
            :cy="slot.pos.y"
            r="14"
            :fill="slot.towerId ? '#111827' : '#0f172a'"
            stroke="#94a3b8"
            stroke-width="2"
            opacity="0.95"
            @click.stop="() => emitSlotClick(slot.id)"
        />

        <g
            v-if="slot.towerId && towersById[slot.towerId]"
            class="game-canvas__tower-group game-canvas__tower-group--clickable"
            @click.stop="() => emitTowerClick(slot.towerId)"
        >
          <circle
              class="game-canvas__tower-circle"
              :cx="slot.pos.x"
              :cy="slot.pos.y"
              r="10"
              :fill="towerColor(towersById[slot.towerId].type)"
          />

          <text
              class="game-canvas__tower-level-label"
              :x="slot.pos.x"
              :y="slot.pos.y + 4"
              text-anchor="middle"
              font-size="10"
              fill="#e5e7eb"
          >
            {{ towersById[slot.towerId].level }}
          </text>
        </g>
      </g>

      <g v-if="rangeCircle" class="game-canvas__range-group">
        <circle
            class="game-canvas__range-fill"
            :cx="rangeCircle.x"
            :cy="rangeCircle.y"
            :r="rangeCircle.r"
            fill="#60a5fa"
            opacity="0.12"
        />
        <circle
            class="game-canvas__range-stroke"
            :cx="rangeCircle.x"
            :cy="rangeCircle.y"
            :r="rangeCircle.r"
            fill="none"
            stroke="#60a5fa"
            stroke-width="2"
            opacity="0.45"
            stroke-dasharray="6 6"
        />
      </g>

      <g
          v-for="enemy in enemies"
          :key="enemy.id"
          class="game-canvas__enemy-group game-canvas__enemy-group--clickable"
          @pointerdown.stop="(event) => onEnemyPointerDown(enemy.id, event)"
      >
        <circle
            class="game-canvas__enemy-circle"
            :cx="enemy.pos.x"
            :cy="enemy.pos.y"
            r="10"
            :fill="enemy.color || '#ef4444'"
            :stroke="enemy.id === selectedEnemyId ? '#22d3ee' : '#ffffff'"
            :stroke-width="enemy.id === selectedEnemyId ? 3 : 2"
        />

        <text
            class="game-canvas__enemy-hp-label"
            :x="enemy.pos.x"
            :y="enemy.pos.y - 14"
            text-anchor="middle"
            font-size="11"
            fill="#ffffff"
        >
          {{ Math.round(enemy.hp) }}
        </text>
      </g>

      <text
          class="game-canvas__helper-text"
          x="12"
          y="24"
          font-size="12"
          fill="#94a3b8"
      >
        Green point is enemy spawn. Drag enemy manually. Press Run damage step to test tower range.
      </text>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'GameCanvas',

  props: {
    level: {
      type: Object,
      required: true
    },
    slots: {
      type: Array,
      required: true
    },
    towersById: {
      type: Object,
      required: true
    },
    enemies: {
      type: Array,
      required: true
    },
    selectedTowerId: {
      type: String,
      default: ''
    },
    selectedEnemyId: {
      type: String,
      default: ''
    },
    getTowerStats: {
      type: Function,
      required: true
    }
  },

  emits: [
    'slot-click',
    'tower-click',
    'enemy-pointer-down',
    'canvas-pointer-move',
    'canvas-pointer-up'
  ],

  computed: {
    pathPoints () {
      const points = this.level.path || []

      if (!points.length) {
        return ''
      }

      return points.map((point) => `${point.x},${point.y}`).join(' ')
    },

    rangeCircle () {
      const towerId = this.selectedTowerId

      if (!towerId) {
        return null
      }

      const slot = this.slots.find((item) => item.towerId === towerId)
      const tower = this.towersById[towerId]

      if (!slot || !tower) {
        return null
      }

      const stats = this.getTowerStats(tower.type, tower.level)
      const radius = stats ? stats.range : 90

      return {
        x: slot.pos.x,
        y: slot.pos.y,
        r: radius
      }
    }
  },

  methods: {
    emitSlotClick (slotId) {
      this.$emit('slot-click', slotId)
    },

    emitTowerClick (towerId) {
      this.$emit('tower-click', towerId)
    },

    towerColor (type) {
      if (type === 'sniper') {
        return '#22c55e'
      }

      if (type === 'rapid') {
        return '#a78bfa'
      }

      return '#60a5fa'
    },

    getSvgPoint (event) {
      const svg = this.$refs.svgRef

      if (!svg) {
        return {
          x: 0,
          y: 0
        }
      }

      const rect = svg.getBoundingClientRect()
      const viewWidth = this.level.size.w
      const viewHeight = this.level.size.h

      return {
        x: Math.round(((event.clientX - rect.left) / rect.width) * viewWidth),
        y: Math.round(((event.clientY - rect.top) / rect.height) * viewHeight)
      }
    },

    onEnemyPointerDown (enemyId, event) {
      if (event.button !== 0) {
        return
      }

      if (event.target && event.target.setPointerCapture) {
        event.target.setPointerCapture(event.pointerId)
      }

      const point = this.getSvgPoint(event)

      this.$emit('enemy-pointer-down', {
        enemyId,
        x: point.x,
        y: point.y
      })
    },

    onCanvasPointerMove (event) {
      const point = this.getSvgPoint(event)

      this.$emit('canvas-pointer-move', point)
    },

    onCanvasPointerUp () {
      this.$emit('canvas-pointer-up')
    }
  }
}
</script>

<style scoped lang="scss">
.game-canvas {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow-x: auto;
  overflow-y: hidden;
  background: #0b1220;

  &__svg {
    display: block;
    height: auto;
    touch-action: none;
  }

  &__slot-circle--clickable,
  &__tower-group--clickable,
  &__enemy-group--clickable {
    cursor: pointer;
  }

  &__tower-level-label {
    user-select: none;
  }

  &__enemy-hp-label {
    user-select: none;
    pointer-events: none;
  }

  &__helper-text {
    user-select: none;
    pointer-events: none;
  }
}
</style>