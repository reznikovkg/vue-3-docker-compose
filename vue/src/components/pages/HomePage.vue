<template>
  <div class="home-page">
    <div class="home-page__header">
      <h1 class="home-page__title">Home</h1>
      <p class="home-page__text">
        Tower Defense lab project
      </p>
    </div>

    <div class="home-page__cards">
      <button
          class="home-page__card"
          type="button"
          @click="() => goToLevels()"
      >
        <div class="home-page__card-title">Tower Defense</div>
        <div class="home-page__card-text">Open levels</div>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage',

  methods: {
    goToLevels () {
      this.$router.push('/levels')
    }
  }
}
</script>

<style scoped lang="scss">
.home-page {
  padding: 24px;

  &__header {
    margin-bottom: 24px;
  }

  &__title {
    margin: 0 0 8px 0;
    font-size: 36px;
    line-height: 1.1;
  }

  &__text {
    margin: 0;
    color: var(--muted);
  }

  &__cards {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }

  &__card {
    width: 420px;
    max-width: 100%;
    padding: 24px;
    border: 1px solid var(--line);
    border-radius: 20px;
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
    font-size: 24px;
    font-weight: bold;
  }

  &__card-text {
    color: var(--muted);
    font-size: 16px;
  }
}
</style>