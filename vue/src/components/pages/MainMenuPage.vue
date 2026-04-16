<template>
  <div class="menu">
    <BackgroundVideo :src="bgVideoUrl" />

    <div class="menu__page">
      <h1 class="menu__page__title">Мыльные пузыри</h1>
      <div class="menu__page__grid">
        <div class="menu__page__grid__item">
          <RouterLink :to="{ name: $routes.GAME }" class="menu__page__grid__item--game" @click="() => playClickSound()">
            Игра
          </RouterLink>
        </div>

        <div class="menu__page__mode">
          <span class="menu__page__mode__label">Режим игры:</span>
          <div class="menu__page__mode__options">
            <div 
              v-for="mode in modes" 
              :key="mode.value"
              class="menu__page__mode__option"
              :class="{ 'menu__page__mode__option--active': gameMode === mode.value }"
              @click="() => selectMode(mode.value)"
            >
              <span class="menu__page__mode__option__name">{{ mode.name }}</span>
              <div class="menu__page__mode__option__tooltip">
                {{ mode.description }}
              </div>
            </div>
          </div>
        </div>

        <div class="menu__page__grid__item">
          <RouterLink :to="{ name: $routes.OPTION }" class="menu__page__grid__item--options" @click="() => playClickSound()">
            Настройки
          </RouterLink>
        </div>
      </div>

      <div class="menu__page__footer">
        <p>Лопай пузыри правильного цвета!</p>
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import BackgroundVideo from './../ui/BackgroundVideo.vue';
import bgVideo from './../../assets/videos/background.mp4'
import soundManager from './../../utils/soundManager'
import PreloadService from './../../services/PreloadService'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'MainMenuPage',
  components: { BackgroundVideo },
  computed: {
    ...mapGetters(['getGameMode']),
    gameMode: {
      get(): string {
        return this.getGameMode
      },
      set(value: string) {
        this.setGameMode(value)
      }
    },
    modes() {
      return [
        {
          value: 'click',
          name: 'Клик',
          description: 'Нажми на пузырь — он лопнет. Классическая механика.'
        },
        {
          value: 'auto',
          name: 'Автомат',
          description: 'Автоматическая стрельба каждые 0.5 сек. Метки показывают область попадания.'
        },
        {
          value: 'laser',
          name: 'Лазер',
          description: 'Проведи курсором — пузыри лопаются по всей траектории движения.'
        }
      ]
    },
    bgVideoUrl() {
      return bgVideo
    }    
  },
  mounted() {
    PreloadService.preloadAll()
  },
  methods: {
    ...mapActions(['setGameMode']),
    playClickSound() {
      soundManager.play('click')
    },
    selectMode(mode: string) {
      this.gameMode = mode
      this.playClickSound()
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
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  &__page {
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
    z-index: 1;

    &__title {
      text-align: center;
      color: $textLight;
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

        &--game, &--options {
          @include button-base;
        }

        &--game {
          background: $accentGreen;
          color: white;

          &:hover {
            background: darken($accentGreen, 10%);
          }
        }

        &--options {
          background: $bgElement;
          color: $textLight;

          &:hover {
            background: $bgElementHover;
          }
        }
      }
    }

    &__mode {
      background: $bgElement;
      padding: 15px;
      border-radius: 8px;
      margin: 10px 0;

      &__label {
        display: block;
        color: $textLight;
        font-size: 1rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 15px;
        text-align: center;
      }

      &__options {
        display: flex;
        gap: 15px;
        justify-content: center;
        flex-wrap: wrap;
      }

      &__option {
        position: relative;
        flex: 1;
        min-width: 100px;
        padding: 12px 20px;
        font-size: 1rem;
        font-weight: 600;
        text-align: center;
        background: $bgDark;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: $textMuted;

        &:hover {
          background: $bgElementHover;
          transform: translateY(-2px);
          
          .menu__page__mode__option__tooltip {
            opacity: 1;
            visibility: visible;
            transform: translateX(-50%) translateY(0);
          }
        }

        &__name {
          display: block;
        }

        &__tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-10px);
          background: $bgDark;
          color: $textLight;
          font-size: 0.8rem;
          font-weight: normal;
          padding: 8px 12px;
          border-radius: 6px;
          white-space: nowrap;
          z-index: 100;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s ease;
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          margin-bottom: 10px;
          
          &::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-width: 5px;
            border-style: solid;
            border-color: $bgDark transparent transparent transparent;
          }
        }

        &--active {
          background: $accentGreen;
          color: white;

          &:hover {
            background: darken($accentGreen, 10%);
          }
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
}
</style>