<template>
  <div class="options">
    <BackgroundVideo :src="bgVideoUrl" />

    <div class="options__page">
      <div class="options__page__nav">
        <RouterLink :to="{ name: $routes.MAINMENU }" class="options__page__nav__link" @click="() => playClickSound()">
          Назад к игре
        </RouterLink>
      </div>

      <Tabs v-model="activeTab" :tabs="tabs" />

      <div v-if="activeTab === 'game'">
        <h2>Настройки игры</h2>
            
        <div class="options__page__grid">
          <div class="options__page__grid__item">
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

          <div class="options__page__grid__item">
            <label>Целевой цвет:</label>
            <ColorDropdown
              v-model="localSettings.targetColor"
              :colors="bubbleColors"
            />
          </div>

          <div class="options__page__grid__item">
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

          <div class="options__page__grid__item">
            <label>Очки за попадание:</label>
            <input 
                type="number" 
                min="1" 
                max="10" 
                v-model.number="localSettings.pointsForCorrect" 
            />
          </div>

          <div class="options__page__grid__item">
            <label>Очки за ошибку:</label>
            <input 
                type="number" 
                min="-20" 
                max="0" 
                v-model.number="localSettings.pointsForWrong" 
            />
          </div>

          <div class="options__page__grid__item">
            <label>Режим курсора:</label>
            <SelectDropdown
              v-model="localGameMode"
              :options="cursorModeOptions"
              :get-label="(opt) => opt.label"
            />
            <span class="hint">Режим взаимодействия с пузырями</span>
          </div>
        </div>
      </div>
      
      <div v-if="activeTab === 'video'">
        <h2>Настройки видео</h2>
        <div class="options__page__grid__item">
          <label>Частота кадров (FPS):</label>
          <SelectDropdown
            v-model="localSettings.fps"
            :options="fpsOptions"
            :get-label="(opt) => opt.label"
          />
          <span class="hint">Выберите целевую частоту кадров. Влияет на плавность анимации и нагрузку на процессор.</span>
        </div>
      </div>

      <div class="options__page__actions">
        <button class="options__page__actions__btn__save" @click="() => saveSettings()">Сохранить</button>
        <button class="options__page__actions__btn__reset" @click="() => resetToDefault()">Сбросить</button>
      </div>

      <div class="options__page__preview">
        <h3>Текущие настройки:</h3>
        <ul>
          <li>Цветов:  {{getTotalColors}} </li>
          <li>
            <div class="options__page__preview__color">
              Цель:
              <img :src="getColorImage(getTargetColor)" class="options__page__preview__color__bubble" />
              <span :style="{ color: getTargetColor }">{{ getColorName(getTargetColor) }}</span>
            </div>
          </li>
          <li>Скорость: {{ getSpawnRate }} шт/сек ({{ getSpawnInterval }} сек)</li>
          <li>Попадание: +{{ getPointsForCorrect }}</li>
          <li>Ошибка: {{ getPointsForWrong }}</li>
          <li>FPS: {{ getFPS }}</li>
          <li>Режим курсора: {{ getGameModeName }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import { mapGetters, mapActions } from 'vuex'
import bgVideo from './../../assets/videos/background.mp4'
import soundManager from './../../utils/soundManager'
import BackgroundVideo from './../ui/BackgroundVideo.vue'
import { BUBBLE_COLORS, getBubbleImage, getBubbleName } from './../../config/bubbles'
import SelectDropdown from './../ui/SelectDropdown.vue'
import ColorDropdown from './../ui/ColorDropdown.vue'
import Tabs from './../ui/Tabs.vue'

export default {
  name: 'OptionPage',
  data() {
    return {
      localSettings: {
        totalColors: 3,
        targetColor: 'red',
        spawnRate: 1,
        pointsForCorrect: 1,
        pointsForWrong: -5,
        fps: 60
      },
      localGameMode: 'click',
      activeTab: 'game'
    }
  },
  components: { 
    BackgroundVideo,
    SelectDropdown,
    ColorDropdown,
    Tabs
  },
  computed: {
    ...mapGetters([
      'getSettings',
      'getTotalColors',
      'getTargetColor',
      'getSpawnRate',
      'getPointsForCorrect',
      'getPointsForWrong',
      'getSpawnInterval',
      'getGameMode',
      'getFPS',
      'getGameModeName'
    ]),
    getLocalSpawnInterval(): string {
      return (1 / this.localSettings.spawnRate).toFixed(2)
    },
    hasChanges(): boolean {
      const saved = this.getSettings
      return  this.localSettings.totalColors      !== saved.totalColors       || 
              this.localSettings.targetColor      !== saved.targetColor       || 
              this.localSettings.spawnRate        !== saved.spawnRate         || 
              this.localSettings.pointsForCorrect !== saved.pointsForCorrect  || 
              this.localSettings.pointsForWrong   !== saved.pointsForWrong    || 
              this.localSettings.fps              !== saved.fps               ||
              this.localGameMode                  !== this.getGameMode 
    },
    fpsOptions() {
      return [
        { value: 30, label: '30 FPS (экономный)' },
        { value: 60, label: '60 FPS (рекомендуемый)' },
        { value: 120, label: '120 FPS (ультра)' },
        { value: 144, label: '144 FPS (для мощных ПК)' },
        { value: 240, label: '240 FPS (экспериментальный)' }
      ]
    },
    cursorModeOptions() {
      return [
        { value: 'click', label: 'Клик' },
        { value: 'auto', label: 'Авто' },
        { value: 'laser', label: 'Лазер' }
      ]
    },
    bgVideoUrl() {
      return bgVideo
    },
    bubbleColors() {
      return BUBBLE_COLORS
    },
    tabs() {
      return [
        { value: 'game', label: 'Игровые настройки' },
        { value: 'video', label: 'Видео' }
      ]
    }
  },
  mounted() {
    this.loadSettingsFromStore()
  },
  methods: {
    ...mapActions([
      'setSettings',
      'resetSettings',
      'setGameMode',
      'resetAll'
    ]),
    getColorImage(colorValue: string): string {
      return getBubbleImage(colorValue)
    },
    loadSettingsFromStore() {
      const saved = this.getSettings
      this.localSettings = { ...saved}
      this.localGameMode = this.getGameMode
    },
    getColorName(colorValue: string): string {
      return getBubbleName(colorValue)
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
      this.setGameMode(this.localGameMode)
    },
    resetToDefault() {
      this.playCancelSound()
      this.resetAll()
      this.loadSettingsFromStore()
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
  overflow-y: hidden;

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
    max-height: 90vh;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: $bgElement;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: $accentGreen;
      border-radius: 3px;
      
      &:hover {
        background: darken($accentGreen, 10%);
      }
    }

    h2 {
      text-align: center;
      color: $textLight;
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
}
</style>