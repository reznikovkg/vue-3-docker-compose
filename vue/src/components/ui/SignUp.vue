<template>
  <div class="end">
    <p class="end__p end__time">Почта</p>
    <input type="email" class="end__input" v-model="email">
    <p class="end__p end__time">Имя</p>
    <input type="text" class="end__input" v-model="name">
    <p class="end__p end__time">Пароль</p>
    <input type="password" class="end__input" v-model="password">
    <p class="end__error" :style="errorStyle"> {{ error }}</p>
    <Button class="end__button" @click="() => signUp()">Регистрация</Button>
    <div class="end__google" @click="() => signWithGoogle()"><p class="end__googletext">Через Google</p></div>
  </div>
</template>

<script>
import { auth, db } from '@/firebase/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import Button from '@/components/ui/Button.vue'

export default {
  name: 'SignUp',
  components: { Button },
  emits: ['success'],
  data() {
    return {
      email: "",
      name: "",
      password: "",
      isError: false,
      error: "",
    }
  },
  computed: {
    errorStyle() {
      if (this.isError) {
        return {
          marginTop: 'calc(2vh - 18px)',
          paddingBottom: 'calc(1vh - 6px)',
        }
      }
    }
  },
  methods: {
    signUp() {
      createUserWithEmailAndPassword(auth, this.email, this.password)
        .then(userCredential => {
          let uid = userCredential.user.uid

          return setDoc(doc(db, 'users', uid), {
            name: this.name,
            extra_information: []
          })
        })
        .then(() => {
          this.$emit('success')
        })
        .catch(err => {
          console.error(err)
          this.isError = true
          switch (err.code) {
            case 'auth/email-already-in-use':
              this.error = 'Этот email уже зарегистрирован'
              break
            case 'auth/invalid-email':
              this.error = 'Неверный формат email'
              break
            case 'auth/weak-password':
              this.error = 'Пароль слишком короткий'
              break
            default:
              this.error = 'Что-то пошло не так'
          }
        })
    },
    signWithGoogle() {
      let provider = new GoogleAuthProvider()

      signInWithPopup(auth, provider)
        .then(result => {
          let uid = result.user.uid
          let name = result.user.displayName

          return getDoc(doc(db, 'users', uid))
            .then(userDoc => {
              if (!userDoc.exists()) {
                return setDoc(doc(db, 'users', uid), {
                  name: name,
                  extra_information: []
                })
              }
            })
        })
        .then(() => {
          this.$emit('success')
        })
        .catch(err => {
          console.error(err)
          this.isError = true
          switch (err.code) {
            case 'auth/popup-closed-by-user':
              this.error = 'Окно входа было закрыто'
              break
            case 'auth/popup-blocked':
              this.error = 'Браузер заблокировал окно входа'
              break
            case 'auth/account-exists-with-different-credential':
              this.error = 'Этот email уже используется с другим способом входа'
              break
            case 'auth/cancelled-popup-request':
              break
            default:
              this.error = 'Что-то пошло не так'
          }
        })
    }
  }
}
</script>

<style scoped lang="scss">
.end {
  background-color: #fffaee;
  border: 2px solid #194d6c;
  border-radius: 40px;
  padding-top: 1vh;
  padding-bottom: 2.5vh;
  padding-left: 4vh;
  padding-right: 4vh;
  box-shadow: 0 8px 30px 0 #003b5a;
  overflow: hidden;

  &__head {
    text-align: center;
    background-color: #e5f4fb;
    text-transform: uppercase;
    box-shadow: 0px 4px 8px #97ceef;
    border-radius: 20px;
    border: 1px solid #194d6c;
    color: #194d6c;
    font-size: 30px;
    padding: 2vh;
    padding-left: 6vw;
    padding-right: 6vw;
    font-weight: bold;
  }

  &__p {
    color: #194d6c;
    font-size: 30px;
    text-transform: uppercase;
    font-weight: bold;
  }

  &__time {
    width: 100%;
    font-size: clamp(20px, 1.2vw, 25px);
    padding: 1vh;
    text-align: center;
    margin-top: 1vh;
  }

  &__error {
    width: 100%;
    font-size: 15px;
    padding-bottom: 1vh;
    padding-left: 1vh;
    padding-right: 1vh;
    text-align: center;
    margin-top: 2vh;
    color: #194d6c;
  }

  &__input {
    margin-bottom: 1vh;
    width: 100%;
    height: 3vh;
    color: #194d6c;
    -webkit-text-fill-color: #194d6c;
    font-size: 2vh;
    box-shadow: 0px 4px 8px #97ceef;
    border-radius: 20px;
    border: 1px solid #194d6c;

    &:focus {
      outline: 1px solid #194d6c;
      box-shadow: 0px 4px 12px #194d6c;
    }
  }

  &__button {
    font-size: 20px;
    padding: 1.5vh 2vh;
    margin-top: 1vh;
    margin-bottom: 15px;
    width: fit-content;
    text-transform: uppercase;
    text-align: center;

    &:hover {
      font-size: 25px;
      padding: 1.5vh 2.5vh;
      margin-top: 1.5vh;
      margin-bottom: 1px;
    }
  }

  &__google {
    padding-top: 1.5vh;
  }

  .end__googletext {
    color: #194d6c;
    width: fit-content;
    text-align: center;
    margin: auto;
    cursor: pointer;
    font-weight: bold;
    transform: scale(1.2);
    text-decoration: underline;

    &:hover {
      transform: scale(1);
      font-weight: normal;
      text-decoration: none;
    }
  }
}
</style>