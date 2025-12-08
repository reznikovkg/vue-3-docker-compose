<template>
  <div class="menu">
    <h1>ТЕТРИС</h1>
    <br />
    <div class="menu-buttons">
      <button class="button" @click="() => handleStart()">
       Начать игру
      </button>
      <button class="button button--secondary" @click="() => handleOpenEditor()">
       Редактор фигур
      </button>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['start', 'openEditor'])

const handleStart = () => {
  emit('start')
}

const handleOpenEditor = () => {
  emit('openEditor')
}
</script>

<style lang="scss" scoped>
$button-gradient: linear-gradient(145deg, #ffff6b, #ee5a24);
$button-secondary-gradient: linear-gradient(145deg, #3273dc, #5e72e4);

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

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 350px;
}

.button {
  padding: 1.5em 3em;
  font-size: 1.8em;
  border-radius: 20px;
  border: none;
  box-shadow: rgba(0, 0, 0, 0.5) 0px 0px 60px;
  cursor: pointer;
  background: $button-gradient;
  color: white;
  font-weight: bold;
  transition: all 0.3s ease;
  width: 100%;

  &:hover {
    transform: translateY(-2px);
    box-shadow: rgba(0, 0, 0, 0.6) 0px 0px 80px;
  }

  &:active {
    transform: translateY(0);
  }

  &.button--secondary {
    background: $button-secondary-gradient;
    font-size: 1.5em;
  }
}

@media (max-width: 768px) {
  .menu h1 {
    font-size: 3em;
  }

  .button {
    font-size: 1.5em;
    padding: 1.2em 2.4em;

    &.button--secondary {
      font-size: 1.3em;
    }
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
    font-size: 1.2em;
    padding: 1em 2em;

    &.button-secondary {
      font-size: 1.1em;
    }
  }
}
</style>