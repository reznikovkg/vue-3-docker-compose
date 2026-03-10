<template>
  <article class="mission-card">
    <div class="mission-card__topline">
      <span>{{ mission.difficulty }}</span>
    </div>
    <h3>{{ mission.name }}</h3>
    <dl class="mission-card__stats">
      <div>
        <dt>Стартовый бюджет</dt>
        <dd>{{ mission.startBudget }}</dd>
      </div>
      <div>
        <dt>Точек установки</dt>
        <dd>{{ mission.pads.length }}</dd>
      </div>
      <div>
        <dt>Врагов в волне</dt>
        <dd>{{ mission.waveOrder.length }}</dd>
      </div>
    </dl>
    <RouterLink class="mission-card__action" :to="{ name: $routes.BATTLE, params: { missionId: mission.id } }">
      Начать
    </RouterLink>
  </article>
</template>

<script setup>
defineProps({
  mission: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped lang="scss">
$card-border: 1px solid rgba(255, 255, 255, 0.08);
$card-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
$card-bg: (
  linear-gradient(140deg, rgba(247, 191, 132, 0.14), rgba(10, 21, 29, 0.9)),
  rgba(10, 21, 29, 0.86)
);
$stats-bg: rgba(255, 255, 255, 0.05);

.mission-card {
  display: grid;
  gap: 16px;
  padding: 24px;
  border: $card-border;
  border-radius: 28px;
  background: $card-bg;
  box-shadow: $card-shadow;

  &__topline {
    display: flex;
    justify-content: flex-end;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.76rem;
  }

  h3 {
    font-size: 1.6rem;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;

    div {
      padding: 12px;
      border-radius: 18px;
      background: $stats-bg;
    }

    dt {
      margin-bottom: 6px;
      color: var(--text-muted);
      font-size: 0.8rem;
    }

    dd {
      font-family: var(--font-accent);
      font-size: 1.1rem;
    }
  }

  &__action {
    justify-self: start;
    padding: 12px 18px;
    border-radius: 999px;
    background: var(--accent-strong);
    color: #101820;
    font-weight: 700;
  }
}

@media (max-width: 720px) {
  .mission-card {
    &__stats {
      grid-template-columns: 1fr;
    }
  }
}
</style>
