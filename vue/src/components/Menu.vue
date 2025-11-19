<template>
  <div class="Menu">
    <h1>ТЕТРИС</h1>
    <br />
    <button class="Button" @click="$emit('start')">
      Начать игру
    </button>
  </div>
</template>

<script setup>
defineEmits(['start'])
</script>

<style scoped>
.Menu {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  z-index: 100;
  padding: 20px;
  box-sizing: border-box;
}

.Menu h1 {
  font-size: 4em;
  margin-bottom: 0.5em;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.Button {
  padding: 1.5em 3em;
  font-size: 2em;
  border-radius: 20px;
  border: none;
  box-shadow: rgba(0, 0, 0, 0.5) 0px 0px 60px;
  cursor: pointer;
  background: linear-gradient(145deg, #ffff6b, #ee5a24);
  color: white;
  font-weight: bold;
  transition: all 0.3s ease;
  min-width: 280px;
}

.Button:hover {
  transform: translateY(-2px);
  box-shadow: rgba(0, 0, 0, 0.6) 0px 0px 80px;
}

.Button:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .Menu h1 {
    font-size: 3em;
  }

  .Button {
    font-size: 1.7em;
    padding: 1.2em 2.4em;
    min-width: 240px;
  }
}

@media (max-width: 480px) {
  .Menu {
    min-height: 40vh;
    padding: 15px;
  }

  .Menu h1 {
    font-size: 2.5em;
  }

  .Button {
    font-size: 1.4em;
    padding: 1em 2em;
    min-width: 200px;
  }
}
</style>