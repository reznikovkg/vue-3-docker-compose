<template>
  <div class = "landing-page">
    <h1 class = "landing-page__title">
      Vampire Survivors
    </h1>

    <RouterLink
      class = "landing-page__link"
      :to = "{ name: $routes.SURVIVAL }"
    >
      Start Game
    </RouterLink>
  </div>
</template>

<script>
export default {
  name: 'LandingPage'
}
</script>

<style scoped lang="scss">
.landing-page {
  display: grid;
  gap: 20px;
  justify-content: center;
  align-content: center;
  min-height: 100vh;

  &__title {
    font-size: 32px;
  }

  &__link {
    font-size: 20px;
  }
}
</style>