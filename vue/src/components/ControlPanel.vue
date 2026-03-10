<template>
  <aside class="panel">
    <section class="panel__block">
      <p class="panel__eyebrow">Ресурсы</p>
      <div class="panel__budget">
        <span>Бюджет</span>
        <strong>{{ budget }}</strong>
      </div>
      <div class="panel__wave">
        <span>Осталось в очереди</span>
        <strong>{{ remainingWave }}</strong>
      </div>
    </section>

    <section class="panel__block">
      <p class="panel__eyebrow">Инструменты</p>
      <div class="panel__toolbox">
        <button
          type="button"
          :class="{ active: toolMode === toolModes.TURRET }"
          @click="$emit('choose-tool', toolModes.TURRET)"
        >
          Турель · {{ turretInstallCost }}
        </button>
        <button
          type="button"
          :class="{ active: toolMode === toolModes.BARRIER }"
          @click="$emit('choose-tool', toolModes.BARRIER)"
        >
          Заграждение
        </button>
        <button
          type="button"
          :class="{ active: toolMode === toolModes.ARTILLERY }"
          @click="$emit('choose-tool', toolModes.ARTILLERY)"
        >
          Артудар · {{ artilleryCost }}
        </button>
        <button class="panel__squad" type="button" @click="$emit('deploy-squad')">
          Отправить бойцов · {{ squadCost }}
        </button>
      </div>
      <p class="panel__guide">{{ modeHint }}</p>
    </section>

    <section class="panel__block">
      <p class="panel__eyebrow">Материал заграждения</p>
      <div class="panel__materials">
        <button
          v-for="material in barrierCatalog"
          :key="material.id"
          type="button"
          :class="{ active: barrierMaterial === material.id }"
          @click="$emit('choose-barrier-material', material.id)"
        >
          {{ material.label }} · {{ material.price }}
        </button>
      </div>
    </section>

    <section class="panel__block panel__block_turret">
      <div v-if="selectedTurret">
        <p class="panel__eyebrow">Выбранная турель</p>
        <dl class="panel__specs">
          <div>
            <dt>Уровень</dt>
            <dd>{{ selectedTurret.level }}</dd>
          </div>
          <div>
            <dt>Урон</dt>
            <dd>{{ selectedTurret.damage }}</dd>
          </div>
          <div>
            <dt>Радиус</dt>
            <dd>{{ selectedTurret.range }}</dd>
          </div>
          <div>
            <dt>Скорость огня</dt>
            <dd>{{ (1000 / selectedTurret.reloadMs).toFixed(2) }}/с</dd>
          </div>
          <div>
            <dt>Прочность</dt>
            <dd>{{ Math.ceil(selectedTurret.health) }}/{{ selectedTurret.maxHealth }}</dd>
          </div>
          <div>
            <dt>Улучшение</dt>
            <dd>{{ upgradePrice }}</dd>
          </div>
        </dl>
        <div class="panel__actions">
          <button type="button" @click="$emit('upgrade-turret')">Улучшить</button>
          <button type="button" class="ghost" @click="$emit('sell-turret')">Снять</button>
        </div>
      </div>
      <p v-else class="panel__hint">
        Выберите установленную турель на поле, чтобы улучшить или снять ее.
      </p>
    </section>
  </aside>
</template>

<script setup>
import { computed } from 'vue'

import { TOOL_MODES, getTurretUpgradePrice } from '@/game/battleEngine'

const props = defineProps({
  budget: {
    type: Number,
    required: true,
  },
  wave: {
    type: Object,
    required: true,
  },
  toolMode: {
    type: String,
    required: true,
  },
  barrierMaterial: {
    type: String,
    required: true,
  },
  barrierCatalog: {
    type: Array,
    required: true,
  },
  selectedTurret: {
    type: Object,
    default: null,
  },
  turretInstallCost: {
    type: Number,
    required: true,
  },
  artilleryCost: {
    type: Number,
    required: true,
  },
  squadCost: {
    type: Number,
    required: true,
  },
})

defineEmits([
  'choose-tool',
  'choose-barrier-material',
  'deploy-squad',
  'upgrade-turret',
  'sell-turret',
])

const toolModes = TOOL_MODES

const remainingWave = computed(() => props.wave.queue.length - props.wave.cursor)
const upgradePrice = computed(() =>
  props.selectedTurret ? getTurretUpgradePrice(props.selectedTurret.level) : 0
)
const modeHint = computed(() => {
  if (props.toolMode === toolModes.TURRET) {
    return 'Щёлкните по круглой площадке рядом с дорогой, чтобы поставить новую турель.'
  }

  if (props.toolMode === toolModes.BARRIER) {
    return 'Выберите материал и нажмите на серый слот поперёк маршрута, чтобы перекрыть участок.'
  }

  return 'Выберите режим артудара и щёлкните по точке на поле, куда нужно сбросить снаряд.'
})
</script>

<style scoped lang="scss">
$panel-border: 1px solid rgba(255, 255, 255, 0.08);
$panel-bg: rgba(10, 20, 29, 0.8);
$panel-gap: 16px;
$panel-highlight-border: rgba(239, 167, 91, 0.38);
$panel-highlight-bg: rgba(239, 167, 91, 0.14);
$panel-button-bg: rgba(255, 255, 255, 0.04);
$panel-button-bg-ghost: rgba(255, 255, 255, 0.05);
$panel-spec-bg: rgba(255, 255, 255, 0.04);

.panel {
  display: grid;
  gap: $panel-gap;
  position: sticky;
  top: 18px;

  &__block {
    padding: 18px;
    border: $panel-border;
    border-radius: 24px;
    background: $panel-bg;
  }

  &__eyebrow {
    margin-bottom: 12px;
    color: var(--text-muted);
    font-size: 0.74rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  &__budget,
  &__wave {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__budget strong,
  &__wave strong,
  &__specs dd {
    font-family: var(--font-accent);
    color: var(--accent-soft);
  }

  &__wave {
    margin-top: 8px;
  }

  &__toolbox,
  &__materials,
  &__actions {
    display: grid;
    gap: 10px;
  }

  button {
    width: 100%;
    padding: 12px 14px;
    border: $panel-border;
    border-radius: 16px;
    background: $panel-button-bg;
    color: var(--text-main);
    cursor: pointer;
    text-align: left;

    &.active {
      border-color: $panel-highlight-border;
      background: $panel-highlight-bg;
    }
  }

  &__actions {
    margin-top: 14px;
    grid-template-columns: 1fr 1fr;

    button:first-child {
      border-color: $panel-highlight-border;
      background: $panel-highlight-bg;
    }

    .ghost {
      background: $panel-button-bg-ghost;
    }
  }

  &__squad {
    border-color: $panel-highlight-border;
    background: $panel-highlight-bg;
  }

  &__specs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;

    div {
      padding: 10px;
      border-radius: 14px;
      background: $panel-spec-bg;
    }

    dt {
      margin-bottom: 4px;
      color: var(--text-muted);
      font-size: 0.76rem;
    }
  }

  &__hint {
    color: var(--text-muted);
  }

  &__guide {
    margin-top: 12px;
    color: var(--text-muted);
    font-size: 0.9rem;
  }
}

@media (max-width: 960px) {
  .panel {
    position: static;

    &__specs,
    &__actions {
      grid-template-columns: 1fr;
    }
  }
}
</style>
