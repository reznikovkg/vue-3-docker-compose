<template>
  <div class="stopwatch"><p class="stopwatch__text">{{ showTime }}</p></div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Stopwatch',
  data() {
    return {
      timeInSeconds: 0,
      timer: null
    }
  },
  computed: {
    showTime() {
      console.log(this.timeInSeconds)
      let minutes = Math.floor(this.timeInSeconds / 60)
      let seconds = this.timeInSeconds % 60
      if (minutes > 0) {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      } else {
        return `${seconds.toString().padStart(2, '0')}`
      }
    }
  },
  mounted() {
    this.timer = setInterval(() => {
      this.timeInSeconds++
      this.setTime({time: this.timeInSeconds})
    }, 1000)
  },
  beforeUnmount() {
    console.log("stopwatch: ", this.showTime)
    this.setTime({time: this.timeInSeconds - 1})
    clearInterval(this.timer)
  },
  methods: {
    ...mapActions([
      'setTime',
    ]),
  }
}
</script>

<style scoped lang="scss">
.stopwatch {
  display: grid;
  width: 16vw;
  height: 7vw;
  font-size: 3vw;
  background-color: #fffaee;
  border-radius: 100px;
  border: 3px solid #194d6c;
  box-shadow: 0 6px 18px 0 #194d6c;
  align-items: center;
  place-items: center;
  text-align: center;

  &__text {
    color: #2c3e50;
    text-align: center;
  }

  @media (min-width: 1600px) {
    width: 12vw;
    height: 5vw;
    font-size: 3vw;
  }

  @media (min-width: 1300px) and (max-width: 1600px) {
    width: 14vw;
    height: 6vw;
    font-size: 3vw;
  }

  @media (min-width: 1000px) and (max-width: 1300px) {
    width: 16vw;
    height: 7vw;
    font-size: 3.5vw;
  }

  @media (min-width: 800px) and (max-width: 1000px) {
    width: 18vw;
    height: 8vw;
    font-size: 4vw;
  }

  @media (max-width: 800px) {
    width: 25vw;
    height: 10vw;
    font-size: 5vw;
  }
}
</style>