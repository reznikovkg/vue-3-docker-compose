<template>
  <div ref="arenaRef" class="arena" :class="{ arena_locked: result }" @click="handleArenaClick">
    <svg class="arena__svg" :viewBox="`0 0 ${arenaWidth} ${arenaHeight}`" preserveAspectRatio="none">
      <defs>
        <pattern id="scan-grid" width="44" height="44" patternUnits="userSpaceOnUse">
          <path d="M 44 0 L 0 0 0 44" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
        </pattern>
      </defs>
      <rect :width="arenaWidth" :height="arenaHeight" fill="url(#scan-grid)" />
      <polyline class="arena__route" :points="routePolyline" />
      <circle
        v-for="(point, index) in routePixels"
        :key="`route-${index}`"
        class="arena__route-node"
        :cx="point.x"
        :cy="point.y"
        r="5"
      />

      <line
        v-for="barrier in barriers"
        :key="barrier.id"
        :x1="barrier.start.x"
        :y1="barrier.start.y"
        :x2="barrier.end.x"
        :y2="barrier.end.y"
        :stroke="barrier.tint"
        :stroke-width="16"
        stroke-linecap="round"
      />

      <line
        v-for="turret in turrets.filter((entry) => entry.aimPoint)"
        :key="`trace-${turret.id}`"
        class="arena__trace"
        :x1="turret.position.x"
        :y1="turret.position.y"
        :x2="turret.aimPoint.x"
        :y2="turret.aimPoint.y"
      />
      <line
        v-for="hostile in hostiles.filter((entry) => entry.aimPoint)"
        :key="`hostile-trace-${hostile.id}`"
        class="arena__trace arena__trace_enemy"
        :x1="hostile.position.x"
        :y1="hostile.position.y"
        :x2="hostile.aimPoint.x"
        :y2="hostile.aimPoint.y"
      />
      <line
        v-for="squad in squads.filter((entry) => entry.aimPoint)"
        :key="`squad-trace-${squad.id}`"
        class="arena__trace arena__trace_friendly"
        :x1="squad.position.x"
        :y1="squad.position.y"
        :x2="squad.aimPoint.x"
        :y2="squad.aimPoint.y"
      />
    </svg>

    <button
      v-for="pad in mission.pads"
      :key="pad.id"
      type="button"
      class="arena__pad"
      :class="{
        arena__pad_busy: turrets.some((turret) => turret.padId === pad.id),
        arena__pad_selected:
          selectedTurretId &&
          turrets.some((turret) => turret.padId === pad.id && turret.id === selectedTurretId),
      }"
      :style="percentStyle(pad)"
      @click.stop="$emit('press-pad', pad.id)"
    >
      <span>+</span>
    </button>

    <button
      v-for="slot in mission.barrierSlots"
      :key="slot.id"
      type="button"
      class="arena__slot"
      :class="{ arena__slot_busy: barriers.some((barrier) => barrier.slotId === slot.id) }"
      :style="slotStyle(slot)"
      @click.stop="$emit('press-barrier-slot', slot.id)"
    />

    <div
      v-for="barrier in barriers"
      :key="`barrier-status-${barrier.id}`"
      class="arena__barrier-status"
      :style="pixelStyle(barrier.position)"
    >
      <div class="arena__bar arena__bar_barrier">
        <span :style="{ width: `${(barrier.durability / barrier.maxDurability) * 100}%` }"></span>
      </div>
    </div>

    <div
      v-for="turret in turrets"
      :key="turret.id"
      class="arena__turret"
      :style="pixelStyle(turret.position)"
      @click.stop="$emit('select-turret', turret.id)"
    >
      <div class="arena__turret-range" :style="rangeStyle(turret)"></div>
      <div class="arena__bar">
        <span :style="{ width: `${(turret.health / turret.maxHealth) * 100}%` }"></span>
      </div>
      <div class="arena__turret-body">
        <strong>{{ turret.level }}</strong>
      </div>
    </div>

    <div
      v-for="hostile in hostiles"
      :key="hostile.id"
      class="arena__hostile"
      :class="{
        arena__hostile_ranged: hostile.role === 'ranged',
        arena__hostile_heavy: hostile.kind === 'bulwark',
      }"
      :style="{ ...pixelStyle(hostile.position), '--hostile-tint': hostile.tint }"
    >
      <div class="arena__bar arena__bar_hostile">
        <span :style="{ width: `${(hostile.health / hostile.maxHealth) * 100}%` }"></span>
      </div>
    </div>

    <div
      v-for="squad in squads"
      :key="squad.id"
      class="arena__squad"
      :style="pixelStyle(squad.position)"
    >
      <div class="arena__bar arena__bar_friendly">
        <span :style="{ width: `${(squad.health / squad.maxHealth) * 100}%` }"></span>
      </div>
    </div>

    <div
      v-for="shell in shells"
      :key="shell.id"
      class="arena__shell"
      :style="shellStyle(shell)"
    ></div>

    <ResultCurtain :result="result" @restart="$emit('restart')" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import ResultCurtain from '@/components/ResultCurtain.vue'

