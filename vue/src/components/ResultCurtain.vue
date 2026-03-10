<template>
  <div v-if="result" class="curtain">
    <div class="curtain__panel">
      <span class="curtain__label">{{ result === 'win' ? 'Уровень завершён' : 'Поражение' }}</span>
      <h2>{{ result === 'win' ? 'Победа' : 'Поражение' }}</h2>
      <p>
        {{ result === 'win'
          ? 'Волна остановлена. Можно перезапустить миссию или вернуться к выбору уровней.'
          : 'Нужно перестроить линию обороны и скорректировать распределение средств.' }}
      </p>
      <div class="curtain__actions">
        <button type="button" @click="$emit('restart')">Начать заново</button>
        <RouterLink :to="{ name: $routes.MISSIONS }">К уровням</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  result: {
    type: String,
    default: null,
  },
})

defineEmits(['restart'])
</script>

<style scoped lang="scss">
$curtain-bg: rgba(3, 8, 14, 0.76);
$panel-border: 1px solid rgba(255, 255, 255, 0.08);
$panel-bg: linear-gradient(180deg, rgba(249, 198, 133, 0.18), rgba(10, 18, 26, 0.96));
$panel-shadow: 0 24px 60px rgba(0, 0, 0, 0.36);
$action-bg: rgba(255, 255, 255, 0.09);

.curtain {
  position: absolute;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  padding: 24px;
  background: $curtain-bg;
  backdrop-filter: blur(8px);
  pointer-events: auto;

  &__panel {
    max-width: 420px;
    padding: 28px;
    border: $panel-border;
    border-radius: 28px;
    background: $panel-bg;
    text-align: center;
    box-shadow: $panel-shadow;
  }

  &__label {
    color: var(--accent-soft);
    font-size: 0.74rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  h2 {
    margin: 14px 0 10px;
    font-size: 1.9rem;
  }

  p {
    color: var(--text-muted);
  }

  &__actions {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 20px;

    a,
    button {
      padding: 12px 16px;
      border: 0;
      border-radius: 999px;
      background: $action-bg;
      color: var(--text-main);
      cursor: pointer;
    }

    button {
      background: var(--accent-strong);
      color: #101820;
      font-weight: 700;
    }
  }
}
</style>
