<template>
  <div class="menu">
    <h1 class="menu__title">Мыльные пузыри</h1>
    <div class="menu__grid">
      <div class="menu__grid__item">
        <RouterLink :to="{ name: $routes.GAME }" class="menu__grid__item--game" @click="() => playClickSound()">
          Игра
        </RouterLink>
      </div>

      <div class="menu__grid__item">
        <RouterLink :to="{ name: $routes.OPTION }" class="menu__grid__item--options" @click="() => playClickSound()">
          Настройки
        </RouterLink>
      </div>
    </div>

    <div class="menu__footer">
      <p>Лопай пузыри правильного цвета!</p>
    </div>
  </div>
</template>


<script lang="ts">
import soundManager from './../../utils/soundManager'

export default {
  name: 'MainMenuPage',
  methods: {
    playClickSound() {
      soundManager.play('click')
    }
  }
}
</script>


<style scoped lang="scss">
$bgDark: #565b61;
$bgElement: #3a3f44;
$bgElementHover: #4a4f54;
$textLight: #ededf0;
$textMuted: #b0b0b0;
$accentGreen: #00d389;

@mixin button-base {
  display: block;
  width: 100%;
  padding: 15px 40px;
  font-size: 1.5rem;
  font-weight: 600;
  text-decoration: none;
  text-align: center;
  border-radius: 6px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-sizing: border-box;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
  border-radius: 10px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  &__title {
    text-align: center;
    color:$textLight;
    margin-bottom: 30px;
    font-size: 2.5rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
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

    &__item--game, &__item--options {
      @include button-base;
    }

    &__item--game {
      background: $accentGreen;
      color: white;

      &:hover {
        background: darken($accentGreen, 10%);
      }
    }

    &__item--options {
      background: $bgElement;
      color: $textLight;

      &:hover {
        background: $bgElementHover;
      }
    }
  }

  &__footer {
    background: $bgElement;
    padding: 15px;
    border-radius: 8px;
    border-left: 4px solid $accentGreen;
    text-align: center;

    p {
      color: $textMuted;
      font-size: 1rem;
      font-style: italic;
      margin: 0;
    }
  }
}
</style>