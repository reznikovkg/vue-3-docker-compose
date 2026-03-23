<template>
  <div class = "preferences">
    <div class = "preferences__back">
      <RouterLink :to = "{ name: $routes.MAINMENU }" class = "preferences__back__link">
        ← Вернуться в меню
      </RouterLink>
    </div>
    <h2 class = "preferences__title">Персональные настройки</h2>
    <div class = "preferences__params">
      <div class = "preferences__params__group">
        <label>Количество оттенков:</label>
        <input
            type = "number"
            min = "1"
            max = "7"
            step = "1"
            v-model.number = "userSettings.colorsCount"
        />
        <span class = "hint">от 1 до 7</span>
      </div>
      <div class = "preferences__params__group">
        <label>Целевой цвет:</label>
        <div class = "preferences__params__color--palette">
          <div
              v-for = "color in colorVariants"
              :key = "color.value"
              class = "preferences__params__color--palette__swatch"
              :class = "{ active: color.value === userSettings.selectedColor }"
              @click = "() => pickColor(color.value)"
          >
            <img :src = "color.image" :alt = "color.name" />
          </div>
        </div>
      </div>
      <div class = "preferences__params__group">
        <label>Скорость появления (шт/сек):</label>
        <input
            type = "number"
            min = "0.1"
            max = "1000"
            step = "0.1"
            v-model.number = "userSettings.spawnSpeed"
        />
        <span class = "hint">{{ formattedSpawnInterval }} сек на пузырь</span>
      </div>
      <div class = "preferences__params__group">
        <label>Награда за попадание:</label>
        <input
            type = "number"
            min = "1"
            max = "10"
            v-model.number = "userSettings.pointsSuccess"
        />
      </div>
      <div class = "preferences__params__group">
        <label>Штраф за промах:</label>
        <input
            type = "number"
            min = "-20"
            max = "0"
            v-model.number = "userSettings.pointsFail"
        />
      </div>
    </div>
    <div class = "preferences__actions">
      <button class = "preferences__actions__save" @click = "() => applySettings()">Применить</button>
      <button class = "preferences__actions__reset" @click = "() => restoreDefaults()">Сброс</button>
    </div>
  </div>
</template>

<script lang="ts">
import { mapGetters, mapActions } from 'vuex'
import redBubble from '@/assets/bubbles/red.png'
import orangeBubble from '@/assets/bubbles/orange.png'
import yellowBubble from '@/assets/bubbles/yellow.png'
import greenBubble from '@/assets/bubbles/green.png'
import blueBubble from '@/assets/bubbles/blue.png'
import purpleBubble from '@/assets/bubbles/purple.png'
import pinkBubble from '@/assets/bubbles/pink.png'

