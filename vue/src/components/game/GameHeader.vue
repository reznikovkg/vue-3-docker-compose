<template>
  <header class="runner-game__header">
    <div>
      <p class="runner-game__eyebrow">Аркада в стиле типо динозавра</p>
      <h1 class="runner-game__title">Neo-Runner</h1>
      <p class="runner-game__subtitle">
        Продержитесь как можно дольше, перепрыгивайте препятствия, уклоняйтесь от пуль и собирайте монеты.
      </p>
    </div>
    <div class="runner-game__indicators">
      <div class="runner-game__chip">Счёт: {{ score }}</div>
      <div class="runner-game__chip">Дистанция: {{ distance }} м</div>
      <div class="runner-game__chip">Монеты: {{ coins }}</div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  score: number
  distance: number
  coins: number
}>()
</script>

<style scoped lang="scss">
.runner-game {
  &__header {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
  }

  &__eyebrow {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 12px;
    color: #67e8f9;
  }

  &__title {
    margin: 4px 0;
    font-size: 30px;
    font-weight: 800;
    color: #f8fafc;
  }

  &__subtitle {
    margin: 0;
    max-width: 680px;
    color: rgba(226, 232, 240, 0.72);
    font-size: 15px;
  }

  &__indicators {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  &__chip {
    padding: 10px 14px;
    background: rgba(148, 163, 184, 0.14);
    border: 1px solid rgba(226, 232, 240, 0.08);
    border-radius: 999px;
    font-weight: 600;
    color: #e2e8f0;
    backdrop-filter: blur(6px);
    min-width: 140px;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum' 1;
  }

  @media (max-width: 820px) {
    &__header {
      flex-direction: column;
    }
  }
}
</style>