const props = defineProps({
  mission: {
    type: Object,
    required: true,
  },
  routePixels: {
    type: Array,
    required: true,
  },
  turrets: {
    type: Array,
    required: true,
  },
  hostiles: {
    type: Array,
    required: true,
  },
  squads: {
    type: Array,
    required: true,
  },
  barriers: {
    type: Array,
    required: true,
  },
  shells: {
    type: Array,
    required: true,
  },
  selectedTurretId: {
    type: String,
    default: null,
  },
  result: {
    type: String,
    default: null,
  },
})

const emit = defineEmits([
  'measure',
  'fire-artillery',
  'press-pad',
  'press-barrier-slot',
  'select-turret',
  'restart',
])

const arenaRef = ref(null)
const arenaWidth = ref(1000)
const arenaHeight = ref(620)

const routePolyline = computed(() =>
  props.routePixels.map((point) => `${point.x},${point.y}`).join(' ')
)

const percentStyle = (point) => ({
  left: `${point.x}%`,
  top: `${point.y}%`,
})

const slotStyle = (slot) => ({
  ...percentStyle(slot),
  width: `${slot.width}%`,
  transform: `translate(-50%, -50%) rotate(${slot.angle}deg)`,
})

const pixelStyle = (point) => ({
  left: `${point.x}px`,
  top: `${point.y}px`,
})

const rangeStyle = (turret) => ({
  width: `${turret.range * 2}px`,
  height: `${turret.range * 2}px`,
})

const shellStyle = (shell) => {
  const progress = Math.min(1, shell.elapsedMs / shell.durationMs)
  const radius = shell.detonated ? shell.maxRadius * progress : shell.maxRadius * 0.16

  return {
    ...pixelStyle(shell.position),
    width: `${radius * 2}px`,
    height: `${radius * 2}px`,
    opacity: shell.detonated ? `${1 - progress}` : '0.72',
  }
}

const measureArena = () => {
  if (!arenaRef.value) return

  const rect = arenaRef.value.getBoundingClientRect()
  arenaWidth.value = rect.width || 1000
  arenaHeight.value = rect.height || 620
  emit('measure', {
    width: rect.width,
    height: rect.height,
  })
}

const handleArenaClick = (event) => {
  if (!arenaRef.value || props.result) return

  const rect = arenaRef.value.getBoundingClientRect()
  emit('fire-artillery', {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  })
}

onMounted(() => {
  measureArena()
  window.addEventListener('resize', measureArena)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', measureArena)
})
</script>

