<template>
  <div class="settings-modal" @click="() => closeModal()">
    <div class="settings-modal__container" @click.stop>
      <div class="settings-modal__title">
        Настройка
      </div>

      <div class="settings-modal__line"/>

      <div class="settings-modal__content">
        <div class="settings-modal__text">
          Введите размер игрового поля:
        </div>

        <div class="settings-modal__input-group">
          <label class="settings-modal__label">
            Ширина:
          </label>
          <input
              v-model.number="widthValue"
              type="number"
              class="settings-modal__input"
              placeholder="4"
          >
        </div>

        <div class="settings-modal__input-group">
          <label class="settings-modal__label">
            Высота:
          </label>
          <input
              v-model.number="heightValue"
              type="number"
              class="settings-modal__input"
              placeholder="4"
          >
        </div>

        <div class="settings-modal__input-group">
          <label class="settings-modal__label settings-modal__label--checkbox">
            <input
                type="checkbox"
                v-model="blockedModeValue"
                class="settings-modal__checkbox"
            >
            Сложный режим (блокировка клеток)
          </label>
        </div>
      </div>

      <div class="settings-modal__footer">
        <CustomButton
            class="settings-modal__button"
            @click="() => playGame()"
        >
          Играть
        </CustomButton>
      </div>
    </div>
  </div>
</template>

<script>
import CustomButton from '@/components/ui/CustomButton.vue'

export default {
  name: 'SettingsModal',
  components: {
    CustomButton
  },
  props: {
    width: {
      type: Number,
      default: 4
    },
    height: {
      type: Number,
      default: 4
    },
    blockedMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      widthValue: this.width,
      heightValue: this.height,
      blockedModeValue: this.blockedMode
    }
  },
  methods: {
    playGame() {
      this.$emit('play', {
        width: this.widthValue,
        height: this.heightValue,
        blockedMode: this.blockedModeValue
      })
    },
    closeModal() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/styles";

.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $black;
  display: flex;
  justify-content: center;
  align-items: center;

  &__container {
    width: 400px;
    color: $purpleText;
    border: 4px solid $purpleBorder;
    border-radius: 60px;
    display: flex;
    flex-direction: column;
    background: $purpleBg;
  }

  &__title {
    text-align: center;
    font-size: 40px;
    font-weight: 600;
    color: $purpleDark;
    margin: 10px;
  }

  &__line {
    @include gradientLine;
    height: 3px;
    width: 80%;
    max-width: 1000px;
    margin: 0 auto;
  }

  &__content {
    width: 100%;
    max-width: 950px;
    margin: 0 auto;
    padding: 0 30px;
    flex: 1;
  }

  &__text {
    font-size: 25px;
    color: $purpleDarker;
    margin-top: 10px;
    margin-bottom: 20px;
  }

  &__input-group {
    margin-bottom: 20px;
  }

  &__label {
    display: block;
    font-size: 20px;
    color: $purpleDarker;
    margin-bottom: 5px;

    &--checkbox {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
    }
  }

  &__input {
    width: 100%;
    padding: 8px 12px;
    font-size: 18px;
    border: 2px solid $purpleBorder;
    border-radius: 8px;
    background: white;
    color: $purpleText;

    &:focus {
      outline: none;
      border-color: $purpleMedium;
    }

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  &__checkbox {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  &__footer {
    display: flex;
    justify-content: center;
    margin-bottom: 40px;
  }

  &__button {
    padding: 8px 24px;
    font-size: 30px;

  }
}
</style>
