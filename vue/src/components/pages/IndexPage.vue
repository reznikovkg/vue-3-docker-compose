<template>
  <div class="index">
    <img
      class="index__bg"
      src="/images/7a25f234b30ff45a2defdf8c169dcfe3.jpg"
      alt="фон"
    >
    <div class="index__content">
      <div class="index__title">Русская рыбалка</div>
      <button
        class="index__button"
        @click="() => go()"
      >
        На рыбалку
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IndexPage',
  methods: {
    go() {
      this.$router.push({ name: this.$routes.LOCATIONS })
    }
  }
}
</script>

<style scoped lang="scss">
.index {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  &__bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  &__content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 30px;
    align-items: center;
  }
  &__title {
    font-size: 42px;
    color: white;
    font-weight: bold;
  }
  &__button {
    padding: 12px 30px;
    font-size: 20px;
    border-radius: 20px;
    border: none;
    cursor: pointer;
  }
}
</style>
