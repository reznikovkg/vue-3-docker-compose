<template>
  <section class="fishing-page">
    <header class="fishing-page__header">
      <h1>Fishing Game</h1>
      <RouterLink :to="{ name: $routes.INDEX }">Back to Index</RouterLink>
    </header>

    <main class="fishing-page__layout">
      <aside class="fishing-page__panel">
        <h2>Locations</h2>
        <p>WIP: location selector with reservoir list and active selection.</p>
        <ul class="fishing-page__location-list">
          <li v-for="location in locations" :key="location.id">
            {{ location.name }}
          </li>
        </ul>
      </aside>

      <section class="fishing-page__scene">
        <h2>Scene</h2>
        <p>
          WIP: fake-3D scene layers for background, rod poses, bobber, and line.
        </p>
      </section>

      <aside class="fishing-page__panel">
        <h2>Status</h2>
        <p>WIP: runtime fishing state and catch minigame HUD.</p>
      </aside>
    </main>
  </section>
</template>

<script>
import { GAME_CONFIG } from '@/game-config';

export default {
  name: 'FishingPage',
  data() {
    return {
      phase: 'idle',
    };
  },
  computed: {
    isIdle() {
      return this.phase === 'idle';
    },
    locations() {
      return GAME_CONFIG.locations;
    },
  },
  methods: {
    setPhase(nextPhase) {
      this.phase = nextPhase;
    },
  },
};
</script>

<style scoped lang="scss">
.fishing-page {
  padding: 16px;
}

.fishing-page__header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.fishing-page__layout {
  display: grid;
  gap: 12px;
  grid-template-columns: 240px 1fr 240px;
}

.fishing-page__panel,
.fishing-page__scene {
  border: 1px solid #ccc;
  border-radius: 8px;
  min-height: 240px;
  padding: 12px;
}

.fishing-page__location-list {
  margin: 8px 0 0;
  padding-left: 18px;
}

@media (max-width: 900px) {
  .fishing-page__layout {
    grid-template-columns: 1fr;
  }
}
</style>
