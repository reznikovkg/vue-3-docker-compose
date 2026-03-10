<template>
  <section class="missions">
    <div class="missions__intro">
      <p class="missions__eyebrow">Выбор уровня</p>
    </div>

    <div class="missions__grid">
      <MissionCard v-for="mission in missions" :key="mission.id" :mission="mission" />
    </div>
  </section>
</template>

<script setup>
import MissionCard from '@/components/MissionCard.vue'
import { MISSIONS } from '@/game/missionCatalog'

const missions = MISSIONS
</script>

<style scoped lang="scss">
.missions {
  display: grid;
  gap: 24px;

  &__intro {
    max-width: 820px;
  }

  &__eyebrow {
    margin-bottom: 12px;
    color: var(--accent-soft);
    font-size: 0.76rem;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }

  h1 {
    font-size: clamp(2rem, 4vw, 3.5rem);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }
}

@media (max-width: 1080px) {
  .missions {
    &__grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
