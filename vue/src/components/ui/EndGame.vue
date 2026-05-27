<template>
  <div class="end">
    <p class="end__p end__head">Победа</p>
    <p class="end__p end__time">Ваше время: {{ showTime }}</p>

    <RouterLink :to="{ name: $routes.INDEX }" class="end__again">
      Заново
    </RouterLink>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'EndGame',
  computed: {
    ...mapGetters([
      'getTime'
    ]),
    showTime() {
      const minutes = Math.floor(this.getTime / 60)
      const seconds = this.getTime % 60

      if (minutes > 0) {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }

      return `${seconds.toString().padStart(2, '0')}`
    }
  }
}
</script>

<style scoped lang="scss">
.end {
  width: min(100%, 520px);
  padding: 26px;
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.58);
  backdrop-filter: blur(10px);
  box-shadow:
    0 18px 40px rgba(41, 65, 85, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);

  &__head {
    font-size: 38px;
    text-align: center;
    text-transform: uppercase;
    color: #1f3140;
    background: rgba(244, 248, 251, 0.85);
    border-radius: 22px;
    padding: 16px 20px;
    font-weight: 800;
    letter-spacing: 0.03em;
    box-shadow: inset 0 0 0 1px rgba(180, 198, 211, 0.35);
  }

  &__p {
    color: #243746;
    font-size: 30px;
    padding: 14px 8px;
    font-weight: 700;
  }

  &__time {
    text-align: center;
    margin-top: 12px;
  }

  &__again {
    display: block;
    text-align: center;
    margin-top: 26px;
    padding: 16px 18px;
    font-size: 30px;
    font-weight: 800;
    color: #223442;
    border-radius: 22px;
    background: linear-gradient(180deg, #edf4f8 0%, #dce8f0 100%);
    box-shadow:
      0 10px 24px rgba(41, 65, 85, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.7);
    transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  }

  &__again:hover {
    cursor: pointer;
    transform: translateY(-2px);
    background: linear-gradient(180deg, #f2f7fa 0%, #deebf3 100%);
    box-shadow:
      0 14px 28px rgba(41, 65, 85, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.75);
  }
}
</style>