<template>
  <div class="settings">
    <p class="settings__p settings__head-p">Переливатор</p>

    <div class="settings__parameter">
      <p class="settings__p">Количество колб: </p>
      <p class="settings__show-qty">{{ qtyFlasks }}</p>
    </div>
    <input type="range" min="3" max="20" step="1" :value="qtyFlasks" class="settings__input-qty" @input="(e) => changeQtyFlasks(e)">

    <div class="settings__parameter">
      <p class="settings__p">Количество цветов: </p>
      <p class="settings__show-qty">{{ qtyColors }}</p>
    </div>
    <input type="range" min="2" :max="qtyFlasks - 1" step="1" :value="qtyColors" class="settings__input-qty" @input="(e) => changeQtyColors(e)">

    <div class="settings__parameter">
      <p class="settings__p">Лимит слоев: </p>
      <p class="settings__show-qty">{{ maxQtyLayers }}</p>
    </div>
    <input type="range" min="2" :max="qtyFlasks - 1" step="1" :value="maxQtyLayers" class="settings__input-qty" @input="(e) => changeQtyLayers(e)">

    <div class="settings__parameter">
      <p class="settings__p">Сложный режим: </p>
      <Tumbler class="settings__tumbler" @onSwitch="(isOn) => handleSwitchGameMode(isOn)"></Tumbler>
    </div>

    <div v-if="!isLoggedIn" class="settings__user">
      <p class="settings__sign settings__signup" @click="() => showSignUp()">Регистрация</p>
      <p class="settings__sign settings__signin" @click="() => showSignIn()">Вход</p>
    </div>
    <div v-else class="settings__exit">
      <p class="settings__sign settings__signout" @click="() => executeSignOut()">Выйти</p>
    </div>

    <Button class="settings__btn" @click="() => handleStartGame()">Начать игру!</Button>
  </div>

  <div class="modal" v-if="isClickedSignUp" @click.self="() => backToSettings()">
    <SignUp class="modal__sign" @success="() => backToSettings()"></SignUp>
  </div>
  <div class="modal" v-if="isClickedSignIn" @click.self="() => backToSettings()">
    <SignIn class="modal__sign" @success="() => backToSettings()"></SignIn>
  </div>
</template>

<script>
import { auth } from '@/firebase/firebase'
import { signOut } from 'firebase/auth'
import { mapGetters, mapActions } from 'vuex'
import Tumbler from '@/components/ui/Tumbler.vue'
import SignUp from '@/components/ui/SignUp.vue'
import SignIn from '@/components/ui/SignIn.vue'
import Button from '@/components/ui/Button.vue'

export default {
  name: 'Settings',
  components: {SignIn, SignUp, Tumbler, Button},
  data() {
    return {
      qtyFlasks: 5,
      qtyColors: 4,
      maxQtyLayers: 4,
      hardMode: false,
      isClickedSignUp: false,
      isClickedSignIn: false,
    }
  },
  computed: {
    ...mapGetters([
      'getUser',
      'isLoggedIn',
    ]),
  },
  mounted() {
    this.subscribeTop()
  },
  beforeUnmount() {
    this.unsubscribeTop()
  },
  methods: {
    ...mapActions([
      'startGame',
      'subscribeTop',
      'unsubscribeTop'
    ]),
    handleStartGame() {
      this.startGame({
        isStartedGame: 1,
        qtyFlasks: this.qtyFlasks,
        qtyColors: this.qtyColors,
        maxQtyLayers: this.maxQtyLayers,
        hardMode: this.hardMode
      })
      console.log('start game')
      this.$router.push('/game')
    },
    handleSwitchGameMode(isOn) {
      this.hardMode = !this.hardMode
    },
    changeQtyFlasks(e) {
      this.qtyFlasks = Number(e.target.value)
      if (Number(e.target.value) <= this.qtyColors) {
        this.qtyColors = Number(e.target.value) - 1
      }
      if (Number(e.target.value) <= this.maxQtyLayers) {
        this.maxQtyLayers = Number(e.target.value) - 1
      }
    },
    changeQtyColors(e) {
      this.qtyColors = Number(e.target.value)
    },
    changeQtyLayers(e) {
      this.maxQtyLayers = Number(e.target.value)
    },
    showSignUp() {
      this.isClickedSignUp = true
    },
    showSignIn() {
      this.isClickedSignIn = true
    },
    executeSignOut() {
      signOut(auth)
        .then(() => {
          console.log('signOut: ', this.getUser)
        })
        .catch(err => console.error(err))
    },
    backToSettings() {
      this.isClickedSignUp = false
      this.isClickedSignIn = false
    }
  }
}
</script>

<style scoped lang="scss">
$font-size-btn: clamp(22px, 3vw, 30px);

