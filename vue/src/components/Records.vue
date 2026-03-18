<template>
  <div class="puzzle__records">
    <div class="puzzle__records-title">Рекорды</div>
    <div v-for="(rec, idx) in records" :key="idx" class="puzzle__record-item">
      {{ rec.size }}x{{ rec.size }} - {{ formatTime(rec.time) }} - {{ rec.moves }} ходов
    </div>
  </div>
</template>
<script>
export default {
  name: 'Records',
  props: {
    records: Array,
    formatTime: Function
  }
}
</script>
<style scoped lang="scss">
.puzzle__records {
  margin-top: 30px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 12px;
  &-title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #333;
  }
  &-item {
    padding: 8px;
    background: white;
    border-radius: 6px;
    margin-bottom: 5px;
    font-size: 14px;
  }
}
</style>