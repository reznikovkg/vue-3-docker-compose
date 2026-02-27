<template>
  <div class="notification">
    <div class="notification__content">
      <div class="notification__message">{{ message }}</div>

      <button class="notification__button" @click="() => handleAction()">
        Закрыть
      </button>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['action'])
const props = defineProps(['message'])

const handleAction = () => {
  emit('action')
}
</script>

<style scoped>
.notification {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2000;
}

.notification__content {
  background: rgba(26, 26, 26, 0.95);
  border-radius: 20px;
  padding: 30px 50px;
  min-width: 350px;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.notification__message {
  color: white;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
}

.notification__button {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 10px 30px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
}
</style>