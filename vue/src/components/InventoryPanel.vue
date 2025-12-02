<template>
  <div class="inventory">
    <div class="inventory__title">Инвентарь</div>
    <div class="inventory__section">
      <div class="inventory__subtitle">Рыба</div>
      <div class="inventory__grid">
        <div class="inventory__item">
          <div class="inventory__name">Карась</div>
          <div class="inventory__count">{{ inventory.fish?.carp || 0 }}</div>
        </div>
        <div class="inventory__item">
          <div class="inventory__name">Окунь</div>
          <div class="inventory__count">{{ inventory.fish?.perch || 0 }}</div>
        </div>
        <div class="inventory__item">
          <div class="inventory__name">Щука</div>
          <div class="inventory__count">{{ inventory.fish?.pike || 0 }}</div>
        </div>
      </div>
    </div>
    <div class="inventory__section">
      <div class="inventory__subtitle">Наживка</div>
      <div class="inventory__list">
        <div v-for="b in baits" :key="b.id" class="inventory__pill">
          {{ b.name }}: {{ inventory.baits?.[b.id] || 0 }}
        </div>
      </div>
    </div>
    <div class="inventory__section">
      <div class="inventory__subtitle">Прикормка</div>
      <div class="inventory__badge">{{ inventory.groundbait || 0 }}</div>
    </div>
    <div class="inventory__section">
      <div class="inventory__subtitle">Снасти</div>
      <div class="inventory__list">
        <div
          v-for="slot in slots"
          :key="slot"
          class="inventory__pill inventory__pill--wide"
        >
          {{ slotLabels[slot] }}: {{ tackleNameFor(equipped[slot]) }} ×{{ powerFor(equipped[slot]).toFixed(2) }}
        </div>
      </div>
      <div class="inventory__power">Мощность удочки: {{ rodPower.toFixed(2) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Inventory } from '@/store/types'
import { BaitDef, TackleItem, TackleSlot } from '@/store/game'

const props = defineProps<{
  inventory: Inventory
  baits: BaitDef[]
  equipped: Record<string, string | undefined>
  tackle: TackleItem[]
  rodPower: number
}>()

const slots: TackleSlot[] = ['rod', 'reel', 'line', 'hook']
const slotLabels: Record<TackleSlot, string> = {
  rod: 'Удилище',
  reel: 'Катушка',
  line: 'Леска',
  hook: 'Крючок',
}

const tackleById = computed(() => {
  const map: Record<string, TackleItem> = {}
  props.tackle.forEach((t) => { map[t.id] = t })
  return map
})

const tackleNameFor = (id?: string) => (id && tackleById.value[id]) ? tackleById.value[id].name : 'Нет'
const powerFor = (id?: string) => (id && tackleById.value[id]) ? tackleById.value[id].power : 1
</script>

<style scoped lang="less">
@bg-primary: rgba(255, 255, 255, 0.2);
@bg-secondary: rgba(255, 255, 255, 0.4);
@bg-dark: rgba(0, 0, 0, 0.2);
@border-radius: 8px;
@border-radius-large: 12px;
@spacing: 8px;
@spacing-large: 12px;

.block-base(@bg, @radius) {
  padding: @spacing;
  background: @bg;
  border-radius: @radius;
}

.inventory {
  width: 280px;
  .block-base(@bg-primary, @border-radius-large);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  gap: @spacing;

  &__title {
    font-weight: 700;
    margin-bottom: @spacing - 4;
  }

  &__section {
    .block-base(@bg-secondary, @border-radius);
    display: flex;
    flex-direction: column;
    gap: @spacing - 2;
  }

  &__subtitle {
    font-weight: 600;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    row-gap: @spacing - 2;
  }

  &__item {
    display: grid;
    grid-template-columns: 1fr 70px;
    gap: @spacing - 2;
  }

  &__name {
    .block-base(@bg-dark, @border-radius);
  }

  &__count {
    .block-base(@bg-primary, @border-radius);
    text-align: center;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: @spacing - 2;
  }

  &__pill {
    .block-base(@bg-dark, @border-radius);
    font-size: 12px;
  }

  &__pill--wide {
    display: flex;
    justify-content: space-between;
  }

  &__badge {
    .block-base(@bg-dark, @border-radius);
    width: fit-content;
    min-width: 60px;
    text-align: center;
  }

  &__power {
    font-size: 12px;
    text-align: right;
    opacity: 0.9;
  }
}
</style>
