<template>
  <div class="card" @click="() => $emit('select', name)">
    <div class="card__icon">{{ icon }}</div>
    <div class="card__name">{{ name }}</div>
  </div>
</template>

<script>
export default {
  name: 'ElementCard',
  props: {
    name: String
  },
  computed: {
    icon() {
      const icons = {
        fire: '🔥',
        water: '💧',
        earth: '🌍',
        air: '🌪',
        steam: '☁️',
        mud: '🟫',
        lava: '🌋'
      }
      return icons[this.name] || '✨'
    }
  }
}
</script>

<style scoped>
.card {
  background: linear-gradient(135deg, #ffffff, #f0f0f0);
  color: #222;
  border-radius: 16px;
  padding: 15px;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0,0,0,0.25);
  transition: 0.2s;
}

.card:hover {
  transform: translateY(-5px);
  background: linear-gradient(135deg, #e0e0e0, #d0d0d0);
}

.card__icon {
  font-size: 32px;
  margin-bottom: 5px;
}

.card__name {
  font-weight: bold;
  font-size: 16px;
}
</style>