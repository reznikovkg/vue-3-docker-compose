<template>
  <div class="modal">
    <div class="modal__content">
      <h2>Игра завершена</h2>

      <div>
        Ваше время: {{ timer }} сек
      </div>

      <div>
        Рекорд: {{ record }} сек
      </div>

      <button @click="restart">
        Рестарт
      </button>

      <button @click="menu">
        В меню
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'timer',
      'record'
    ])
  },

  methods: {
    ...mapActions([
      'startGame',
      'resetGame'
    ]),

    restart() {
      this.startGame()
    },

    menu() {
      this.resetGame()
      this.$router.push('/')
    }
  }
}
</script>

<style scoped lang="scss">
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;

  &__content {
    background: white;
    padding: 30px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  button {
    padding: 10px;
    cursor: pointer;
  }
}
</style>
