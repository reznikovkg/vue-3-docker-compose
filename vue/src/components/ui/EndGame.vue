<template>
  <div class="end">
    <p class="end__head end__p">Победа</p>
    <p class="end__p end__time">Ваше время {{ showTime }}</p>
    <RouterLink to="/" class="end__again">Заново</RouterLink>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'EndGame',
  computed: {
    ...mapGetters([
      'getTime',
    ]),
    showTime() {
      console.log(this.getTime)
      let minutes = Math.floor(this.getTime / 60)
      let seconds = this.getTime % 60
      if (minutes > 0) {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      } else {
        return `${seconds.toString().padStart(2, '0')}`
      }
    }
  }
}
</script>

<style scoped lang="scss">
.end {
  background-color: #fffaee;
  border: 2px solid #194d6c;
  border-radius: 40px;
  padding: 2vh;
  box-shadow: 0 6px 12px 0 #194d6c;
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
    padding: 2vh;
    text-align: center;
    margin-top: 2vh;
  }

  &__again {
    display: block;
    text-align: center;
    color: #194d6c;
    font-size: 30px;
    padding-left: 2vh;
    padding-right: 2vh;
    padding-bottom: 1.5vh;
    padding-top: 1.5vh;
    font-weight: bold;
    background-color: #abdaf4;
    border-radius: 50px;
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
    margin-top: 3vh;
    margin-bottom: 15px;
    box-shadow: 0 6px 12px 0 #194d6c;
    border-width: 2px;
    border-style: solid;

    &:hover {
      color: #194d6c;
      font-size: 35px;
      padding-left: 3vh;
      padding-right: 3vh;
      font-weight: bold;
      background-color: #abdaf4;
      border-radius: 50px;
      cursor: pointer;
      margin-top: 3vh;
      margin-bottom: 7px;
      box-shadow: 0 8px 16px 0 #194d6c;
      border-width: 2px;
      border-style: solid;
    }
  }
}
</style>