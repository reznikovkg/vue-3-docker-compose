<template>
  <div class = "speed-button">
    <button 
      class = "speed-button__btn" 
      @click = "() => activateSpeed()"
      :disabled = "speedBoost"
    >
      Ускорить
    </button>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'SpeedButton',
  computed: {
    ...mapGetters('game', ['speedBoost'])
  },
  methods: {
    ...mapActions('game', ['activateSpeedBoost']),
    activateSpeed() {
      this.activateSpeedBoost()
    }
  }
}
</script>

<style scoped lang = "scss">
.speed-button {
  margin-top: 20px;
  text-align: center;

  &__btn {
    padding: 10px 20px;
    font-size: 18px;
    background: #6c55e2;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
  
    &:hover {
      background: #8370e4;
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }
}
</style>
