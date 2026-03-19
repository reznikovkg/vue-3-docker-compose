<template>
  <div class="body">
    <div class="head">
      <h2 class="header">Пятнашки</h2>
      <div class="line"/>
    </div>

    <div class="textContainer">
      <div class="title">Правила игры</div>
      <div class="text">- Перед вами поле из фишек с числами и одной пустой клеткой</div>
      <div class="text">- Цель - упорядочить все фишки по возрастанию слева направо и сверху вниз</div>
      <div class="text">
        - Перемещать можно только те фишки,
        которые находятся рядом с пустой клеткой
        (по горизонтали или вертикали)
      </div>
      <div class="title">Важно</div>
      <div class="text">Перед началом игра необходимо задать размер поля.</div>
      <div class="text">Нажмите "Начать игру" и введите ширину и высоту поля.</div>
      <div class="text">Удачи!</div>
    </div>
  </div>

  <div class="button">
    <CustomButton @click="() => openModal()">Начать игру</CustomButton>
  </div>

  <SettingsModal
      v-show="isModalVisible"
      @close="closeModal"
      @play="startGame"
  />

</template>

<script>
import CustomButton from "@/components/ui/CustomButton.vue";
import SettingsModal from "@/components/modals/SettingsModal.vue";
import {mapActions} from "vuex";

export default {
  name: 'IndexPage',
  components: {
    CustomButton,
    SettingsModal
  },
  data() {
    return {
      isModalVisible: false
    }
  },
  methods: {
    ...mapActions({
      saveGameSize: 'updateGameSize'
    }),
    openModal() {
      this.isModalVisible = true
    },
    closeModal() {
      this.isModalVisible = false
    },
    startGame(sizeData) {
      this.saveGameSize(sizeData)
          .then(() => {
            this.closeModal()
            this.$router.push({name: this.$routes.TAG_GAME})
          })
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/styles";

.header {
  text-align: center;
  color: $purpleDark;
  font-size: 70px;
  font-weight: 700;

  @media (max-width: 480px) {
    font-size: 40px;
  }
}

.line {
  @include gradientLine;
  height: 3px;
  width: 80%;
  max-width: 1000px;
  margin: 0 auto;
}

.textContainer {
  @include containerPadding;
  width: 100%;
  max-width: 950px;
  margin: 0 auto;
  word-wrap: break-word;
}

.title {
  font-size: 40px;
  font-weight: 600;
  color: $purpleDark;
  margin: 10px;

  @media (max-width: 480px) {
    font-size: 30px;
  }
}

.text {
  font-size: 30px;
  color: $purpleDarker;

  @media (max-width: 480px) {
    font-size: 18px;
  }
}

.button {
  display: flex;
  align-items: center;
  align-content: center;

  :deep(.c-button) {
    @media (max-width: 480px) {
      font-size: 24px;
      padding: 12px 24px;
    }
  }
}
</style>
