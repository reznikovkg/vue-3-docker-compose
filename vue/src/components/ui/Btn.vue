<template>
  <button class="btn">
    <slot>
      Кнопка
    </slot>
  </button>
</template>

<script>
export default {
  name: "Btn"
}
</script>

<style scoped lang="scss">
.btn {
  border:none;
  background: cadetblue;
  color: #181818;
  font-size:18px;
  padding: 10px 20px;
}
</style>