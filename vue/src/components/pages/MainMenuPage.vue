<template>
  <div class = "menu">
    <h1 class = "menu__title">Мыльные пузыри</h1>
    <div class = "menu__grid">
      <div class = "menu__grid__item">
        <RouterLink :to = "{ name: $routes.GAME }" class = "menu__grid__item--game">
          Игра
        </RouterLink>
      </div>

      <div class = "menu__grid__item">
        <RouterLink :to = "{ name: $routes.OPTION }" class = "menu__grid__item--options">
          Настройки
        </RouterLink>
      </div>
    </div>

    <div class = "menu__footer">
      <p>Лёгких пузырьков и хорошего настроения!</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MainMenuPage'
}
</script>

<style scoped lang="scss">
$bgDark: #fff9f0;
$bgElement: #fce9e1;
$bgElementHover: #f5d9cd;
$textLight: #a58d7b;
$textMuted: #d39974;
$accentPastel: #f3b3a1;
$borderColor: #f0d9cf;

@mixin button-base {
  display: block;
  width: 100%;
  padding: 15px 40px;
  font-size: 1.5rem;
  font-weight: 600;
  text-decoration: none;
  text-align: center;
  border-radius: 30px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(243, 179, 161, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
}

.menu {
  user-select: none;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  background: $bgDark;
  border-radius: 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid $borderColor;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);

  &__title {
    text-align: center;
    color: $textLight;
    margin-bottom: 30px;
    font-size: 2.5rem;
    text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.8);
    font-weight: 400;
  }

  &__grid {
    display: grid;
    gap: 20px;
    margin-bottom: 30px;

    &__item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    &__item--game {
      @include button-base;
      background: $bgElement;
      color: $textLight;
      border: none;

      &:hover {
        background: darken($accentPastel, 8%);
      }
    }

    &__item--options {
      @include button-base;
      background: $bgElement;
      color: $textLight;
      border: 1px solid lighten($bgElement, 5%);

      &:hover {
        background: $bgElementHover;
      }
    }
  }

  &__footer {
    background: $bgElement;
    padding: 15px;
    border-radius: 40px;
    text-align: center;
    box-shadow: inset 0 2px 5px rgba(255, 255, 255, 0.7);

    p {
      color: $textMuted;
      font-size: 1.1rem;
      font-style: italic;
      margin: 0;
    }
  }
}
</style>