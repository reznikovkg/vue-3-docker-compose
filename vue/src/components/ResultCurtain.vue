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

<style scoped>
.curtain {
  position: absolute;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(3, 8, 14, 0.76);
  backdrop-filter: blur(8px);
  pointer-events: auto;
}

.curtain__panel {
  max-width: 420px;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(249, 198, 133, 0.18), rgba(10, 18, 26, 0.96));
  text-align: center;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.36);
}

.curtain__label {
  color: var(--accent-soft);
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.curtain h2 {
  margin: 14px 0 10px;
  font-size: 1.9rem;
}

.curtain p {
  color: var(--text-muted);
}

.curtain__actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}

.curtain__actions a,
.curtain__actions button {
  padding: 12px 16px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.09);
  color: var(--text-main);
  cursor: pointer;
}

.curtain__actions button {
  background: var(--accent-strong);
  color: #101820;
  font-weight: 700;
}
</style>
