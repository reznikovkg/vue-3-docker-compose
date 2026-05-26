<template>
  <div class = "preferences">
    <BackLink />
    <h2 class = "preferences__title">Персональные настройки</h2>
    <div class = "preferences__params">
      <OptionGroup label = "Количество оттенков:" hint = "от 1 до 7">
        <input
            type = "number"
            min = "1"
            max = "7"
            step = "1"
            v-model.number = "userSettings.colorsCount"
        />
      </OptionGroup>

      <OptionGroup label = "Целевой цвет:">
        <ColorPalette
            v-model = "userSettings.selectedColor"
            :colors = "colorVariants"
        />
      </OptionGroup>

      <OptionGroup label = "Скорость появления (шт/сек):" :hint = "formattedHint">
        <input
            type = "number"
            min = "0.1"
            max = "1000"
            step = "0.1"
            v-model.number = "userSettings.spawnSpeed"
        />
      </OptionGroup>

      <OptionGroup label = "Награда за попадание:">
        <input
            type = "number"
            min = "1"
            max = "10"
            v-model.number = "userSettings.pointsSuccess"
        />
      </OptionGroup>

      <OptionGroup label = "Штраф за промах:">
        <input
            type = "number"
            min = "-20"
            max = "0"
            v-model.number = "userSettings.pointsFail"
        />
      </OptionGroup>
    </div>

    <ActionButtons @apply = "() => applySettings()" @reset = "() => restoreDefaults()" />
  </div>
</template>

<script lang="ts">
import { mapGetters, mapActions } from 'vuex'
import { COLOR_IMAGES, COLOR_NAMES, COLOR_LIST } from '@/config/gameConfig'
import BackLink from '@/components/options/BackLink.vue'
import OptionGroup from '@/components/options/OptionGroup.vue'
import ColorPalette from '@/components/options/ColorPalette.vue'
import ActionButtons from '@/components/options/ActionButtons.vue'

export default {
  name: 'OptionPage',
  components: {BackLink, OptionGroup, ColorPalette, ActionButtons },
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
      return COLOR_LIST.map(color => ({
        value: color,
        name: COLOR_NAMES[color],
        image: COLOR_IMAGES[color]
      }))
    },
    formattedSpawnInterval(): string {
      return (1 / this.userSettings.spawnSpeed).toFixed(2)
    },
    formattedHint() {
      return `${this.formattedSpawnInterval} сек на пузырь`
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
@import '@/assets/styles/variables.scss';
:global(html), :global(body) {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
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
  }
}
</style>