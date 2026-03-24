<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: "EndGame",
}
</script>

<template>
  <div class="settings">
    <p class="settings__p settings__head">Победа</p>
  </div>
</template>

<style scoped lang="scss">
.settings {
  background-color: #fffaee;
  border: 2px solid #194d6c;
  border-radius: 40px;
  padding: 2vh;
  box-shadow: 0 6px 12px 0 #194d6c;
  position: relative;
  background-size: 100% 100%;

  &__head {
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
    font-size: 30px;
    padding: 2vh;
    font-weight: bold;
    position: relative;
    z-index: 1;
  }
}
</style>