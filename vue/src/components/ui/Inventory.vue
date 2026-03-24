<template>
  <div class="inventory">
    <div class="inventory__title">Inventory</div>
    <div class="inventory__grid">
      <div 
        v-for="(fish, index) in caughtFish" 
        :key="index" 
        class="inventory__item"
        :title="fish.name"
      >
        <img :src="fish.icon" :alt="fish.name" class="inventory__item-icon" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Inventory',
  data() {
    return {
    }
  },
  computed:{
    caughtFish(){
        return this.$store.state.ownedFish
    }
  }
}
</script>

<style scoped>
.inventory {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  width: 200px;
  background: rgba(0, 0, 0, 0.6);
  padding: 10px;
  border-radius: 8px;
  color: white;
  user-select: none;
}

.inventory__title {
  text-align: center;
  font-weight: bold;
  margin-bottom: 8px;
}

.inventory__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 6px;
}

.inventory__item {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.inventory__item-icon {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>