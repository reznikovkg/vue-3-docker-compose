<template>
  <div class="options">
    <div class="options__nav">
      <RouterLink :to="{ name: $routes.MAINMENU }" class="options__nav__link" @click="() => playClickSound()">
        Назад к игре
      </RouterLink>
    </div>

    <h2>Настройки игры</h2>
        
    <div class="options__grid">
      <div class="options__grid__item">
        <label>Количество цветов:</label>
        <input 
            type="number" 
            min="1" 
            max="8" 
            step="1"  
            v-model.number="localSettings.totalColors" 
        />
        <span class="hint">от 1 до 8</span>
      </div>

      <div class="options__grid__item">
        <label>Целевой цвет:</label>
        <div class="options__grid__item__color">
          <div class="options__grid__item__color__current" @click="() => changeColorDropdown()">
            <img :src="getColorImage(localSettings.targetColor)" class="options__grid__item__color__current__preview" />
            <span>{{ getColorName(localSettings.targetColor) }}</span>
            <span class="options__grid__item__color__current__arrow">{{ showColorDropdown ? '▲' : '▼' }}</span>
          </div>
            
          <div class="options__grid__item__color__dropdown" v-if="showColorDropdown">
            <div 
                v-for="color in colorOptions" 
                class="options__grid__item__color__dropdown__option" 
                :key="color.value" 
                :class="{ active: color.value === localSettings.targetColor }" 
                @click="() => selectColor(color.value)"
            >
              <img :src="color.image" class="options__grid__item__color__dropdown__option__preview" />
              <span>{{ color.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="options__grid__item">
        <label>Интенсивность (шт/сек):</label>
        <input 
            type="number" 
            min="0.1" 
            max="1000" 
            step="0.1" 
            v-model.number="localSettings.spawnRate" 
        />
        <span class="hint">{{ getLocalSpawnInterval }} сек на пузырь</span>
      </div>

      <div class="options__grid__item">
        <label>Очки за попадание:</label>
        <input 
            type="number" 
            min="1" 
            max="10" 
            v-model.number="localSettings.pointsForCorrect" 
        />
      </div>

      <div class="options__grid__item">
        <label>Очки за ошибку:</label>
        <input 
            type="number" 
            min="-20" 
            max="0" 
            v-model.number="localSettings.pointsForWrong" 
        />
      </div>
    </div>

    <div class="options__actions">
      <button class="options__actions__btn__save" @click="() => saveSettings()">Сохранить</button>
      <button class="options__actions__btn__reset" @click="() => resetToDefault()">Сбросить</button>
    </div>

    <div class="options__preview">
      <h3>Текущие настройки:</h3>
      <ul>
        <li>Цветов:  {{getTotalColors}} </li>
        <li>
          <div class="options__preview__color">
            Цель:
            <img :src="getColorImage(getTargetColor)" class="options__preview__color__bubble" />
            <span :style="{ color: getTargetColor }">{{ getColorName(getTargetColor) }}</span>
          </div>
        </li>
        <li>Скорость: {{ getSpawnRate }} шт/сек ({{ getSpawnInterval }} сек)</li>
        <li>Попадание: +{{ getPointsForCorrect }}</li>
        <li>Ошибка: {{ getPointsForWrong }}</li>
      </ul>
    </div>
  </div>
</template>


<script lang="ts">
import { mapGetters, mapActions } from 'vuex';
import blueBubble from './../../assets/bubbles/bubble_blue.png'
import greenBubble from './../../assets/bubbles/bubble_green.png'
import orangeBubble from './../../assets/bubbles/bubble_orange.png'
import pinkBubble from './../../assets/bubbles/bubble_pink.png'
import purpleBubble from './../../assets/bubbles/bubble_purple.png'
import redBubble from './../../assets/bubbles/bubble_red.png'
import whiteBubble from './../../assets/bubbles/bubble_white.png'
import yellowBubble from './../../assets/bubbles/bubble_yellow.png'
import soundManager from './../..//utils/soundManager'

export default {
  name: 'OptionPage',
  data() {
    return {
      localSettings: {
        totalColors: 3,
        targetColor: 'red',
        spawnRate: 1,
        pointsForCorrect: 1,
        pointsForWrong: -5
      },
      showColorDropdown: false
    }
  },
  computed: {
    ...mapGetters([
      'getSettings',
      'getTotalColors',
      'getTargetColor',
      'getSpawnRate',
      'getPointsForCorrect',
      'getPointsForWrong',
      'getSpawnInterval'
    ]),
    colorOptions() {
      return [
        { value: 'red', name: 'Красный', image: redBubble },
        { value: 'blue', name: 'Синий', image: blueBubble },
        { value: 'green', name: 'Зелёный', image: greenBubble },
        { value: 'yellow', name: 'Жёлтый', image: yellowBubble },
        { value: 'purple', name: 'Фиолетовый', image: purpleBubble },
        { value: 'pink', name: 'Розовый', image: pinkBubble },
        { value: 'orange', name: 'Оранжевый', image: orangeBubble },
        { value: 'white', name: 'Белый', image: whiteBubble }
      ]
    },
    getLocalSpawnInterval(): string {
      return (1 / this.localSettings.spawnRate).toFixed(2)
    },
    hasChanges(): boolean {
      const saved = this.getSettings
      return this.localSettings.totalColors !== saved.totalColors || this.localSettings.targetColor !== saved.targetColor || this.localSettings.spawnRate !== saved.spawnRate || this.localSettings.pointsForCorrect !== saved.pointsForCorrect || this.localSettings.pointsForWrong !== saved.pointsForWrong
    }
  },
  mounted() {
    this.loadSettingsFromStore()
  },
  methods: {
    ...mapActions([
      'setSettings',
      'resetSettings'
    ]),
    getColorImage(colorValue: string): string {
      const color = this.colorOptions.find(c => c.value === colorValue)
      return color ? color.image : whiteBubble
    },
    loadSettingsFromStore() {
      const saved = this.getSettings
      this.localSettings = { ...saved}
    },
    getColorName(colorValue: string): string {
      const color = this.colorOptions.find(c => c.value === colorValue)
      return color ? color.name : colorValue
    },
    selectColor(colorValue: string) {
      this.playClickSound()
      this.localSettings.targetColor = colorValue
      this.showColorDropdown = false
    },
    saveSettings() {
      if (this.localSettings.totalColors < 1 || this.localSettings.totalColors > 8) {
        alert('Количество цветов должно быть от 1 до 8')
        return
      }
      if (this.localSettings.spawnRate < 0.1) {
        alert('Скорость должна быть минимум 0.1')
        return
      }
      this.playSaveSound()
      this.setSettings({ ...this.localSettings })
    },
    resetToDefault() {
      this.playCancelSound()
      this.resetSettings()
      this.loadSettingsFromStore()
    },
    changeColorDropdown() {
      this.playClickSound()
      this.showColorDropdown  = !this.showColorDropdown
    },
    playSaveSound() {
      soundManager.play('save')
    },
    playClickSound() {
      soundManager.play('click')
    },
    playCancelSound() {
      soundManager.play('cancel')
    }
  }
}
</script>


<style scoped lang="scss">
$bgDark: #565b61;
$bgElement: #3a3f44;
$bgInputHover: #4a4f54;
$textLight: #ededf0;
$textMuted: #b0b0b0;
$accentGreen: #00d389;

:global(html), :global(body) {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow-y: auto;

  scrollbar-width: none;
  -ms-overflow-style: none;
}

@mixin input-style {
  padding: 10px 12px;
  border: 2px solid $bgElement;
  border-radius: 6px;
  background: $bgElement;
  color: $textLight;
  font-size: 16px;
  transition: all 0.3s ease;

  &:hover { border-color: $bgInputHover; }
  &:focus {
    outline: none;
    border-color: $accentGreen;
    box-shadow: 0 0 0 3px rgba($accentGreen, 0.2);
  }
}

.options {
  user-select: none;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: $bgDark;
  border-radius: 10px;

  h2 {
    text-align: center;
    color:$textLight;
    margin-bottom: 30px;
  }

  &__nav {
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid $bgElement;

    &__link {
      display: inline-block;
      padding: 8px 16px;
      background: $bgElement;
      color: $textLight;
      text-decoration: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;

      &:hover {
        background: $bgInputHover;
        transform: translateX(-5px);
      }
    }
  }

  &__grid {
    display: grid;
    gap: 20px;
    margin-bottom: 30px;

    &__item {
      display: flex;
      flex-direction: column;
      gap: 8px;

      label {
        color: $textLight;
        font-weight: 600;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    
      input, select { 
        @include input-style; 
      }

      select { 
        cursor: pointer; 
      }

      .hint {
        font-size: 12px;
        color: $textMuted;
        font-style: italic;
      }

      &__color {
        position: relative;

        &__current {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: $bgElement;
          border: 2px solid $bgElement;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            border-color: $bgInputHover;
          }

          &__preview {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            object-fit: cover;
          }

          &__arrow {
            margin-left: auto;
            color: $textMuted;
            font-size: 12px;
          }
        }

        &__dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 5px;
          background: $bgElement;
          border: 2px solid $bgInputHover;
          border-radius: 6px;
          z-index: 10;
          max-height: 300px;
          overflow-y: auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

          &__option {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
              background: $bgInputHover;
            }

            &.active {
              background: $accentGreen;
            
              span {
                color: white;
                font-weight: 600;
              }
            }

            &__preview {
              width: 30px;
              height: 30px;
              border-radius: 50%;
              object-fit: cover;
            }

            span {
              color: $textLight;
            }
          }
        }
      }
    }
  }

  &__actions {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-bottom: 30px;

    button {
      padding: 12px 30px;
      font-size: 16px;
      font-weight: 600;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
    }

    &__btn {
      &__save {
        background: $accentGreen;
        color: white;
        
        &:hover {
          background: darken($accentGreen, 10%);
        }
      }
    
      &__reset {
        background: #ff6b6b;
        color: white;
    
        &:hover {
          background: darken(#ff6b6b, 10%);
        }
      }
    }
  }

  &__preview {
    background: $bgElement;
    padding: 20px;
    border-radius: 8px;
    border-left: 4px solid $accentGreen;
    
    h3 {
      margin: 0 0 15px 0;
      color: $textLight;
      font-size: 18px;
      font-weight: 600;
    }
    
    ul {
      margin: 0;
      padding-left: 20px;
      color: $textMuted;
    
      li {
        margin: 8px 0;
        font-size: 14px;
        
        span {
          font-weight: 600;
          text-transform: capitalize;
        }
      }
    }

    &__color {
      display: flex;
      align-items: center;
      gap: 10px;

      &__bubble {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        object-fit: cover;
      }

      span {
        font-weight: 600;
        text-transform: capitalize;
        
        &[style*="color"] {
          text-shadow: 0 0 5px currentColor;
        }
      }
    }
  }
}
</style>