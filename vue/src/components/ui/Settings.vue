<template>
  <div class="settings-page">
    <div class="settings">
      <p class="settings__p settings__head_p">Переливатор</p>

      <div class="settings__sliders">
        <FlaskSlider
          label="Количество колб"
          :modelValue="qtyFlasks"
          :min="3"
          :max="9"
          :step="1"
          color="linear-gradient(180deg, rgba(230, 107, 107, 0.88) 0%, rgba(242, 166, 90, 0.9) 100%)"
          @update:modelValue="(value) => updateQtyFlasks(value)"
        />

        <FlaskSlider
          label="Количество цветов"
          :modelValue="qtyColors"
          :min="2"
          :max="Math.min(qtyFlasks - 1, 7)"
          :step="1"
          color="linear-gradient(180deg, rgba(120, 185, 111, 0.9) 0%, rgba(103, 183, 209, 0.9) 100%)"
          @update:modelValue="(value) => updateQtyColors(value)"
        />

        <FlaskSlider
          label="Лимит слоев"
          :modelValue="maxQtyLayers"
          :min="2"
          :max="qtyFlasks - 1"
          :step="1"
          color="linear-gradient(180deg, rgba(94, 134, 214, 0.9) 0%, rgba(154, 116, 216, 0.9) 100%)"
          @update:modelValue="(value) => updateQtyLayers(value)"
        />
      </div>

      <div class="settings__mode">
        <span class="settings__mode-label">Сложный режим</span>

        <button
          type="button"
          class="settings__toggle"
          :class="{ 'settings__toggle--active': hardMode }"
          @click="() => toggleHardMode()"
        >
          <span class="settings__toggle-thumb"></span>
        </button>
      </div>

      <button
        type="button"
        class="settings__btn"
        @click="() => handleStartGame()"
      >
        Начать игру!
      </button>
    </div>

    <Records />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import FlaskSlider from '@/components/ui/FlaskSlider.vue'
import Records from '@/components/ui/Records.vue'

export default {
  name: 'Settings',
  components: {
    FlaskSlider,
    Records
  },
  data() {
    return {
      qtyFlasks: 5,
      qtyColors: 4,
      maxQtyLayers: 4,
      hardMode: false
    }
  },
  methods: {
    ...mapActions([
      'startGame'
    ]),
    handleStartGame() {
      this.startGame({
        isStartedGame: 1,
        qtyFlasks: this.qtyFlasks,
        qtyColors: this.qtyColors,
        maxQtyLayers: this.maxQtyLayers,
        hardMode: this.hardMode
      })

      this.$router.push({ name: this.$routes.GAME })
    },
    updateQtyFlasks(value) {
      this.qtyFlasks = value

      if (value <= this.qtyColors) {
        this.qtyColors = value - 1
      }

      if (this.qtyColors > 7) {
        this.qtyColors = 7
      }

      if (value <= this.maxQtyLayers) {
        this.maxQtyLayers = value - 1
      }
    },
    updateQtyColors(value) {
      this.qtyColors = value
    },
    updateQtyLayers(value) {
      this.maxQtyLayers = value
    },
    toggleHardMode() {
      this.hardMode = !this.hardMode
    }
  }
}
</script>

<style scoped lang="scss">
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
}

.settings {
  width: min(100%, 760px);
  padding: 26px;
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.58);
  backdrop-filter: blur(10px);
  box-shadow:
    0 18px 40px rgba(41, 65, 85, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);

  &__head_p {
    font-size: 38px;
    text-align: center;
    text-transform: uppercase;
    color: #1f3140;
    background: rgba(244, 248, 251, 0.85);
    border-radius: 22px;
    margin-bottom: 24px;
    padding: 16px 20px;
    font-weight: 800;
    letter-spacing: 0.03em;
    box-shadow: inset 0 0 0 1px rgba(180, 198, 211, 0.35);
  }

  &__sliders {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    align-items: start;
    justify-items: center;
  }

  &__mode {
    margin-top: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
  }

  &__mode-label {
    color: #243746;
    font-size: 26px;
    font-weight: 700;
  }

  &__toggle {
    position: relative;
    width: 86px;
    height: 44px;
    border: none;
    border-radius: 999px;
    background: linear-gradient(180deg, #dce7ee 0%, #c6d7e3 100%);
    box-shadow:
      inset 0 1px 2px rgba(60, 80, 95, 0.12),
      0 6px 14px rgba(41, 65, 85, 0.08);
    cursor: pointer;
    transition: background 0.2s ease;

    &--active {
      background: linear-gradient(180deg, #b2d6bf 0%, #86bc97 100%);
    }
  }

  &__toggle-thumb {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(180deg, #ffffff 0%, #edf4f8 100%);
    box-shadow:
      0 4px 10px rgba(41, 65, 85, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
    transition: transform 0.2s ease;
  }

  &__toggle--active &__toggle-thumb {
    transform: translateX(42px);
  }

  &__btn {
    width: 100%;
    margin-top: 26px;
    padding: 16px 18px;
    font-size: 30px;
    font-weight: 800;
    color: #223442;
    border: none;
    border-radius: 22px;
    background: linear-gradient(180deg, #edf4f8 0%, #dce8f0 100%);
    box-shadow:
      0 10px 24px rgba(41, 65, 85, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.7);
    transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  }

  &__btn:hover {
    cursor: pointer;
    transform: translateY(-2px);
    background: linear-gradient(180deg, #f2f7fa 0%, #deebf3 100%);
    box-shadow:
      0 14px 28px rgba(41, 65, 85, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.75);
  }
  
  @media (max-width: 900px) {
    &__sliders {
      grid-template-columns: 1fr;
      gap: 28px;
    }

    &__mode {
      flex-direction: column;
      gap: 12px;
    }
  }
}
</style>