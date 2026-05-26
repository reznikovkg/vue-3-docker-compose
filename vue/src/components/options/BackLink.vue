<template>
  <div class = "preferences__back">
    <RouterLink :to = "{ name: $routes.MAINMENU }" class = "preferences__back__link">
      ← Вернуться в меню
    </RouterLink>
  </div>
</template>

<script>
export default {
  name: 'BackLink'
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';
.preferences__back {
  margin-bottom: 25px;

  &__link {
    display: inline-block;
    padding: 8px 20px;
    background: $bgSoft;
    color: $textPrimary;
    text-decoration: none;
    border-radius: 40px;
    font-size: 14px;
    transition: all 0.3s ease;

    &:hover {
      background: $bgHover;
      transform: translateX(-5px);
    }
  }
}
</style>