.settings {
  background-color: #fffaee;
  border: 2px solid #194d6c;
  border-radius: 40px;
  padding-top: 2vh;
  padding-left: 2vh;
  padding-right: 2vh;
  padding-bottom: 2vh;
  box-shadow: 0 6px 12px 0 #194d6c;
  position: relative;
  user-select: none;
  width: max(25vw, 100%);
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    pointer-events: none;
    z-index: 0;
    border-radius: 40px;
  }

  &__parameter {
    display: grid;
    grid-template-columns: 4fr 1fr;
    position: relative;
    z-index: 1;
  }

  &__user {
    display: grid;
    grid-template-columns: 1fr 1fr;
    position: relative;
    z-index: 1;
    background-color: #ebf6fd;
    text-transform: uppercase;
    box-shadow: 0px 4px 8px #97ceef;
    border: 1px solid #194d6c;
    border-radius: 20px;
    width: 70%;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 1vh;
    align-items: center;
    place-items: center;
    justify-items: stretch;
  }

  &__exit {
    display: grid;
    position: relative;
    z-index: 1;
    background-color: #ebf6fd;
    text-transform: uppercase;
    box-shadow: 0px 4px 8px #97ceef;
    border: 1px solid #194d6c;
    border-radius: 20px;
    width: 70%;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 1vh;
    align-items: center;
    place-items: center;
    justify-items: stretch;
  }

  &__head-p {
    font-size: 40px;
    text-align: center;
    background-color: #e5f4fb;
    text-transform: uppercase;
    box-shadow: 0px 4px 8px #97ceef;
    border-radius: 20px;
    border: 1px solid #194d6c;
    position: relative;
    z-index: 1;
  }

  &__p {
    color: #194d6c;
    font-size: clamp(21px, 3vw, 30px);
    padding: 2vh;
    font-weight: bold;
    position: relative;
    z-index: 1;
  }

  &__show-qty {
    color: #194d6c;
    font-size: clamp(21px, 3vw, 30px);
    text-align: center;
    padding: 2vh;
    font-weight: bold;
    position: relative;
    z-index: 1;
  }

  &__sign {
    color: #3395cc;
    font-size: clamp(12px, 1vw, 18px);
    padding: 1.5vh;
    font-weight: bold;
    position: relative;
    z-index: 1;
    width: 100%;
    align-items: center;
    place-items: center;
    text-align: center;

    &:hover {
      cursor: pointer;
      color: #194d6c;
      box-shadow: 0px 4px 8px #194d6c;
    }
  }

  &__signup {
    margin: auto;
    border-top-left-radius: 20px;
    border-bottom-left-radius: 20px;
  }

  &__signin {
    border-left: 1px solid #194d6c;
    margin: auto;
    border-top-right-radius: 20px;
    border-bottom-right-radius: 20px;
  }

  &__signout {
    margin: auto;
    border-radius: 20px;
  }

  &__btn {
    display: block;
    font-size: $font-size-btn;
    padding: 2vh;
    margin-top: 3vh;
    margin-bottom: 30px;
    position: relative;
    z-index: 1;
    width: fit-content;
    text-align: center;

    &:hover {
      font-size: calc($font-size-btn + 5px);
      margin-bottom: 22px;
    }
  }

  &__input-qty {
    width: 70%;
    background: #e0e0e0;
    border-radius: 10px;
    margin-left: 15%;
    margin-bottom: 2vh;
    border-color: #0b649a;
    -webkit-appearance: none;
    appearance: none;
    position: relative;
    z-index: 1;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      background: #3b82f6;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 8px 18px 0 #194d6c;
      transition: 0.1s;
      position: relative;
      z-index: 1;

      &:hover {
        transform: scale(1.3);
        background: #286185;
        box-shadow: 0 8px 18px 0 #194d6c;
        position: relative;
        z-index: 1;
      }

      &:active {
        transform: scale(1.3);
        background: #286185;
        box-shadow: 0 8px 18px 0 #194d6c;
        position: relative;
        z-index: 1;
      }
    }

    &::-webkit-slider-runnable-track {
      width: 70%;
      background: linear-gradient(to right, #abdaf4, #82aaef);
      border-radius: 10px;
      border-color: #194d6c;
      border-width: 1px;
      border-style: solid;
      box-shadow: 0 3px 6px 0 #194d6c;
      position: relative;
      z-index: 1;
    }
  }

  @media (min-width: 1950px) {
    width: 25vw;
  }

  @media (min-width: 1600px) and (max-width: 1950px) {
    width: 28vw;
  }

  @media (min-width: 1700px) and (max-width: 1950px) {
    width: 30vw;
  }

  @media (min-width: 1500px) and (max-width: 1700px) {
    width: 33vw;
  }

  @media (min-width: 1350px) and (max-width: 1500px) {
    width: 36vw;
  }

  @media (min-width: 1200px) and (max-width: 1350px) {
    width: 40vw;
  }

  @media (min-width: 1000px) and (max-width: 1200px) {
    width: 48vw;
  }

  @media (min-width: 900px) and (max-width: 1000px) {
    width: 50vw;
  }

  @media (min-width: 800px) and (max-width: 900px) {
    width: 55vw;
  }

  @media (max-width: 800px) {
    width: 90vw;
  }
}

.modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}
</style>