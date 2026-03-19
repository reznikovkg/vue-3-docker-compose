<template>
  <div class="modalOverlay" @click="() => closeModal()">
    <div class="container" @click.stop>
      <div class="title">
        Настройка
      </div>
      <div class="line"/>
      <div class="textContainer">
        <div class="text">Введите размер игрового поля:</div>

        <div class="inputWrapper">
          <label
              for="width"
              class="inputLabel"
          >
            Ширина:
          </label>
          <input
              id="width"
              v-model.number="widthValue"
              type="number"
              class="inputField"
              placeholder="4"
          >
        </div>

        <div class="inputWrapper">
          <label
              for="height"
              class="inputLabel"
          >
            Высота:
          </label>
          <input
              id="height"
              v-model.number="heightValue"
              type="number"
              class="inputField"
              placeholder="4"
          >
        </div>
      </div>

      <div class="buttonWrapper">
        <CustomButton
            class="playButton"
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
    }
  },
  data() {
    return {
      widthValue: this.width,
      heightValue: this.height
    }
  },
  methods: {
    playGame() {
      this.$emit('play', {
        width: this.widthValue,
        height: this.heightValue
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

.modalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $black;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  width: 400px;
  height: 500px;
  color: $purpleText;
  border: 4px solid $purpleBorder;
  border-radius: 60px;
  display: flex;
  flex-direction: column;
  background: $purpleBg;
}

.title {
  text-align: center;
  font-size: 40px;
  font-weight: 600;
  color: $purpleDark;
  margin: 10px;
}

.line {
  @include gradientLine;
  height: 3px;
  width: 80%;
  max-width: 1000px;
  margin: 0 auto;
}

.textContainer {
  width: 100%;
  max-width: 950px;
  margin: 0 auto;
  padding: 0 30px;
}

.text {
  font-size: 25px;
  color: $purpleDarker;
  margin-top: 10px;
  margin-bottom: 20px;
}

.inputWrapper {
  margin-bottom: 20px;
}

.inputLabel {
  display: block;
  font-size: 20px;
  color: $purpleDarker;
  margin-bottom: 5px;
}

.inputField {
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

.buttonWrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.playButton {
  padding: 8px 24px;
  font-size: 30px;
}
</style>
