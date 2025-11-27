<template>
  <div class="menu">
    <h1>ТЕТРИС</h1>
    <br />
    <button class="button" @click="$emit('start')">
      Начать игру
    </button>
  </div>
</template>

<script setup>
defineEmits(['start'])
</script>

<style lang="scss" scoped>
$button-gradient: linear-gradient(145deg, #ffff6b, #ee5a24);

.menu {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  z-index: 100;
  padding: 20px;
  box-sizing: border-box;

  h1 {
    font-size: 4em;
    margin-bottom: 0.5em;
    text-align: center;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }
}

.button {
  padding: 1.5em 3em;
  font-size: 2em;
  border-radius: 20px;
  border: none;
  box-shadow: rgba(0, 0, 0, 0.5) 0px 0px 60px;
  cursor: pointer;
  background: $button-gradient;
  color: white;
  font-weight: bold;
  transition: all 0.3s ease;
  min-width: 280px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: rgba(0, 0, 0, 0.6) 0px 0px 80px;
  }

  &:active {
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .menu h1 {
    font-size: 3em;
  }

  .button {
    font-size: 1.7em;
    padding: 1.2em 2.4em;
    min-width: 240px;
  }
}

@media (max-width: 480px) {
  .menu {
    min-height: 40vh;
    padding: 15px;
  }

  .menu h1 {
    font-size: 2.5em;
  }

  .button {
    font-size: 1.4em;
    padding: 1em 2em;
    min-width: 200px;
  }
}
</style>