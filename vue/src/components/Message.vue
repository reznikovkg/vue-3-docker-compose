<template>
  <div v-if="message" class="notification" @click="() => close()">
    {{ message }}
  </div>
</template>

<script setup>
const props = defineProps(['message'])
const emits = defineEmits(['close'])

const close = () => emits('close')
</script>

<style scoped>
.notification {
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: black;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 14px;
  z-index: 1000;
  cursor: pointer;
  max-width: 90%;
  text-align: center;
  border: 1px solid #444;
}
</style>