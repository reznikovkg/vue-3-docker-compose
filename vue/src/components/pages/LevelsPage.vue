<template>
  <div class="levels-page">
    <div class="levels-page__header">
      <div class="levels-page__title-block">
        <h1 class="levels-page__title">Levels</h1>
        <p class="levels-page__text">
          Choose a level
        </p>
      </div>

      <button
          class="levels-page__back-button"
          type="button"
          @click="() => goHome()"
      >
        Back to home
      </button>
    </div>

    <div class="levels-page__grid">
      <button
          v-for="level in levelList"
          :key="level.id"
          class="levels-page__card"
          type="button"
          @click="() => openLevel(level.id)"
      >
        <div class="levels-page__card-title">{{ level.title }}</div>
        <div class="levels-page__card-line">Path points: {{ level.path.length }}</div>
        <div class="levels-page__card-line">Tower slots: {{ level.slots.length }}</div>
      </button>
    </div>
  </div>
</template>

<script>
import { levelConfig } from '@/data/levelConfig'

export default {
  name: 'LevelsPage',

  computed: {
    levelList () {
      return Object.values(levelConfig)
    }
  },

  methods: {
    goHome () {
      this.$router.push('/')
    },

    openLevel (levelKey) {
      this.$router.push(`/level/${levelKey}`)
    }
  }
}
</script>

<style scoped lang="scss">
.levels-page {
  padding: 24px;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
  }

  &__title-block {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__title {
    margin: 0;
    font-size: 36px;
    line-height: 1.1;
  }

  &__text {
    margin: 0;
    color: var(--muted);
  }

  &__back-button {
    padding: 12px 14px;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: var(--panel);
    color: var(--text);
    cursor: pointer;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  &__card {
    padding: 20px;
    border: 1px solid var(--line);
    border-radius: 18px;
    background: var(--panel);
    color: var(--text);
    text-align: left;
    cursor: pointer;
  }

  &__card:hover {
    border-color: var(--accent);
  }

  &__card-title {
    margin-bottom: 10px;
    font-size: 22px;
    font-weight: bold;
  }

  &__card-line {
    color: var(--muted);
    line-height: 1.6;
  }
}
</style>