<style scoped lang="scss">
$arena-border: 1px solid rgba(245, 227, 198, 0.08);
$arena-bg: (
  radial-gradient(circle at top left, rgba(250, 177, 105, 0.18), transparent 32%),
  radial-gradient(circle at bottom right, rgba(59, 114, 150, 0.24), transparent 28%),
  linear-gradient(180deg, #142330, #0a141e 44%, #10151b)
);
$route-stroke: rgba(245, 211, 154, 0.8);
$route-shadow: drop-shadow(0 0 18px rgba(242, 171, 89, 0.24));
$trace-stroke: rgba(155, 226, 255, 0.88);
$trace-enemy: rgba(255, 98, 98, 0.88);
$trace-friendly: rgba(255, 241, 193, 0.92);
$pad-bg: rgba(255, 233, 197, 0.18);
$pad-border: 1px solid rgba(245, 211, 154, 0.24);
$pad-color: rgba(255, 233, 197, 0.88);
$pad-busy: rgba(90, 135, 164, 0.3);
$pad-selected: rgba(255, 196, 122, 0.4);
$slot-bg: rgba(255, 255, 255, 0.12);
$slot-busy: rgba(255, 204, 145, 0.18);
$bar-bg: rgba(255, 255, 255, 0.12);
$bar-fg: linear-gradient(90deg, #ffbf70, #ffe4b8);
$bar-hostile: linear-gradient(90deg, #ff6b57, #ffb08b);
$bar-friendly: linear-gradient(90deg, #a9d4ff, #ebf5ff);
$barrier-bg: linear-gradient(90deg, #c9d27e, #eef7b7);

.arena {
  position: relative;
  isolation: isolate;
  min-height: 620px;
  border: $arena-border;
  border-radius: 34px;
  overflow: hidden;
  background: $arena-bg;

  &_locked {
    .arena__pad,
    .arena__slot,
    .arena__turret {
      pointer-events: none;
    }
  }

  &__svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  &__route {
    fill: none;
    stroke: $route-stroke;
    stroke-width: 28;
    stroke-linecap: round;
    stroke-linejoin: round;
    filter: $route-shadow;
  }

  &__route-node {
    fill: #ffe0af;
  }

  &__trace {
    stroke: $trace-stroke;
    stroke-width: 2.4;
    stroke-dasharray: 6 8;

    &_enemy {
      stroke: $trace-enemy;
    }

    &_friendly {
      stroke: $trace-friendly;
    }
  }

  &__pad,
  &__slot {
    position: absolute;
    border: 0;
    cursor: pointer;
  }

  &__pad {
    z-index: 2;
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: $pad-bg;
    border: $pad-border;
    color: $pad-color;
    transform: translate(-50%, -50%);

    &_busy {
      background: $pad-busy;
    }

    &_selected {
      box-shadow: 0 0 0 3px $pad-selected;
    }
  }

  &__slot {
    z-index: 5;
    height: 18px;
    border-radius: 999px;
    background: $slot-bg;

    &_busy {
      background: $slot-busy;
    }
  }

  &__turret,
  &__barrier-status,
  &__hostile,
  &__squad,
  &__shell {
    position: absolute;
    transform: translate(-50%, -50%);
  }

  &__barrier-status {
    z-index: 6;
    pointer-events: none;
  }

  &__turret {
    z-index: 4;
  }

  &__turret-body {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border-radius: 14px;
    background: linear-gradient(180deg, #d6c7a3, #8d7850);
    color: #101820;
    font-family: var(--font-accent);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.28);
  }

  &__turret-range {
    position: absolute;
    left: 50%;
    top: 50%;
    border: 1px dashed rgba(255, 240, 202, 0.18);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  &__hostile,
  &__squad {
    width: 26px;
    height: 26px;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
    }
  }

  &__hostile {
    &::after {
      border-radius: 10px;
      background: var(--hostile-tint);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.24);
    }

    &_ranged::after {
      clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    }

    &_heavy::after {
      border-radius: 50%;
    }
  }

  &__squad {
    &::after {
      border-radius: 6px;
      background: linear-gradient(180deg, #e8f2ff, #94b7d8);
    }
  }

  &__bar {
    position: absolute;
    left: 50%;
    bottom: calc(100% + 6px);
    width: 34px;
    height: 6px;
    border-radius: 999px;
    overflow: hidden;
    background: $bar-bg;
    transform: translateX(-50%);
    pointer-events: none;

    span {
      display: block;
      height: 100%;
      background: $bar-fg;
    }

    &_hostile span {
      background: $bar-hostile;
    }

    &_friendly span {
      background: $bar-friendly;
    }

    &_barrier {
      width: 46px;
      bottom: 16px;

      span {
        background: $barrier-bg;
      }
    }
  }

  &__shell {
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(255, 232, 176, 0.9),
      rgba(255, 126, 65, 0.35),
      transparent 70%
    );
    box-shadow: 0 0 36px rgba(255, 142, 81, 0.46);
    pointer-events: none;
  }
}

@media (max-width: 960px) {
  .arena {
    min-height: 460px;
  }
}
</style>