export default {
  name: 'OptionPage',
  data() {
    return {
      userSettings: {
        colorsCount: 3,
        selectedColor: 'red',
        spawnSpeed: 1,
        pointsSuccess: 1,
        pointsFail: -5
      }
    }
  },
  computed: {
    ...mapGetters({
      storedSettings: 'appConfig'
    }),
    colorVariants() {
      return [
        { value: 'red', name: 'Красный', image: redBubble },
        { value: 'orange', name: 'Оранжевый', image: orangeBubble },
        { value: 'yellow', name: 'Жёлтый', image: yellowBubble },
        { value: 'green', name: 'Зелёный', image: greenBubble },
        { value: 'blue', name: 'Синий', image: blueBubble },
        { value: 'purple', name: 'Фиолетовый', image: purpleBubble },
        { value: 'pink', name: 'Розовый', image: pinkBubble }
      ]
    },
    formattedSpawnInterval(): string {
      return (1 / this.userSettings.spawnSpeed).toFixed(2)
    }
  },
  mounted() {
    this.loadStoredSettings()
  },
  methods: {
    ...mapActions({
      updateSettings: 'saveConfig',
      revertSettings: 'resetConfig'
    }),
    loadStoredSettings() {
      const saved = this.storedSettings
      if (saved && typeof saved === 'object' && saved.totalColors !== undefined) {
        this.userSettings = {
          colorsCount: saved.totalColors,
          selectedColor: saved.targetColor,
          spawnSpeed: saved.spawnRate,
          pointsSuccess: saved.pointsForCorrect,
          pointsFail: saved.pointsForWrong
        }
      }
      // иначе остаются дефолтные
    },
    pickColor(colorValue: string) {
      this.userSettings.selectedColor = colorValue
    },
    applySettings() {
      if (this.userSettings.colorsCount < 1 || this.userSettings.colorsCount > 8) {
        alert('Количество цветов должно быть от 1 до 8')
        return
      }
      if (this.userSettings.spawnSpeed < 0.1) {
        alert('Скорость должна быть не менее 0.1')
        return
      }
      this.updateSettings({
        totalColors: this.userSettings.colorsCount,
        targetColor: this.userSettings.selectedColor,
        spawnRate: this.userSettings.spawnSpeed,
        pointsForCorrect: this.userSettings.pointsSuccess,
        pointsForWrong: this.userSettings.pointsFail
      })
    },
    restoreDefaults() {
      this.revertSettings()
      this.loadStoredSettings()
    }
  }
}
</script>

<style scoped lang="scss">
$bgMain: #fff9f0;
$bgSoft: #fce9e1;
$bgHover: #f5d9cd;
$textPrimary: #a58d7b;
$textMuted: #d6c6b8;
$accentSoft: #f3b3a1;
$borderSoft: #f0d9cf;

:global(html), :global(body) {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

@mixin input-field {
  padding: 10px 12px;
  border: 2px solid $bgSoft;
  border-radius: 20px;
  background: $bgSoft;
  color: $textPrimary;
  font-size: 16px;
  transition: all 0.3s ease;

  &:hover {
    border-color: $bgHover;
  }
  &:focus {
    outline: none;
    border-color: $accentSoft;
    box-shadow: 0 0 0 3px rgba($accentSoft, 0.2);
  }
}

.preferences {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 90vh;
  overflow-y: auto;
  user-select: none;
  max-width: 700px;
  width: 90%;
  margin: 0 auto;
  padding: 30px 20px;
  background: $bgMain;
  border-radius: 30px;
  border: 2px solid $borderSoft;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);

  &__back {
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

  &__title {
    text-align: center;
    color: $textPrimary;
    margin-bottom: 35px;
    font-size: 2.2rem;
    font-weight: 400;
    text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.8);
  }

  &__params {
    display: flex;
    flex-direction: column;
    gap: 25px;
    margin-bottom: 35px;

    &__group {
      display: flex;
      flex-direction: column;
      gap: 8px;

      label {
        color: $textPrimary;
        font-weight: 500;
        font-size: 15px;
        letter-spacing: 0.3px;
      }

      input {
        @include input-field;
      }

      .hint {
        font-size: 12px;
        color: $textMuted;
        font-style: italic;
        padding-left: 10px;
      }
    }

    &__color--palette {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: center;
      margin-top: 5px;

      &__swatch {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: 3px solid transparent;
        cursor: pointer;
        transition: all 0.2s ease;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        &:hover {
          transform: scale(1.1);
          border-color: $accentSoft;
        }

        &.active {
          border-color: $accentSoft;
          box-shadow: 0 0 0 3px rgba($accentSoft, 0.3);
        }
      }
    }
  }

  &__actions {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-bottom: 35px;

    button {
      padding: 12px 35px;
      font-size: 16px;
      font-weight: 600;
      border: none;
      border-radius: 40px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba($accentSoft, 0.3);
      }
    }

    &__save {
      background: $accentSoft;
      color: white;
    }

    &__reset {
      background: $bgSoft;
      color: $textPrimary;

      &:hover {
        background: $bgHover;
      }
    }
  }
}
</style>