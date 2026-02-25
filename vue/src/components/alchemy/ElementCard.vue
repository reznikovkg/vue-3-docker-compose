<template>
  <div class="card" @click="() => $emit('select', name)">
    <div class="card__name">{{ name }}</div>
  </div>
</template>

<script>
export default {
  name: 'ElementCard',
  props: { name: String }
}
</script>

<style scoped>
.card {
  background: #f7f7f7;
  color: #222;
  border-radius: 12px;
  padding: 20px;
  min-height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0,0,0,0.25);
  transition: 0.2s;
}

.card:hover {
  transform: translateY(-5px);
  background: #e0e0e0;
}

.card__name {
  font-weight: bold;
  font-size: 18px;
}
</style>