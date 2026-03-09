<template>
  <div class="minigame">
    <div class="minigame__title">
      Мини-игра
    </div>

    <span class="minigame__invite">Нажмите ПРОБЕЛ чтобы начать</span>
  </div>
</template>

<script setup>

</script>

<style scoped>
.minigame {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;

  width: 300px;

  padding: 18px;
  background-color: rgb(200, 200, 200);
  border: 8px dashed rgb(10, 10, 100);
  box-shadow: 0 4px 10px rgb(0, 0, 0);
  left: 20px;
}

.minigame__title {
  color: rgb(10, 10, 100);
  font-size: 24px;
  font-style: bold;
}

.minigame__invite {
  color: rgb(10, 10, 100);
  font-size: 16px;
  font-style: italic;
}
</style>
